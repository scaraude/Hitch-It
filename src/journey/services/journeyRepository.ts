import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils';
import type {
	SpotId,
	Travel,
	TravelId,
	TravelStep,
	TravelStepId,
} from '../types';

type TravelRow = {
	id: string;
	user_id: string;
	start_date: string;
	end_date: string | null;
	origin: string;
	destination: string;
	status: string;
	total_distance: number;
	total_wait_time: number;
	created_at: string;
	updated_at: string;
};

type TravelStepRow = {
	id: string;
	travel_id: string;
	type: string;
	spot_id: string | null;
	start_time: string;
	end_time: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
};

const mapRowToTravel = (row: TravelRow, steps: TravelStep[] = []): Travel => ({
	id: row.id as TravelId,
	userId: row.user_id as Travel['userId'],
	startDate: new Date(row.start_date),
	endDate: row.end_date ? new Date(row.end_date) : undefined,
	origin: row.origin,
	destination: row.destination,
	status: row.status as Travel['status'],
	steps,
	totalDistance: row.total_distance,
	totalWaitTime: row.total_wait_time,
});

const mapRowToTravelStep = (row: TravelStepRow): TravelStep => ({
	id: row.id as TravelStepId,
	travelId: row.travel_id as TravelId,
	type: row.type as TravelStep['type'],
	spotId: row.spot_id ? (row.spot_id as SpotId) : undefined,
	startTime: new Date(row.start_time),
	endTime: row.end_time ? new Date(row.end_time) : undefined,
	notes: row.notes ?? undefined,
});

export const saveTravel = async (travel: Travel): Promise<void> => {
	logger.repository.info('Saving travel', {
		id: travel.id,
		origin: travel.origin,
		destination: travel.destination,
	});

	try {
		const { error } = await supabase.from('travels').upsert({
			id: travel.id,
			user_id: travel.userId,
			start_date: travel.startDate.toISOString(),
			end_date: travel.endDate?.toISOString() ?? null,
			origin: travel.origin,
			destination: travel.destination,
			status: travel.status,
			total_distance: travel.totalDistance,
			total_wait_time: travel.totalWaitTime,
			updated_at: new Date().toISOString(),
		});

		if (error) {
			throw error;
		}

		logger.repository.info('Travel saved successfully', { id: travel.id });
	} catch (error) {
		logger.repository.error('Failed to save travel', error, { id: travel.id });
		throw error;
	}
};

export const saveTravelStep = async (step: TravelStep): Promise<void> => {
	logger.repository.debug('Saving travel step', {
		id: step.id,
		travelId: step.travelId,
		type: step.type,
	});

	try {
		const { error } = await supabase.from('travel_steps').upsert({
			id: step.id,
			travel_id: step.travelId,
			type: step.type,
			spot_id: step.spotId ?? null,
			start_time: step.startTime.toISOString(),
			end_time: step.endTime?.toISOString() ?? null,
			notes: step.notes ?? null,
			updated_at: new Date().toISOString(),
		});

		if (error) {
			throw error;
		}

		logger.repository.debug('Travel step saved successfully', { id: step.id });
	} catch (error) {
		logger.repository.error('Failed to save travel step', error, {
			id: step.id,
		});
		throw error;
	}
};

export const saveTravelWithSteps = async (travel: Travel): Promise<void> => {
	logger.repository.info('Saving travel with steps', {
		id: travel.id,
		stepsCount: travel.steps.length,
	});

	try {
		await saveTravel(travel);

		for (const step of travel.steps) {
			await saveTravelStep(step);
		}

		logger.repository.info('Travel with steps saved successfully', {
			id: travel.id,
			stepsCount: travel.steps.length,
		});
	} catch (error) {
		logger.repository.error('Failed to save travel with steps', error, {
			id: travel.id,
		});
		throw error;
	}
};

export const getTravelById = async (id: TravelId): Promise<Travel | null> => {
	logger.repository.debug('Fetching travel by ID', { id });

	try {
		const { data: travelData, error: travelError } = await supabase
			.from('travels')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (travelError) {
			throw travelError;
		}

		if (!travelData) {
			logger.repository.info('Travel not found', { id });
			return null;
		}

		const { data: stepsData, error: stepsError } = await supabase
			.from('travel_steps')
			.select('*')
			.eq('travel_id', id)
			.order('start_time', { ascending: true });

		if (stepsError) {
			throw stepsError;
		}

		const steps = (stepsData ?? []).map(row =>
			mapRowToTravelStep(row as TravelStepRow)
		);
		const travel = mapRowToTravel(travelData as TravelRow, steps);

		logger.repository.info('Travel fetched successfully', {
			id,
			stepsCount: steps.length,
		});

		return travel;
	} catch (error) {
		logger.repository.error('Failed to fetch travel by ID', error, { id });
		throw error;
	}
};

export const getTravelsByUserId = async (userId: string): Promise<Travel[]> => {
	logger.repository.debug('Fetching travels by user ID', { userId });

	try {
		const { data: travelsData, error: travelsError } = await supabase
			.from('travels')
			.select('*')
			.eq('user_id', userId)
			.order('start_date', { ascending: false });

		if (travelsError) {
			throw travelsError;
		}

		const travels: Travel[] = [];

		for (const travelRow of travelsData ?? []) {
			const { data: stepsData, error: stepsError } = await supabase
				.from('travel_steps')
				.select('*')
				.eq('travel_id', travelRow.id)
				.order('start_time', { ascending: true });

			if (stepsError) {
				throw stepsError;
			}

			const steps = (stepsData ?? []).map(row =>
				mapRowToTravelStep(row as TravelStepRow)
			);
			travels.push(mapRowToTravel(travelRow as TravelRow, steps));
		}

		logger.repository.info('Travels fetched successfully', {
			userId,
			count: travels.length,
		});

		return travels;
	} catch (error) {
		logger.repository.error('Failed to fetch travels by user ID', error, {
			userId,
		});
		throw error;
	}
};

export const deleteTravel = async (id: TravelId): Promise<void> => {
	logger.repository.info('Deleting travel', { id });

	try {
		const { error } = await supabase.from('travels').delete().eq('id', id);

		if (error) {
			throw error;
		}

		logger.repository.info('Travel deleted successfully', { id });
	} catch (error) {
		logger.repository.error('Failed to delete travel', error, { id });
		throw error;
	}
};

export const getActiveTravel = async (
	userId: string
): Promise<Travel | null> => {
	logger.repository.debug('Fetching active travel', { userId });

	try {
		const { data: travelData, error: travelError } = await supabase
			.from('travels')
			.select('*')
			.eq('user_id', userId)
			.eq('status', 'in_progress')
			.order('start_date', { ascending: false })
			.limit(1)
			.maybeSingle();

		if (travelError) {
			throw travelError;
		}

		if (!travelData) {
			logger.repository.info('No active travel found', { userId });
			return null;
		}

		const { data: stepsData, error: stepsError } = await supabase
			.from('travel_steps')
			.select('*')
			.eq('travel_id', travelData.id)
			.order('start_time', { ascending: true });

		if (stepsError) {
			throw stepsError;
		}

		const steps = (stepsData ?? []).map(row =>
			mapRowToTravelStep(row as TravelStepRow)
		);
		const travel = mapRowToTravel(travelData as TravelRow, steps);

		logger.repository.info('Active travel fetched successfully', {
			id: travel.id,
			stepsCount: steps.length,
		});

		return travel;
	} catch (error) {
		logger.repository.error('Failed to fetch active travel', error, { userId });
		throw error;
	}
};
