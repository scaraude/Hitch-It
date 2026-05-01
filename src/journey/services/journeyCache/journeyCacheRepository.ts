import * as Crypto from 'expo-crypto';
import { logger } from '../../../utils';
import type {
	CachedJourneyId,
	CachedJourneyPoint,
	LocationUpdate,
	UserId,
} from '../../types';
import {
	type CachedJourneyRow,
	type CachedJourneyState,
	fromRow,
	startRecording,
	toRow,
} from './cachedJourneyState';
import { getJourneyCacheDb } from './journeyCacheDb';

interface PointRow {
	cache_id: string;
	seq: number;
	latitude: number;
	longitude: number;
	timestamp: string;
	speed: number | null;
	accuracy: number | null;
}

const toPointRow = (
	cacheId: CachedJourneyId,
	seq: number,
	point: LocationUpdate
): PointRow => ({
	cache_id: cacheId as string,
	seq,
	latitude: point.latitude,
	longitude: point.longitude,
	timestamp: point.timestamp.toISOString(),
	speed: point.speed ?? null,
	accuracy: point.accuracy ?? null,
});

const fromPointRow = (row: PointRow): CachedJourneyPoint => ({
	cacheId: row.cache_id as CachedJourneyId,
	seq: row.seq,
	latitude: row.latitude,
	longitude: row.longitude,
	timestamp: new Date(row.timestamp),
	speed: row.speed ?? undefined,
	accuracy: row.accuracy ?? undefined,
});

/**
 * Create a new cached journey in the 'recording' state and persist it.
 */
export const createCachedJourney = async (input: {
	userId: UserId;
	startedAt?: Date;
}): Promise<CachedJourneyState> => {
	const id = Crypto.randomUUID() as CachedJourneyId;
	const startedAt = input.startedAt ?? new Date();

	const state = startRecording({ id, userId: input.userId, startedAt });
	await saveState(state);

	logger.journey.info('Cached journey created', { id });
	return state;
};

/**
 * UPSERT a state into cached_journeys. The only allowed mutation path —
 * callers obtain the new state via the transition functions in
 * cachedJourneyState.ts.
 */
export const saveState = async (state: CachedJourneyState): Promise<void> => {
	const db = await getJourneyCacheDb();
	const row = toRow(state);

	await db.runAsync(
		`INSERT INTO cached_journeys (id, user_id, status, started_at, stopped_at, finalized_at)
		 VALUES (?, ?, ?, ?, ?, ?)
		 ON CONFLICT(id) DO UPDATE SET
		   status = excluded.status,
		   stopped_at = excluded.stopped_at,
		   finalized_at = excluded.finalized_at`,
		row.id,
		row.user_id,
		row.status,
		row.started_at,
		row.stopped_at,
		row.finalized_at
	);
};

/**
 * The active cache for a user is the unique row in 'recording' or 'paused'
 * state. Returns null if none exists.
 */
export const getActiveCachedJourney = async (
	userId: UserId
): Promise<CachedJourneyState | null> => {
	const db = await getJourneyCacheDb();
	const row = await db.getFirstAsync<CachedJourneyRow>(
		`SELECT id, user_id, status, started_at, stopped_at, finalized_at
		 FROM cached_journeys
		 WHERE user_id = ? AND status IN ('recording', 'paused')
		 ORDER BY started_at DESC
		 LIMIT 1`,
		userId as string
	);

	if (!row) return null;
	return fromRow(row);
};

/**
 * Caches that have been stopped but not yet finalized — used at app boot
 * by the finalization service to retry pending writes.
 */
export const getStoppedNonFinalized = async (
	userId: UserId
): Promise<CachedJourneyState[]> => {
	const db = await getJourneyCacheDb();
	const rows = await db.getAllAsync<CachedJourneyRow>(
		`SELECT id, user_id, status, started_at, stopped_at, finalized_at
		 FROM cached_journeys
		 WHERE user_id = ? AND status = 'stopped'
		 ORDER BY stopped_at ASC`,
		userId as string
	);

	return rows.map(fromRow);
};

/**
 * Append GPS points in a single transaction. seq starts after the current
 * max for the cache so multiple appends preserve insertion order.
 */
export const appendLocationPoints = async (
	cacheId: CachedJourneyId,
	points: LocationUpdate[]
): Promise<void> => {
	if (points.length === 0) return;

	const db = await getJourneyCacheDb();
	const maxSeqRow = await db.getFirstAsync<{ max_seq: number | null }>(
		'SELECT MAX(seq) AS max_seq FROM cached_journey_points WHERE cache_id = ?',
		cacheId as string
	);
	const nextSeqStart = (maxSeqRow?.max_seq ?? -1) + 1;

	await db.withTransactionAsync(async () => {
		for (let i = 0; i < points.length; i += 1) {
			const row = toPointRow(cacheId, nextSeqStart + i, points[i]);
			await db.runAsync(
				`INSERT INTO cached_journey_points
				 (cache_id, seq, latitude, longitude, timestamp, speed, accuracy)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`,
				row.cache_id,
				row.seq,
				row.latitude,
				row.longitude,
				row.timestamp,
				row.speed,
				row.accuracy
			);
		}
	});
};

export const getCachedJourneyPoints = async (
	cacheId: CachedJourneyId
): Promise<CachedJourneyPoint[]> => {
	const db = await getJourneyCacheDb();
	const rows = await db.getAllAsync<PointRow>(
		`SELECT cache_id, seq, latitude, longitude, timestamp, speed, accuracy
		 FROM cached_journey_points
		 WHERE cache_id = ?
		 ORDER BY seq ASC`,
		cacheId as string
	);
	return rows.map(fromPointRow);
};

export const getCachedJourneyWithPoints = async (
	cacheId: CachedJourneyId
): Promise<{ state: CachedJourneyState; points: CachedJourneyPoint[] } | null> => {
	const db = await getJourneyCacheDb();
	const row = await db.getFirstAsync<CachedJourneyRow>(
		`SELECT id, user_id, status, started_at, stopped_at, finalized_at
		 FROM cached_journeys WHERE id = ?`,
		cacheId as string
	);
	if (!row) return null;
	const state = fromRow(row);
	const points = await getCachedJourneyPoints(cacheId);
	return { state, points };
};

export const setLastFinalizeError = async (
	cacheId: CachedJourneyId,
	error: string | null
): Promise<void> => {
	const db = await getJourneyCacheDb();
	await db.runAsync(
		'UPDATE cached_journeys SET last_finalize_error = ? WHERE id = ?',
		error,
		cacheId as string
	);
};

/**
 * Hard-delete a cache and all its points / nav session (FK CASCADE).
 */
export const deleteCachedJourney = async (
	cacheId: CachedJourneyId
): Promise<void> => {
	const db = await getJourneyCacheDb();
	await db.runAsync(
		'DELETE FROM cached_journeys WHERE id = ?',
		cacheId as string
	);
	logger.journey.info('Cached journey deleted', { id: cacheId });
};
