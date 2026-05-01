import * as SQLite from 'expo-sqlite';
import { logger } from '../../../utils';

const DB_NAME = 'journey_cache.db';
const SCHEMA_VERSION = 1;

/**
 * Schema for the local live-recording cache.
 *
 * Status integrity is guaranteed in code (cachedJourneyState.ts) — the SQL
 * schema stays minimal so the schema version can stay stable as the state
 * machine evolves.
 */
const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS cached_journeys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  stopped_at TEXT,
  finalized_at TEXT,
  last_finalize_error TEXT
);

CREATE INDEX IF NOT EXISTS cached_journeys_user_status_idx
  ON cached_journeys(user_id, status);

CREATE TABLE IF NOT EXISTS cached_journey_points (
  cache_id TEXT NOT NULL REFERENCES cached_journeys(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timestamp TEXT NOT NULL,
  speed REAL,
  accuracy REAL,
  PRIMARY KEY (cache_id, seq)
);

CREATE TABLE IF NOT EXISTS cached_navigation_session (
  id TEXT PRIMARY KEY,
  cached_journey_id TEXT NOT NULL REFERENCES cached_journeys(id) ON DELETE CASCADE,
  origin_lat REAL NOT NULL,
  origin_lng REAL NOT NULL,
  origin_name TEXT,
  destination_lat REAL NOT NULL,
  destination_lng REAL NOT NULL,
  destination_name TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS cached_navigation_session_journey_idx
  ON cached_navigation_session(cached_journey_id);
`;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
	logger.journey.info('Opening journey cache database', { name: DB_NAME });
	const db = await SQLite.openDatabaseAsync(DB_NAME);

	await db.execAsync(SCHEMA_SQL);
	await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);

	logger.journey.info('Journey cache database ready', {
		schemaVersion: SCHEMA_VERSION,
	});
	return db;
};

/**
 * Returns the singleton SQLite handle for the journey cache. Cached so all
 * repositories share one connection and one prepared-statement compilation.
 */
export const getJourneyCacheDb = (): Promise<SQLite.SQLiteDatabase> => {
	if (!dbPromise) {
		dbPromise = initializeDatabase().catch(error => {
			dbPromise = null;
			throw error;
		});
	}
	return dbPromise;
};

/**
 * Test/debug only — discards the cached connection so the next caller
 * re-opens the DB. Not meant for production code.
 */
export const _resetJourneyCacheDbForTests = (): void => {
	dbPromise = null;
};
