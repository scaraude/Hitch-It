import { supabase } from '@/lib/supabaseClient';
import type { MapBounds } from '@/types';
import {
	expandBounds,
	isFullyContained,
	isSpotInBounds,
	logger,
} from '@/utils';
import { Appreciation, Direction, type Spot } from '../types';
import { createSpotId } from '../utils';

type SpotRow = {
	id: string;
	latitude: number;
	longitude: number;
	road_name: string;
	appreciation: string;
	direction: string;
	destinations: string[] | null;
	created_at: string;
	updated_at: string;
	created_by: string;
};

const appreciationValues = new Set(Object.values(Appreciation));
const directionValues = new Set(Object.values(Direction));

const parseAppreciation = (
	value: string,
	spotId: string
): Spot['appreciation'] => {
	if (appreciationValues.has(value as Appreciation)) {
		return value as Spot['appreciation'];
	}

	throw new Error(`Invalid spot appreciation "${value}" for spot "${spotId}"`);
};

const parseDirection = (value: string, spotId: string): Spot['direction'] => {
	if (directionValues.has(value as Direction)) {
		return value as Spot['direction'];
	}

	throw new Error(`Invalid spot direction "${value}" for spot "${spotId}"`);
};

const parseDestinations = (destinations: SpotRow['destinations']): string[] => {
	if (!Array.isArray(destinations)) {
		return [];
	}

	return destinations.filter((destination): destination is string => {
		return typeof destination === 'string';
	});
};

const mapRowToSpot = (row: SpotRow): Spot => ({
	id: createSpotId(row.id),
	coordinates: {
		latitude: row.latitude,
		longitude: row.longitude,
	},
	roadName: row.road_name,
	appreciation: parseAppreciation(row.appreciation, row.id),
	direction: parseDirection(row.direction, row.id),
	destinations: parseDestinations(row.destinations),
	createdAt: new Date(row.created_at),
	updatedAt: new Date(row.updated_at),
	createdBy: row.created_by,
});

type CachedRegion = {
	bounds: MapBounds;
	spots: Spot[];
	fetchedAt: Date;
};

const cache: CachedRegion[] = [];
const CACHE_PADDING = 0.1;
const CACHE_TTL_MS = 60_000;
const MAX_CACHE_REGIONS = 12;

const pruneCache = () => {
	const oldestAllowed = Date.now() - CACHE_TTL_MS;

	for (let i = cache.length - 1; i >= 0; i--) {
		if (cache[i].fetchedAt.getTime() < oldestAllowed) {
			cache.splice(i, 1);
		}
	}

	if (cache.length > MAX_CACHE_REGIONS) {
		cache.splice(0, cache.length - MAX_CACHE_REGIONS);
	}
};

const clearSpotCache = () => {
	cache.length = 0;
};

export const getSpotsInBounds = async (bounds: MapBounds): Promise<Spot[]> => {
	logger.repository.debug('Fetching spots in bounds', {
		north: bounds.north,
		south: bounds.south,
		east: bounds.east,
		west: bounds.west,
	});

	pruneCache();

	const cachedRegion = cache.find(region =>
		isFullyContained(bounds, region.bounds)
	);

	if (cachedRegion) {
		logger.repository.debug('Cache hit - filtering from cached spots');
		const filteredSpots = cachedRegion.spots.filter(spot =>
			isSpotInBounds(spot.coordinates, bounds)
		);
		logger.repository.info('Spots filtered from cache', {
			count: filteredSpots.length,
		});
		return filteredSpots;
	}

	logger.repository.debug('Cache miss - fetching from database');
	try {
		const { data, error } = await supabase
			.from('spots')
			.select('*')
			.gte('latitude', bounds.south)
			.lte('latitude', bounds.north)
			.gte('longitude', bounds.west)
			.lte('longitude', bounds.east)
			.limit(1000);

		if (error) {
			throw error;
		}

		const spots = (data ?? []).map(row => mapRowToSpot(row as SpotRow));

		const expandedBounds = expandBounds(bounds, CACHE_PADDING);
		cache.push({
			bounds: expandedBounds,
			spots,
			fetchedAt: new Date(),
		});
		pruneCache();

		logger.repository.info('Spots fetched and cached', {
			count: spots.length,
			cacheSize: cache.length,
		});

		return spots;
	} catch (error) {
		logger.repository.error('Failed to fetch spots in bounds', error);
		throw error;
	}
};

export const getAllSpots = async (): Promise<Spot[]> => {
	logger.repository.debug('Fetching all spots');
	try {
		const { data, error } = await supabase
			.from('spots')
			.select('*')
			.order('created_at', { ascending: false });
		if (error) {
			throw error;
		}
		const spots = (data ?? []).map(row => mapRowToSpot(row as SpotRow));
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
		const { data, error } = await supabase
			.from('spots')
			.select('*')
			.eq('id', id)
			.maybeSingle();
		if (error) {
			throw error;
		}
		if (!data) {
			logger.repository.info('Spot not found', { id });
			return null;
		}
		const spot = mapRowToSpot(data as SpotRow);
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
		const { error } = await supabase.from('spots').insert({
			id: spot.id,
			latitude: spot.coordinates.latitude,
			longitude: spot.coordinates.longitude,
			road_name: spot.roadName,
			appreciation: spot.appreciation,
			direction: spot.direction,
			destinations: spot.destinations,
			created_at: spot.createdAt.toISOString(),
			updated_at: spot.updatedAt.toISOString(),
			created_by: spot.createdBy,
		});
		if (error) {
			throw error;
		}
		clearSpotCache();
		logger.repository.info('Spot created successfully', { id: spot.id });
	} catch (error) {
		logger.repository.error('Failed to create spot', error, { id: spot.id });
		throw error;
	}
};

export const updateSpot = async (spot: Spot): Promise<void> => {
	logger.repository.info('Updating spot', { id: spot.id });
	try {
		const { error } = await supabase
			.from('spots')
			.update({
				latitude: spot.coordinates.latitude,
				longitude: spot.coordinates.longitude,
				road_name: spot.roadName,
				appreciation: spot.appreciation,
				direction: spot.direction,
				destinations: spot.destinations,
				updated_at: spot.updatedAt.toISOString(),
				created_by: spot.createdBy,
			})
			.eq('id', spot.id);
		if (error) {
			throw error;
		}
		clearSpotCache();
		logger.repository.info('Spot updated successfully', { id: spot.id });
	} catch (error) {
		logger.repository.error('Failed to update spot', error, { id: spot.id });
		throw error;
	}
};

export const deleteSpot = async (id: string): Promise<void> => {
	logger.repository.info('Deleting spot', { id });
	try {
		const { error } = await supabase.from('spots').delete().eq('id', id);
		if (error) {
			throw error;
		}
		clearSpotCache();
		logger.repository.info('Spot deleted successfully', { id });
	} catch (error) {
		logger.repository.error('Failed to delete spot', error, { id });
		throw error;
	}
};
