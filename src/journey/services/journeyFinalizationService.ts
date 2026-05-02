import { logger } from '../../utils';
import {
	type CachedJourneyId,
	type CachedJourneyPoint,
	type Journey,
	type JourneyRoutePoint,
	JourneyStatus,
	type UserId,
} from '../types';
import { finalize, type StoppedState } from './journeyCache/cachedJourneyState';
import { deleteNavigationSessionForJourney } from './journeyCache/cachedNavigationRepository';
import { cachedIdAsJourneyId } from './journeyCache/ids';
import {
	getCachedJourneyWithPoints,
	getStoppedNonFinalized,
	saveState,
	setLastFinalizeError,
} from './journeyCache/journeyCacheRepository';
import { saveJourney } from './journeyRepository';

const buildJourneyFromCache = (
	state: StoppedState,
	points: CachedJourneyPoint[]
): Journey => {
	const routePolyline: JourneyRoutePoint[] = points.map(point => ({
		latitude: point.latitude,
		longitude: point.longitude,
	}));

	return {
		id: cachedIdAsJourneyId(state.id),
		userId: state.userId,
		status: JourneyStatus.Completed,
		startedAt: state.startedAt,
		endedAt: state.stoppedAt,
		points: [],
		routePolyline: routePolyline.length > 0 ? routePolyline : undefined,
	};
};

interface FinalizeOptions {
	state?: StoppedState;
	points?: CachedJourneyPoint[];
}

/**
 * Persist a stopped cached journey into Supabase as the canonical Journey
 * row, then mark the cache as finalized. saveJourney UPSERTs by id so a
 * retry after partial failure doesn't duplicate.
 *
 * Callers may pass a pre-loaded state + points to skip the SQLite read
 * (the common case from stopRecording, which just transitioned the cache
 * itself).
 *
 * On Supabase failure the cache is left in 'stopped' state with
 * last_finalize_error set, so retryPendingFinalizations can pick it up
 * on the next boot.
 */
export const finalizeCachedJourney = async (
	cacheId: CachedJourneyId,
	options: FinalizeOptions = {}
): Promise<Journey> => {
	let state = options.state;
	let points = options.points;

	if (!state || !points) {
		const cached = await getCachedJourneyWithPoints(cacheId);
		if (!cached) {
			throw new Error(`Cached journey ${cacheId} not found`);
		}
		if (cached.state.status !== 'stopped') {
			throw new Error(
				`Cached journey ${cacheId} cannot be finalized in status '${cached.state.status}'`
			);
		}
		state = cached.state;
		points = cached.points;
	}

	const journey = buildJourneyFromCache(state, points);

	try {
		await saveJourney(journey);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		await setLastFinalizeError(cacheId, message);
		logger.journey.error('Finalization Supabase write failed', error, {
			cacheId,
		});
		throw error;
	}

	await Promise.all([
		saveState(finalize(state, new Date())),
		setLastFinalizeError(cacheId, null),
		deleteNavigationSessionForJourney(cacheId),
	]);

	logger.journey.info('Cached journey finalized', { cacheId });
	return journey;
};

/**
 * Boot-time pass: walk every stopped non-finalized cache for the user and
 * try to finalize it. Failures don't abort the loop, so a single broken
 * cache can't block the others. Returns IDs still pending after the pass.
 */
export const retryPendingFinalizations = async (
	userId: UserId
): Promise<CachedJourneyId[]> => {
	const pending = await getStoppedNonFinalized(userId);
	if (pending.length === 0) return [];

	logger.journey.info('Retrying pending finalizations', {
		count: pending.length,
	});

	const stillPending: CachedJourneyId[] = [];

	for (const state of pending) {
		try {
			await finalizeCachedJourney(state.id);
		} catch (error) {
			logger.journey.warn('Pending finalization retry failed', {
				cacheId: state.id,
				error: error instanceof Error ? error.message : String(error),
			});
			stillPending.push(state.id);
		}
	}

	return stillPending;
};
