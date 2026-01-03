import SQLite, { type SQLiteDatabase } from 'react-native-sqlite-storage';
import { logger } from '@/utils';

SQLite.enablePromise(true);

const DB_NAME = 'hitch_it.db';

type Migration = {
	version: number;
	statements: string[];
};

const MIGRATIONS: Migration[] = [
	{
		version: 1,
		statements: [
			`CREATE TABLE IF NOT EXISTS spots (
				id TEXT PRIMARY KEY,
				latitude REAL NOT NULL,
				longitude REAL NOT NULL,
				road_name TEXT NOT NULL,
				appreciation TEXT NOT NULL,
				direction TEXT NOT NULL,
				destinations TEXT NOT NULL,
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL,
				created_by TEXT NOT NULL
			);`,
		],
	},
];

let databasePromise: Promise<SQLiteDatabase> | null = null;

const runStatements = async (
	database: SQLiteDatabase,
	statements: string[]
): Promise<void> =>
	new Promise((resolve, reject) => {
		logger.database.debug('Running database statements', {
			count: statements.length,
		});
		database.transaction(
			transaction => {
				for (const statement of statements) {
					logger.database.debug('Executing SQL statement', { statement });
					transaction.executeSql(statement);
				}
			},
			error => {
				logger.database.error('Transaction failed', error);
				reject(error);
			},
			() => {
				logger.database.debug('Transaction completed successfully');
				resolve();
			}
		);
	});

const getUserVersion = async (database: SQLiteDatabase): Promise<number> => {
	logger.database.debug('Getting database version');
	const [result] = await database.executeSql('PRAGMA user_version;');
	const row = result.rows.item(0) as { user_version?: number } | undefined;
	const version = row?.user_version ?? 0;
	logger.database.debug('Database version retrieved', { version });
	return version;
};

const runMigrations = async (database: SQLiteDatabase): Promise<void> => {
	let currentVersion = await getUserVersion(database);
	logger.database.info('Starting database migrations', {
		currentVersion,
		latestVersion: MIGRATIONS[MIGRATIONS.length - 1]?.version ?? 0,
	});

	for (const migration of MIGRATIONS) {
		if (migration.version <= currentVersion) {
			logger.database.debug('Skipping migration', {
				version: migration.version,
				reason: 'Already applied',
			});
			continue;
		}

		logger.database.info('Applying migration', {
			version: migration.version,
			statementsCount: migration.statements.length,
		});
		await runStatements(database, migration.statements);
		await database.executeSql(`PRAGMA user_version = ${migration.version};`);
		currentVersion = migration.version;
		logger.database.info('Migration applied successfully', {
			version: migration.version,
		});
	}

	logger.database.info('Database migrations completed', {
		finalVersion: currentVersion,
	});
};

export const getDatabase = async (): Promise<SQLiteDatabase> => {
	if (!databasePromise) {
		logger.database.info('Opening database', { name: DB_NAME });
		databasePromise = SQLite.openDatabase({
			name: DB_NAME,
			location: 'default',
		})
			.then(async database => {
				logger.database.info('Database opened successfully');
				await runMigrations(database);
				logger.database.info('Database ready');
				return database;
			})
			.catch(error => {
				logger.database.error('Failed to open database', error, {
					name: DB_NAME,
				});
				databasePromise = null;
				throw error;
			});
	}

	return databasePromise;
};
