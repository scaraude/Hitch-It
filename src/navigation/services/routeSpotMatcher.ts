import type { Spot } from '../../spot/types';
import type { NavigationRoute, RoutePoint, SpotOnRoute } from '../types';

const MAX_DISTANCE_FROM_ROUTE_METERS = 500;
const ROUTE_SAMPLING_DISTANCE_KM = 1; // Sample route points every ~1km

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function haversineDistance(point1: RoutePoint, point2: RoutePoint): number {
	const R = 6371000; // Earth radius in meters
	const lat1Rad = (point1.latitude * Math.PI) / 180;
	const lat2Rad = (point2.latitude * Math.PI) / 180;
	const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
	const deltaLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

	const a =
		Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
		Math.cos(lat1Rad) *
			Math.cos(lat2Rad) *
			Math.sin(deltaLon / 2) *
			Math.sin(deltaLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}

/**
 * Calculate perpendicular distance from a point to a line segment
 * Returns distance in meters
 */
function distanceToLineSegment(
	point: RoutePoint,
	lineStart: RoutePoint,
	lineEnd: RoutePoint
): number {
	const segmentLength = haversineDistance(lineStart, lineEnd);

	// If segment is a point, return distance to that point
	if (segmentLength < 1) {
		return haversineDistance(point, lineStart);
	}

	// Project point onto line segment using parameter t
	const t = Math.max(
		0,
		Math.min(
			1,
			((point.latitude - lineStart.latitude) *
				(lineEnd.latitude - lineStart.latitude) +
				(point.longitude - lineStart.longitude) *
					(lineEnd.longitude - lineStart.longitude)) /
				((lineEnd.latitude - lineStart.latitude) ** 2 +
					(lineEnd.longitude - lineStart.longitude) ** 2)
		)
	);

	// Calculate closest point on segment
	const closestPoint: RoutePoint = {
		latitude: lineStart.latitude + t * (lineEnd.latitude - lineStart.latitude),
		longitude:
			lineStart.longitude + t * (lineEnd.longitude - lineStart.longitude),
	};

	return haversineDistance(point, closestPoint);
}

/**
 * Sample route points to reduce computation
 * Returns indices of points to check (every ~1km)
 */
function sampleRoutePoints(route: NavigationRoute): number[] {
	if (route.polyline.length <= 2) {
		return route.polyline.map((_, i) => i);
	}

	const sampleDistanceMeters = ROUTE_SAMPLING_DISTANCE_KM * 1000;
	const indices: number[] = [0];
	let accumulatedDistance = 0;

	for (let i = 1; i < route.polyline.length; i++) {
		const dist = haversineDistance(route.polyline[i - 1], route.polyline[i]);
		accumulatedDistance += dist;

		if (accumulatedDistance >= sampleDistanceMeters) {
			indices.push(i);
			accumulatedDistance = 0;
		}
	}

	// Always include last point
	if (indices[indices.length - 1] !== route.polyline.length - 1) {
		indices.push(route.polyline.length - 1);
	}

	return indices;
}

/**
 * Find minimum distance from a spot to the route
 * Returns { distance, closestIndex } or null if too far
 */
function findMinDistanceToRoute(
	spot: Spot,
	route: NavigationRoute,
	sampledIndices: number[]
): { distance: number; closestIndex: number } | null {
	const spotPoint: RoutePoint = {
		latitude: spot.coordinates.latitude,
		longitude: spot.coordinates.longitude,
	};

	let minDistance = Number.POSITIVE_INFINITY;
	let closestIndex = 0;

	// Check distance to each sampled segment
	for (let i = 0; i < sampledIndices.length - 1; i++) {
		const startIdx = sampledIndices[i];
		const endIdx = sampledIndices[i + 1];

		const distance = distanceToLineSegment(
			spotPoint,
			route.polyline[startIdx],
			route.polyline[endIdx]
		);

		if (distance < minDistance) {
			minDistance = distance;
			closestIndex = startIdx;
		}
	}

	if (minDistance <= MAX_DISTANCE_FROM_ROUTE_METERS) {
		return { distance: minDistance, closestIndex };
	}

	return null;
}

/**
 * Find all spots within MAX_DISTANCE_FROM_ROUTE_METERS of the route
 * Returns spots sorted by their position along the route (start → end)
 */
export function findSpotsAlongRoute(
	route: NavigationRoute,
	allSpots: Spot[]
): SpotOnRoute[] {
	if (allSpots.length === 0 || route.polyline.length < 2) {
		return [];
	}

	// Sample route points for efficient matching
	const sampledIndices = sampleRoutePoints(route);

	// Find spots near route
	const spotsOnRoute: SpotOnRoute[] = [];

	for (const spot of allSpots) {
		const result = findMinDistanceToRoute(spot, route, sampledIndices);

		if (result) {
			spotsOnRoute.push({
				spot,
				distanceFromRouteMeters: Math.round(result.distance),
				closestRoutePointIndex: result.closestIndex,
			});
		}
	}

	// Sort by route progression (start → end)
	spotsOnRoute.sort(
		(a, b) => a.closestRoutePointIndex - b.closestRoutePointIndex
	);

	return spotsOnRoute;
}

/**
 * Calculate distance from a point to destination
 * Returns distance in meters
 */
export function distanceToDestination(
	current: RoutePoint,
	destination: RoutePoint
): number {
	return haversineDistance(current, destination);
}
