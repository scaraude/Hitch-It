import type { Journey, JourneyPoint, JourneyRoutePoint } from '../types';

export interface MapRegion {
	latitude: number;
	longitude: number;
	latitudeDelta: number;
	longitudeDelta: number;
}

/** A point that carries at minimum lat/lng — covers both JourneyPoint and JourneyRoutePoint. */
type MapPoint = JourneyRoutePoint | JourneyPoint;

// ---------------------------------------------------------------------------
// Formatting helpers (single source of truth — also used by JourneyCard)
// ---------------------------------------------------------------------------

export function formatDuration(startedAt: Date, endedAt?: Date): string {
	if (!endedAt) return '—';

	const durationMs = endedAt.getTime() - startedAt.getTime();
	const minutes = Math.floor(durationMs / (1000 * 60));

	if (minutes < 60) {
		return `${minutes}min`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
}

export function formatDistance(km?: number): string {
	if (!km) return '—';
	return `${Math.round(km)} km`;
}

// ---------------------------------------------------------------------------
// Map derivation helpers
// ---------------------------------------------------------------------------

/**
 * Returns the best set of coordinates available for rendering a route.
 * Mirrors the selection logic used in JourneyCard.
 */
export function resolveMapPoints(journey: Journey): MapPoint[] {
	const routePolylinePoints = journey.routePolyline ?? [];

	if (routePolylinePoints.length > 1) return routePolylinePoints;
	return journey.points;
}

/**
 * Derives a map region that fits all provided points with 30 % padding.
 * Returns undefined when there are no points to display.
 */
export function deriveMapRegion(points: MapPoint[]): MapRegion | undefined {
	if (points.length === 0) return undefined;

	const lats = points.map(p => p.latitude);
	const lngs = points.map(p => p.longitude);
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);
	const minLng = Math.min(...lngs);
	const maxLng = Math.max(...lngs);

	return {
		latitude: (minLat + maxLat) / 2,
		longitude: (minLng + maxLng) / 2,
		latitudeDelta: Math.max((maxLat - minLat) * 1.3, 0.01),
		longitudeDelta: Math.max((maxLng - minLng) * 1.3, 0.01),
	};
}

/** Returns recorded stops from a journey. */
export function resolveStopPoints(journey: Journey): JourneyPoint[] {
	return journey.points;
}

export interface JourneyDetailViewModel {
	title: string;
	distance: string;
	duration: string;
	stopPoints: JourneyPoint[];
	mapPoints: MapPoint[];
	mapRegion: MapRegion | undefined;
	startPoint: MapPoint | null;
	endPoint: MapPoint | null;
	polylineCoordinates: { latitude: number; longitude: number }[];
}

/**
 * Derives all display-ready values from a Journey for the detail screen.
 * Pure function — no side-effects.
 */
export function buildJourneyDetailViewModel(
	journey: Journey,
	fallbackTitle: string
): JourneyDetailViewModel {
	const stopPoints = resolveStopPoints(journey);
	const mapPoints = resolveMapPoints(journey);
	const mapRegion = deriveMapRegion(mapPoints);

	const startPoint =
		stopPoints.length > 0 ? stopPoints[0] : (mapPoints[0] ?? null);
	const endPoint =
		stopPoints.length > 0
			? stopPoints[stopPoints.length - 1]
			: mapPoints.length > 0
				? mapPoints[mapPoints.length - 1]
				: null;

	return {
		title: journey.title || fallbackTitle,
		distance: formatDistance(journey.totalDistanceKm),
		duration: formatDuration(journey.startedAt, journey.endedAt),
		stopPoints,
		mapPoints,
		mapRegion,
		startPoint,
		endPoint,
		polylineCoordinates: mapPoints.map(p => ({
			latitude: p.latitude,
			longitude: p.longitude,
		})),
	};
}
