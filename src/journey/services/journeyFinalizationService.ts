import { logger } from '../../utils';
import {
	type CachedJourneyId,
	type CachedJourneyPoint,
	type Journey,
	type JourneyId,
	type JourneyRoutePoint,
	JourneyStatus,
	type UserId,
} from '../types';
import { finalize, type StoppedState } from './journeyCache/cachedJourneyState';
import { deleteNavigationSessionForJourney } from './journeyCache/cachedNavigationRepository';
import {
	getCachedJourneyWithPoints,
	getStoppedNonFinalized,
	saveState,
	setLastFinalizeError,
} from './journeyCache/journeyCacheRepository';
import { saveJourney } from './journeyRepository';

const cacheIdAsJourneyId = (id: CachedJourneyId): JourneyId =>
	id as unknown as JourneyId;

const buildJourneyFromCache = (
	state: StoppedState,
	points: CachedJourneyPoint[]
): Journey => {
	const routePolyline: JourneyRoutePoint[] = points.map(point => ({
		latitude: point.latitude,
		longitude: point.longitude,
	}));

	return {
		id: cacheIdAsJourneyId(state.id),
		userId: state.userId,
		status: JourneyStatus.Completed,
		startedAt: state.startedAt,
		endedAt: state.stoppedAt,
		points: [],
		routePolyline: routePolyline.length > 0 ? routePolyline : undefined,
	};
};

class CacheNotFoundError extends Error {
	constructor(cacheId: CachedJourneyId) {
		super(`Cached journey ${cacheId} not found`);
		this.name = 'CacheNotFoundError';
	}
}

class CacheNotReadyForFinalizationError extends Error {
	constructor(cacheId: CachedJourneyId, status: string) {
		super(
			`Cached journey ${cacheId} cannot be finalized in status '${status}' — must be 'stopped' or 'finalized' (idempotent)`
		);
		this.name = 'CacheNotReadyForFinalizationError';
	}
}

/**
 * Persist a stopped cached journey into Supabase as the canonical Journey
 * row, then mark the cache as finalized. Idempotent: a finalized cache
 * short-circuits and a stopped cache is upserted (saveJourney UPSERTs by
 * id, so retries don't duplicate).
 *
 * On failure the cache is left in 'stopped' state with last_finalize_error
 * set so the next retryPendingFinalizations pass can pick it up again.
 */
export const finalizeCachedJourney = async (
	cacheId: CachedJourneyId
): Promise<Journey> => {
	const cached = await getCachedJourneyWithPoints(cacheId);
	if (!cached) {
		throw new CacheNotFoundError(cacheId);
	}

	const { state, points } = cached;

	if (state.status === 'finalized') {
		logger.journey.info('Cache already finalized, skipping', { cacheId });
		return buildJourneyFromCache({ ...state, status: 'stopped' }, points);
	}

	if (state.status !== 'stopped') {
		throw new CacheNotReadyForFinalizationError(cacheId, state.status);
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

	await saveState(finalize(state, new Date()));
	await setLastFinalizeError(cacheId, null);
	await deleteNavigationSessionForJourney(cacheId);

	logger.journey.info('Cached journey finalized', { cacheId });
	return journey;
};

/**
 * Boot-time pass: walk every stopped non-finalized cache for the user and
 * try to finalize it. Failures are logged but don't abort the loop, so a
 * single broken cache can't block others.
 *
 * Returns the IDs that are still pending after the pass — callers can
 * surface a "retry" UI when this list is non-empty.
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

export { CacheNotFoundError, CacheNotReadyForFinalizationError };
