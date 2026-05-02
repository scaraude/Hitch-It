import { supabase } from '@/lib/supabaseClient';
import { decodePolyline, encodePolyline, logger } from '@/utils';
import type {
	Journey,
	JourneyId,
	JourneyPoint,
	JourneyPointId,
	JourneyRoutePoint,
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

type JourneyPointRow = {
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
const JOURNEY_POINTS_PAGE_SIZE = 1000;

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
	points: JourneyPoint[] = []
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
	points,
});

const mapRowToJourneyPoint = (row: JourneyPointRow): JourneyPoint => ({
	id: row.id as JourneyPointId,
	journeyId: row.journey_id as JourneyId,
	latitude: row.latitude,
	longitude: row.longitude,
	timestamp: new Date(row.timestamp),
	spotId: row.spot_id ? (row.spot_id as SpotId) : undefined,
	waitTimeMinutes: row.wait_time_minutes ?? undefined,
	notes: row.notes ?? undefined,
});

const getJourneyPointRows = async (
	journeyId: JourneyId
): Promise<JourneyPointRow[]> => {
	const rows: JourneyPointRow[] = [];
	let from = 0;

	while (true) {
		const to = from + JOURNEY_POINTS_PAGE_SIZE - 1;
		const query = supabase
			.from('journey_points')
			.select('*')
			.eq('journey_id', journeyId)
			.order('timestamp', { ascending: true })
			.order('created_at', { ascending: true })
			.order('id', { ascending: true });

		const { data, error } = await query.range(from, to);

		if (error) {
			logger.repository.error('Failed to fetch journey points page', error, {
				journeyId,
				from,
				to,
			});
			throw error;
		}

		const pageRows = (data ?? []) as JourneyPointRow[];
		rows.push(...pageRows);

		if (pageRows.length < JOURNEY_POINTS_PAGE_SIZE) {
			break;
		}

		from += JOURNEY_POINTS_PAGE_SIZE;
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

export const saveJourneyPoint = async (point: JourneyPoint): Promise<void> => {
	logger.repository.debug('Saving journey point', {
		id: point.id,
		journeyId: point.journeyId,
	});

	const { error } = await supabase.from('journey_points').upsert({
		id: point.id,
		journey_id: point.journeyId,
		latitude: point.latitude,
		longitude: point.longitude,
		timestamp: point.timestamp.toISOString(),
		spot_id: point.spotId ?? null,
		wait_time_minutes: point.waitTimeMinutes ?? null,
		notes: point.notes ?? null,
	});

	if (error) {
		logger.repository.error('Failed to save journey point', error, {
			id: point.id,
		});
		throw error;
	}
};

export const saveJourneyPoints = async (
	points: JourneyPoint[]
): Promise<void> => {
	if (points.length === 0) return;

	logger.repository.debug('Saving journey points batch', {
		count: points.length,
	});

	const rows = points.map(point => ({
		id: point.id,
		journey_id: point.journeyId,
		latitude: point.latitude,
		longitude: point.longitude,
		timestamp: point.timestamp.toISOString(),
		spot_id: point.spotId ?? null,
		wait_time_minutes: point.waitTimeMinutes ?? null,
		notes: point.notes ?? null,
	}));

	const { error } = await supabase.from('journey_points').upsert(rows);

	if (error) {
		logger.repository.error('Failed to save journey points batch', error);
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
	const pointsRows = await getJourneyPointRows(id);
	const points = pointsRows.map(row => mapRowToJourneyPoint(row));

	return mapRowToJourney(journeyRow, points);
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

	const pointsRows = await getJourneyPointRows(journeyData.id as JourneyId);
	const points = pointsRows.map(row => mapRowToJourneyPoint(row));

	return mapRowToJourney(journeyData as JourneyRow, points);
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

	// Return journeys without points (load points on demand)
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

export const updateJourneyPoint = async (
	pointId: JourneyPointId,
	updates: Partial<Pick<JourneyPoint, 'spotId' | 'waitTimeMinutes' | 'notes'>>
): Promise<void> => {
	logger.repository.debug('Updating journey point', { pointId, updates });

	const { error } = await supabase
		.from('journey_points')
		.update({
			spot_id: updates.spotId ?? null,
			wait_time_minutes: updates.waitTimeMinutes ?? null,
			notes: updates.notes ?? null,
		})
		.eq('id', pointId);

	if (error) {
		logger.repository.error('Failed to update journey point', error, {
			pointId,
		});
		throw error;
	}
};
