import { useEffect, useMemo, useRef } from 'react';
import type { RoutePoint, SpotOnRoute } from '../types';

const EARTH_RADIUS_METERS = 6371000;
const METERS_PER_KILOMETER = 1000;

interface UseNavigationProgressArgs {
	routePolyline: RoutePoint[];
	initialDistanceKm: number;
	userLocation: RoutePoint | null;
	spotsOnRoute: SpotOnRoute[];
}

interface NavigationProgressState {
	remainingDistanceKm: number;
	passedRoutePolyline: RoutePoint[];
	remainingRoutePolyline: RoutePoint[];
	visibleSpotsOnRoute: SpotOnRoute[];
	progressRoutePointIndex: number;
}

function toRadians(degrees: number): number {
	return (degrees * Math.PI) / 180;
}

function haversineDistanceMeters(pointA: RoutePoint, pointB: RoutePoint): number {
	const latitudeDelta = toRadians(pointB.latitude - pointA.latitude);
	const longitudeDelta = toRadians(pointB.longitude - pointA.longitude);
	const startLatitude = toRadians(pointA.latitude);
	const endLatitude = toRadians(pointB.latitude);

	const distanceFormulaA =
		Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
		Math.cos(startLatitude) *
			Math.cos(endLatitude) *
			Math.sin(longitudeDelta / 2) *
			Math.sin(longitudeDelta / 2);

	const distanceFormulaC =
		2 * Math.atan2(Math.sqrt(distanceFormulaA), Math.sqrt(1 - distanceFormulaA));

	return EARTH_RADIUS_METERS * distanceFormulaC;
}

function findClosestRoutePointIndex(
	userLocation: RoutePoint,
	routePolyline: RoutePoint[]
): number {
	let closestIndex = 0;
	let minDistance = Number.POSITIVE_INFINITY;

	for (let index = 0; index < routePolyline.length; index += 1) {
		const distance = haversineDistanceMeters(userLocation, routePolyline[index]);
		if (distance < minDistance) {
			minDistance = distance;
			closestIndex = index;
		}
	}

	return closestIndex;
}

function computeRemainingDistanceKm(
	userLocation: RoutePoint,
	routePolyline: RoutePoint[],
	progressIndex: number
): number {
	const destinationIndex = routePolyline.length - 1;
	if (progressIndex >= destinationIndex) {
		return 0;
	}

	let remainingMeters = haversineDistanceMeters(
		userLocation,
		routePolyline[progressIndex]
	);

	for (let index = progressIndex; index < destinationIndex; index += 1) {
		remainingMeters += haversineDistanceMeters(
			routePolyline[index],
			routePolyline[index + 1]
		);
	}

	return Math.max(0, remainingMeters / METERS_PER_KILOMETER);
}

export function useNavigationProgress({
	routePolyline,
	initialDistanceKm,
	userLocation,
	spotsOnRoute,
}: UseNavigationProgressArgs): NavigationProgressState {
	const highestProgressIndexRef = useRef(0);

	useEffect(() => {
		highestProgressIndexRef.current = 0;
	}, [routePolyline]);

	return useMemo(() => {
		if (routePolyline.length === 0) {
			return {
				remainingDistanceKm: initialDistanceKm,
				passedRoutePolyline: [],
				remainingRoutePolyline: [],
				visibleSpotsOnRoute: spotsOnRoute,
				progressRoutePointIndex: 0,
			};
		}

		if (!userLocation) {
			return {
				remainingDistanceKm: initialDistanceKm,
				passedRoutePolyline: routePolyline.slice(0, 1),
				remainingRoutePolyline: routePolyline,
				visibleSpotsOnRoute: spotsOnRoute,
				progressRoutePointIndex: highestProgressIndexRef.current,
			};
		}

		const closestRoutePointIndex = findClosestRoutePointIndex(
			userLocation,
			routePolyline
		);
		const progressRoutePointIndex = Math.max(
			highestProgressIndexRef.current,
			closestRoutePointIndex
		);
		highestProgressIndexRef.current = progressRoutePointIndex;

		const passedRoutePolyline = routePolyline.slice(0, progressRoutePointIndex + 1);
		const remainingRoutePolyline = routePolyline.slice(progressRoutePointIndex);
		const visibleSpotsOnRoute = spotsOnRoute.filter(
			({ closestRoutePointIndex: spotRoutePointIndex }) =>
				spotRoutePointIndex >= progressRoutePointIndex
		);

		const remainingDistanceKm = Number(
			computeRemainingDistanceKm(
				userLocation,
				routePolyline,
				progressRoutePointIndex
			).toFixed(1)
		);

		return {
			remainingDistanceKm,
			passedRoutePolyline,
			remainingRoutePolyline,
			visibleSpotsOnRoute,
			progressRoutePointIndex,
		};
	}, [initialDistanceKm, routePolyline, spotsOnRoute, userLocation]);
}
