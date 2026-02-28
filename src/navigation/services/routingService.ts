import { logger } from '../../utils/logger';
import { decodePolyline } from '../../utils/polylineCodec';
import type { NavigationRoute, RouteId, RoutePoint } from '../types';

const ORS_API_URL =
	'https://api.openrouteservice.org/v2/directions/driving-car';
const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;

interface ORSResponse {
	routes: Array<{
		summary: {
			distance: number; // meters
			duration: number; // seconds
		};
		geometry: string; // encoded polyline
	}>;
}

/**
 * Generate a unique route ID
 */
function generateRouteId(): RouteId {
	return `route_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as RouteId;
}

export type RoutingError =
	| 'network_error'
	| 'rate_limit'
	| 'invalid_coordinates'
	| 'no_route';

export interface RoutingResult {
	success: true;
	route: NavigationRoute;
}

export interface RoutingFailure {
	success: false;
	error: RoutingError;
	message: string;
}

const MIN_ROUTE_WAYPOINTS = 2;

const hasValidCoordinates = (point: RoutePoint): boolean =>
	Number.isFinite(point.latitude) && Number.isFinite(point.longitude);

/**
 * Calculate route between two points using OpenRouteService
 */
export async function calculateRoute(
	origin: RoutePoint,
	destination: RoutePoint,
	destinationName: string
): Promise<RoutingResult | RoutingFailure> {
	return calculateRouteWithWaypoints([origin, destination], destinationName);
}

/**
 * Calculate route through multiple waypoints using OpenRouteService.
 * First point is origin, last point is destination, intermediates are stops.
 */
export async function calculateRouteWithWaypoints(
	waypoints: RoutePoint[],
	destinationName: string
): Promise<RoutingResult | RoutingFailure> {
	if (
		waypoints.length < MIN_ROUTE_WAYPOINTS ||
		waypoints.some(point => !hasValidCoordinates(point))
	) {
		return {
			success: false,
			error: 'invalid_coordinates',
			message: 'Coordonnées invalides',
		};
	}
	const origin = waypoints[0];
	const destination = waypoints[waypoints.length - 1];

	if (!ORS_API_KEY) {
		logger.navigation.error('OpenRouteService API key not configured');
		return {
			success: false,
			error: 'network_error',
			message: 'Service de navigation non configuré',
		};
	}

	try {
		const response = await fetch(ORS_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: ORS_API_KEY,
			},
			body: JSON.stringify({
				coordinates: waypoints.map(point => [point.longitude, point.latitude]),
			}),
		});

		if (response.status === 429) {
			logger.navigation.warn('OpenRouteService rate limit reached');
			return {
				success: false,
				error: 'rate_limit',
				message: 'Trop de requêtes, réessayez dans 1 minute',
			};
		}

		if (!response.ok) {
			logger.navigation.error('OpenRouteService API error', undefined, {
				status: response.status,
			});
			return {
				success: false,
				error: 'network_error',
				message: "Impossible de calculer l'itinéraire",
			};
		}

		const data = (await response.json()) as ORSResponse;

		if (!data.routes || data.routes.length === 0) {
			logger.navigation.warn('No route found', { origin, destination });
			return {
				success: false,
				error: 'no_route',
				message: 'Aucun itinéraire trouvé',
			};
		}

		const routeData = data.routes[0];
		const polyline = decodePolyline(routeData.geometry);

		const route: NavigationRoute = {
			id: generateRouteId(),
			origin,
			destination,
			destinationName,
			polyline,
			distanceKm: Math.round(routeData.summary.distance / 100) / 10, // Round to 1 decimal
			durationMinutes: Math.round(routeData.summary.duration / 60),
			createdAt: new Date(),
		};

		logger.navigation.info('Route calculated', {
			destinationName,
			distanceKm: route.distanceKm,
			durationMinutes: route.durationMinutes,
			polylinePoints: polyline.length,
			waypointCount: waypoints.length,
		});

		return { success: true, route };
	} catch (error) {
		logger.navigation.error('Failed to calculate route', error as Error);
		return {
			success: false,
			error: 'network_error',
			message: "Impossible de calculer l'itinéraire (hors ligne ?)",
		};
	}
}
