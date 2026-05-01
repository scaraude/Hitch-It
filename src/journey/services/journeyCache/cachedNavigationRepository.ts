import * as Crypto from 'expo-crypto';
import { logger } from '../../../utils';
import type {
	CachedJourneyId,
	CachedNavigationSession,
	CachedNavigationSessionId,
} from '../../types';
import { getJourneyCacheDb } from './journeyCacheDb';

interface NavSessionRow {
	id: string;
	cached_journey_id: string;
	origin_lat: number;
	origin_lng: number;
	origin_name: string | null;
	destination_lat: number;
	destination_lng: number;
	destination_name: string | null;
	created_at: string;
}

const fromNavRow = (row: NavSessionRow): CachedNavigationSession => ({
	id: row.id as CachedNavigationSessionId,
	cachedJourneyId: row.cached_journey_id as CachedJourneyId,
	originLatitude: row.origin_lat,
	originLongitude: row.origin_lng,
	originName: row.origin_name ?? undefined,
	destinationLatitude: row.destination_lat,
	destinationLongitude: row.destination_lng,
	destinationName: row.destination_name ?? undefined,
	createdAt: new Date(row.created_at),
});

export interface CreateNavigationSessionInput {
	cachedJourneyId: CachedJourneyId;
	origin: { latitude: number; longitude: number; name?: string };
	destination: { latitude: number; longitude: number; name?: string };
}

/**
 * UPSERT a navigation session for the active cached journey. Only one
 * session per journey is kept — re-launching navigation overwrites the
 * existing row.
 */
export const saveNavigationSession = async (
	input: CreateNavigationSessionInput
): Promise<CachedNavigationSession> => {
	const db = await getJourneyCacheDb();

	const existing = await db.getFirstAsync<NavSessionRow>(
		'SELECT * FROM cached_navigation_session WHERE cached_journey_id = ?',
		input.cachedJourneyId as string
	);

	const id = (existing?.id ?? Crypto.randomUUID()) as CachedNavigationSessionId;
	const createdAt = existing ? new Date(existing.created_at) : new Date();

	await db.runAsync(
		`INSERT INTO cached_navigation_session
		   (id, cached_journey_id, origin_lat, origin_lng, origin_name,
		    destination_lat, destination_lng, destination_name, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		 ON CONFLICT(id) DO UPDATE SET
		   origin_lat = excluded.origin_lat,
		   origin_lng = excluded.origin_lng,
		   origin_name = excluded.origin_name,
		   destination_lat = excluded.destination_lat,
		   destination_lng = excluded.destination_lng,
		   destination_name = excluded.destination_name`,
		id as string,
		input.cachedJourneyId as string,
		input.origin.latitude,
		input.origin.longitude,
		input.origin.name ?? null,
		input.destination.latitude,
		input.destination.longitude,
		input.destination.name ?? null,
		createdAt.toISOString()
	);

	logger.navigation.info('Cached navigation session saved', {
		id,
		cachedJourneyId: input.cachedJourneyId,
		destination: input.destination.name,
	});

	return {
		id,
		cachedJourneyId: input.cachedJourneyId,
		originLatitude: input.origin.latitude,
		originLongitude: input.origin.longitude,
		originName: input.origin.name,
		destinationLatitude: input.destination.latitude,
		destinationLongitude: input.destination.longitude,
		destinationName: input.destination.name,
		createdAt,
	};
};

export const getNavigationSessionForJourney = async (
	cachedJourneyId: CachedJourneyId
): Promise<CachedNavigationSession | null> => {
	const db = await getJourneyCacheDb();
	const row = await db.getFirstAsync<NavSessionRow>(
		'SELECT * FROM cached_navigation_session WHERE cached_journey_id = ?',
		cachedJourneyId as string
	);
	return row ? fromNavRow(row) : null;
};

export const deleteNavigationSessionForJourney = async (
	cachedJourneyId: CachedJourneyId
): Promise<void> => {
	const db = await getJourneyCacheDb();
	await db.runAsync(
		'DELETE FROM cached_navigation_session WHERE cached_journey_id = ?',
		cachedJourneyId as string
	);
};
