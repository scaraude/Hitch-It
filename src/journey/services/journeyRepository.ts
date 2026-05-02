import { supabase } from '@/lib/supabaseClient';
import { decodePolyline, encodePolyline, logger } from '@/utils';
import type {
	Journey,
	JourneyId,
	JourneyRoutePoint,
	JourneyStop,
	JourneyStopId,
	SpotId,
	UserId,
} from '../types';
import { JourneyStatus } from '../types';

type JourneyRow = {
	id: string;
	user_id: string;
	status: string;
	started_at: string;
	ended_at: string | null;
	title: string | null;
	notes: string | null;
	route_polyline: string | null;
	total_distance_km: number | null;
	is_shared: boolean;
	share_token: string | null;
	created_at: string;
	updated_at: string;
};

type JourneyStopRow = {
	id: string;
	journey_id: string;
	latitude: number;
	longitude: number;
	timestamp: string;
	spot_id: string | null;
	wait_time_minutes: number | null;
	notes: string | null;
	created_at: string;
};

const journeyStatusValues = new Set(Object.values(JourneyStatus));
const JOURNEY_STOPS_PAGE_SIZE = 1000;

const parseJourneyStatus = (
	value: string,
	journeyId: string
): JourneyStatus => {
	if (journeyStatusValues.has(value as JourneyStatus)) {
		return value as JourneyStatus;
	}

	throw new Error(
		`Invalid journey status "${value}" for journey "${journeyId}"`
	);
};

const parseRoutePolyline = (
	value: string | null,
	journeyId: string
): JourneyRoutePoint[] | undefined => {
	if (!value) {
		return undefined;
	}

	try {
		const points = decodePolyline(value);
		return points.length > 0 ? points : undefined;
	} catch (error) {
		logger.repository.warn('Invalid route polyline for journey', {
			journeyId,
			errorMessage: error instanceof Error ? error.message : String(error),
		});
		return undefined;
	}
};

const mapRowToJourney = (
	row: JourneyRow,
	stops: JourneyStop[] = []
): Journey => ({
	id: row.id as JourneyId,
	userId: row.user_id as UserId,
	status: parseJourneyStatus(row.status, row.id),
	startedAt: new Date(row.started_at),
	endedAt: row.ended_at ? new Date(row.ended_at) : undefined,
	title: row.title ?? undefined,
	notes: row.notes ?? undefined,
	routePolyline: parseRoutePolyline(row.route_polyline, row.id),
	totalDistanceKm: row.total_distance_km ?? undefined,
	isShared: row.is_shared,
	shareToken: row.share_token ?? undefined,
	stops,
});

const mapRowToJourneyStop = (row: JourneyStopRow): JourneyStop => ({
	id: row.id as JourneyStopId,
	journeyId: row.journey_id as JourneyId,
	latitude: row.latitude,
	longitude: row.longitude,
	timestamp: new Date(row.timestamp),
	spotId: row.spot_id ? (row.spot_id as SpotId) : undefined,
	waitTimeMinutes: row.wait_time_minutes ?? undefined,
	notes: row.notes ?? undefined,
});

const getJourneyStopRows = async (
	journeyId: JourneyId
): Promise<JourneyStopRow[]> => {
	const rows: JourneyStopRow[] = [];
	let from = 0;

	while (true) {
		const to = from + JOURNEY_STOPS_PAGE_SIZE - 1;
		const { data, error } = await supabase
			.from('journey_stops')
			.select('*')
			.eq('journey_id', journeyId)
			.order('timestamp', { ascending: true })
			.order('created_at', { ascending: true })
			.order('id', { ascending: true })
			.range(from, to);

		if (error) {
			logger.repository.error('Failed to fetch journey stops page', error, {
				journeyId,
				from,
				to,
			});
			throw error;
		}

		const pageRows = (data ?? []) as JourneyStopRow[];
		rows.push(...pageRows);

		if (pageRows.length < JOURNEY_STOPS_PAGE_SIZE) {
			break;
		}

		from += JOURNEY_STOPS_PAGE_SIZE;
	}

	return rows;
};

export const saveJourney = async (journey: Journey): Promise<void> => {
	logger.repository.info('Saving journey', { id: journey.id });
	const encodedRoutePolyline =
		journey.routePolyline && journey.routePolyline.length > 0
			? encodePolyline(journey.routePolyline)
			: null;

	const { error } = await supabase.from('journeys').upsert({
		id: journey.id,
		user_id: journey.userId,
		status: journey.status,
		started_at: journey.startedAt.toISOString(),
		ended_at: journey.endedAt?.toISOString() ?? null,
		title: journey.title ?? null,
		notes: journey.notes ?? null,
		route_polyline: encodedRoutePolyline,
		total_distance_km: journey.totalDistanceKm ?? null,
		is_shared: journey.isShared ?? false,
		share_token: journey.shareToken ?? null,
		updated_at: new Date().toISOString(),
	});

	if (error) {
		logger.repository.error('Failed to save journey', error, {
			id: journey.id,
		});
		throw error;
	}

	logger.repository.info('Journey saved successfully', { id: journey.id });
};

