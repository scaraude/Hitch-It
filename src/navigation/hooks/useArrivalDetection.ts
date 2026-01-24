import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { logger } from '../../utils/logger';
import { distanceToDestination } from '../services/routeSpotMatcher';
import type { NavigationRoute, RoutePoint } from '../types';

const ARRIVAL_THRESHOLD_METERS = 200;

interface UseArrivalDetectionResult {
	hasArrived: boolean;
	distanceToDestinationMeters: number;
}

export function useArrivalDetection(
	route: NavigationRoute | null,
	userLocation: RoutePoint | null
): UseArrivalDetectionResult {
	const [hasArrived, setHasArrived] = useState(false);
	const [distanceMeters, setDistanceMeters] = useState(
		Number.POSITIVE_INFINITY
	);
	const hasTriggeredRef = useRef(false);

	useEffect(() => {
		// Reset when route changes
		if (!route) {
			setHasArrived(false);
			setDistanceMeters(Number.POSITIVE_INFINITY);
			hasTriggeredRef.current = false;
			return;
		}

		if (!userLocation) {
			return;
		}

		const distance = distanceToDestination(userLocation, route.destination);
		setDistanceMeters(Math.round(distance));

		// Check for arrival (only trigger once per navigation)
		if (distance < ARRIVAL_THRESHOLD_METERS && !hasTriggeredRef.current) {
			hasTriggeredRef.current = true;
			setHasArrived(true);

			logger.navigation.info('Arrival detected', {
				destinationName: route.destinationName,
				distanceMeters: Math.round(distance),
			});

			// Haptic feedback
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		}
	}, [userLocation, route]);

	return {
		hasArrived,
		distanceToDestinationMeters: distanceMeters,
	};
}
