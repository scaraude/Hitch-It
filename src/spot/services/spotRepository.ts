import { logger } from '@/utils';
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
	logger.repository.debug('Fetching all spots');
	try {
		const database = await getDatabase();
		const [result] = await database.executeSql(
			'SELECT * FROM spots ORDER BY created_at DESC;'
		);
		const rows = result.rows.raw() as SpotRow[];
		const spots = rows.map(mapRowToSpot);
		logger.repository.info('Spots fetched successfully', {
			count: spots.length,
		});
		return spots;
	} catch (error) {
		logger.repository.error('Failed to fetch spots', error);
		throw error;
	}
};

export const getSpotById = async (id: string): Promise<Spot | null> => {
	logger.repository.debug('Fetching spot by ID', { id });
	try {
		const database = await getDatabase();
		const [result] = await database.executeSql(
			'SELECT * FROM spots WHERE id = ? LIMIT 1;',
			[id]
		);
		if (result.rows.length === 0) {
			logger.repository.info('Spot not found', { id });
			return null;
		}
		const spot = mapRowToSpot(result.rows.item(0) as SpotRow);
		logger.repository.info('Spot fetched successfully', { id });
		return spot;
	} catch (error) {
		logger.repository.error('Failed to fetch spot by ID', error, { id });
		throw error;
	}
};

export const createSpot = async (spot: Spot): Promise<void> => {
	logger.repository.info('Creating new spot', {
		id: spot.id,
		roadName: spot.roadName,
		direction: spot.direction,
	});
	try {
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
		logger.repository.info('Spot created successfully', { id: spot.id });
	} catch (error) {
		logger.repository.error('Failed to create spot', error, { id: spot.id });
		throw error;
	}
};

export const updateSpot = async (spot: Spot): Promise<void> => {
	logger.repository.info('Updating spot', { id: spot.id });
	try {
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
		logger.repository.info('Spot updated successfully', { id: spot.id });
	} catch (error) {
		logger.repository.error('Failed to update spot', error, { id: spot.id });
		throw error;
	}
};

export const deleteSpot = async (id: string): Promise<void> => {
	logger.repository.info('Deleting spot', { id });
	try {
		const database = await getDatabase();
		await database.executeSql('DELETE FROM spots WHERE id = ?;', [id]);
		logger.repository.info('Spot deleted successfully', { id });
	} catch (error) {
		logger.repository.error('Failed to delete spot', error, { id });
		throw error;
	}
};
