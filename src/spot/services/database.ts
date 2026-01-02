import SQLite, { type SQLiteDatabase } from 'react-native-sqlite-storage';

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
		database.transaction(
			transaction => {
				for (const statement of statements) {
					transaction.executeSql(statement);
				}
			},
			error => reject(error),
			() => resolve()
		);
	});

const getUserVersion = async (database: SQLiteDatabase): Promise<number> => {
	const [result] = await database.executeSql('PRAGMA user_version;');
	const row = result.rows.item(0) as { user_version?: number } | undefined;
	return row?.user_version ?? 0;
};

const runMigrations = async (database: SQLiteDatabase): Promise<void> => {
	let currentVersion = await getUserVersion(database);

	for (const migration of MIGRATIONS) {
		if (migration.version <= currentVersion) {
			continue;
		}

		await runStatements(database, migration.statements);
		await database.executeSql(`PRAGMA user_version = ${migration.version};`);
		currentVersion = migration.version;
	}
};

export const getDatabase = async (): Promise<SQLiteDatabase> => {
	if (!databasePromise) {
		databasePromise = SQLite.openDatabase({
			name: DB_NAME,
			location: 'default',
		}).then(async database => {
			await runMigrations(database);
			return database;
		});
	}

	return databasePromise;
};
