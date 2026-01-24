import { logger } from '../../utils/logger';
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
 * Decode Google Polyline encoding to array of coordinates
 * OpenRouteService returns polyline in Google's encoding format
 */
function decodePolyline(encoded: string): RoutePoint[] {
	const points: RoutePoint[] = [];
	let index = 0;
	let lat = 0;
	let lng = 0;

	while (index < encoded.length) {
		let shift = 0;
		let result = 0;
		let byte: number;

		do {
			byte = encoded.charCodeAt(index++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);

		const dlat = result & 1 ? ~(result >> 1) : result >> 1;
		lat += dlat;

		shift = 0;
		result = 0;

		do {
			byte = encoded.charCodeAt(index++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);

		const dlng = result & 1 ? ~(result >> 1) : result >> 1;
		lng += dlng;

		points.push({
			latitude: lat / 1e5,
			longitude: lng / 1e5,
		});
	}

	return points;
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

/**
 * Calculate route between two points using OpenRouteService
 */
export async function calculateRoute(
	origin: RoutePoint,
	destination: RoutePoint,
	destinationName: string
): Promise<RoutingResult | RoutingFailure> {
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
				coordinates: [
					[origin.longitude, origin.latitude],
					[destination.longitude, destination.latitude],
				],
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