export const saveJourneyStop = async (stop: JourneyStop): Promise<void> => {
	logger.repository.debug('Saving journey stop', {
		id: stop.id,
		journeyId: stop.journeyId,
	});

	const { error } = await supabase.from('journey_stops').upsert({
		id: stop.id,
		journey_id: stop.journeyId,
		latitude: stop.latitude,
		longitude: stop.longitude,
		timestamp: stop.timestamp.toISOString(),
		spot_id: stop.spotId ?? null,
		wait_time_minutes: stop.waitTimeMinutes ?? null,
		notes: stop.notes ?? null,
	});

	if (error) {
		logger.repository.error('Failed to save journey stop', error, {
			id: stop.id,
		});
		throw error;
	}
};

export const saveJourneyStops = async (stops: JourneyStop[]): Promise<void> => {
	if (stops.length === 0) return;

	logger.repository.debug('Saving journey stops batch', {
		count: stops.length,
	});

	const rows = stops.map(stop => ({
		id: stop.id,
		journey_id: stop.journeyId,
		latitude: stop.latitude,
		longitude: stop.longitude,
		timestamp: stop.timestamp.toISOString(),
		spot_id: stop.spotId ?? null,
		wait_time_minutes: stop.waitTimeMinutes ?? null,
		notes: stop.notes ?? null,
	}));

	const { error } = await supabase.from('journey_stops').upsert(rows);

	if (error) {
		logger.repository.error('Failed to save journey stops batch', error);
		throw error;
	}
};

export const getJourneyById = async (
	id: JourneyId
): Promise<Journey | null> => {
	logger.repository.debug('Fetching journey by ID', { id });

	const { data: journeyData, error: journeyError } = await supabase
		.from('journeys')
		.select('*')
		.eq('id', id)
		.maybeSingle();

	if (journeyError) {
		logger.repository.error('Failed to fetch journey', journeyError, { id });
		throw journeyError;
	}

	if (!journeyData) {
		return null;
	}

	const journeyRow = journeyData as JourneyRow;
	const stopRows = await getJourneyStopRows(id);
	const stops = stopRows.map(row => mapRowToJourneyStop(row));

	return mapRowToJourney(journeyRow, stops);
};

export const getActiveJourney = async (
	userId: UserId
): Promise<Journey | null> => {
	logger.repository.debug('Fetching active journey', { userId });

	const { data: journeyData, error: journeyError } = await supabase
		.from('journeys')
		.select('*')
		.eq('user_id', userId)
		.in('status', [JourneyStatus.Recording, JourneyStatus.Paused])
		.order('started_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (journeyError) {
		logger.repository.error('Failed to fetch active journey', journeyError, {
			userId,
		});
		throw journeyError;
	}

	if (!journeyData) {
		return null;
	}

	const stopRows = await getJourneyStopRows(journeyData.id as JourneyId);
	const stops = stopRows.map(row => mapRowToJourneyStop(row));

	return mapRowToJourney(journeyData as JourneyRow, stops);
};

export const getJourneysByUserId = async (
	userId: UserId
): Promise<Journey[]> => {
	logger.repository.debug('Fetching journeys by user', { userId });

	const { data: journeysData, error } = await supabase
		.from('journeys')
		.select('*')
		.eq('user_id', userId)
		.order('started_at', { ascending: false });

	if (error) {
		logger.repository.error('Failed to fetch journeys', error, { userId });
		throw error;
	}

	return (journeysData ?? []).map(row =>
		mapRowToJourney(row as JourneyRow, [])
	);
};

export const updateJourneyTitle = async (
	id: JourneyId,
	title: string | undefined
): Promise<void> => {
	const normalizedTitle = title?.trim() ?? null;

	logger.repository.info('Updating journey title', {
		id,
		hasTitle: Boolean(normalizedTitle),
	});

	const { error } = await supabase
		.from('journeys')
		.update({
			title: normalizedTitle || null,
			updated_at: new Date().toISOString(),
		})
		.eq('id', id);

	if (error) {
		logger.repository.error('Failed to update journey title', error, { id });
		throw error;
	}
};

export const deleteJourney = async (id: JourneyId): Promise<void> => {
	logger.repository.info('Deleting journey', { id });

	const { error } = await supabase.from('journeys').delete().eq('id', id);

	if (error) {
		logger.repository.error('Failed to delete journey', error, { id });
		throw error;
	}

	logger.repository.info('Journey deleted successfully', { id });
};

export const updateJourneyStop = async (
	stopId: JourneyStopId,
	updates: Partial<Pick<JourneyStop, 'spotId' | 'waitTimeMinutes' | 'notes'>>
): Promise<void> => {
	logger.repository.debug('Updating journey stop', { stopId, updates });

	const { error } = await supabase
		.from('journey_stops')
		.update({
			spot_id: updates.spotId ?? null,
			wait_time_minutes: updates.waitTimeMinutes ?? null,
			notes: updates.notes ?? null,
		})
		.eq('id', stopId);

	if (error) {
		logger.repository.error('Failed to update journey stop', error, {
			stopId,
		});
		throw error;
	}
};
