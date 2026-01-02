import type { Spot } from '../types';
import { createSpotId } from '../utils';
import { getDatabase } from './database';

type SpotRow = {
	id: string;
	latitude: number;
	longitude: number;
	road_name: string;
	appreciation: string;
	direction: string;
	destinations: string;
	created_at: string;
	updated_at: string;
	created_by: string;
};

const mapRowToSpot = (row: SpotRow): Spot => ({
	id: createSpotId(row.id),
	coordinates: {
		latitude: row.latitude,
		longitude: row.longitude,
	},
	roadName: row.road_name,
	appreciation: row.appreciation as Spot['appreciation'],
	direction: row.direction as Spot['direction'],
	destinations: JSON.parse(row.destinations) as string[],
	createdAt: new Date(row.created_at),
	updatedAt: new Date(row.updated_at),
	createdBy: row.created_by,
});

export const getAllSpots = async (): Promise<Spot[]> => {
	const database = await getDatabase();
	const [result] = await database.executeSql(
		'SELECT * FROM spots ORDER BY created_at DESC;'
	);
	const rows = result.rows.raw() as SpotRow[];
	return rows.map(mapRowToSpot);
};

export const getSpotById = async (id: string): Promise<Spot | null> => {
	const database = await getDatabase();
	const [result] = await database.executeSql(
		'SELECT * FROM spots WHERE id = ? LIMIT 1;',
		[id]
	);
	if (result.rows.length === 0) {
		return null;
	}
	return mapRowToSpot(result.rows.item(0) as SpotRow);
};

export const createSpot = async (spot: Spot): Promise<void> => {
	const database = await getDatabase();
	await database.executeSql(
		`INSERT INTO spots (
			id,
			latitude,
			longitude,
			road_name,
			appreciation,
			direction,
			destinations,
			created_at,
			updated_at,
			created_by
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
		[
			spot.id,
			spot.coordinates.latitude,
			spot.coordinates.longitude,
			spot.roadName,
			spot.appreciation,
			spot.direction,
			JSON.stringify(spot.destinations),
			spot.createdAt.toISOString(),
			spot.updatedAt.toISOString(),
			spot.createdBy,
		]
	);
};

export const updateSpot = async (spot: Spot): Promise<void> => {
	const database = await getDatabase();
	await database.executeSql(
		`UPDATE spots
			SET latitude = ?,
				longitude = ?,
				road_name = ?,
				appreciation = ?,
				direction = ?,
				destinations = ?,
				updated_at = ?,
				created_by = ?
			WHERE id = ?;`,
		[
			spot.coordinates.latitude,
			spot.coordinates.longitude,
			spot.roadName,
			spot.appreciation,
			spot.direction,
			JSON.stringify(spot.destinations),
			spot.updatedAt.toISOString(),
			spot.createdBy,
			spot.id,
		]
	);
};

export const deleteSpot = async (id: string): Promise<void> => {
	const database = await getDatabase();
	await database.executeSql('DELETE FROM spots WHERE id = ?;', [id]);
};
