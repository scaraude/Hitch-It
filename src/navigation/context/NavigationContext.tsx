import type React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import type { Spot } from '../../spot/types';
import { logger } from '../../utils/logger';
import { findSpotsAlongRoute } from '../services/routeSpotMatcher';
import { calculateRoute, type RoutingError } from '../services/routingService';
import {
	INITIAL_NAVIGATION_STATE,
	type NavigationRoute,
	type NavigationState,
	type RoutePoint,
	type SpotOnRoute,
} from '../types';

interface NavigationContextValue {
	navigation: NavigationState;
	setDestination: (location: RoutePoint, name: string) => void;
	clearDestination: () => void;
	startNavigation: (
		userLocation: RoutePoint,
		allSpots: Spot[]
	) => Promise<
		{ success: true } | { success: false; error: RoutingError; message: string }
	>;
	stopNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
	undefined
);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [navigation, setNavigation] = useState<NavigationState>(
		INITIAL_NAVIGATION_STATE
	);

	const setDestination = useCallback((location: RoutePoint, name: string) => {
		logger.navigation.info('Destination set', { name, location });
		setNavigation(prev => ({
			...prev,
			destinationMarker: { location, name },
		}));
	}, []);

	const clearDestination = useCallback(() => {
		logger.navigation.info('Destination cleared');
		setNavigation(INITIAL_NAVIGATION_STATE);
	}, []);

	const startNavigation = useCallback(
		async (
			userLocation: RoutePoint,
			allSpots: Spot[]
		): Promise<
			| { success: true }
			| { success: false; error: RoutingError; message: string }
		> => {
			const { destinationMarker } = navigation;

			if (!destinationMarker) {
				logger.navigation.warn('Cannot start navigation: no destination set');
				return {
					success: false,
					error: 'invalid_coordinates',
					message: 'Aucune destination sélectionnée',
				};
			}

			logger.navigation.info('Starting navigation', {
				destination: destinationMarker.name,
				from: userLocation,
			});

			const result = await calculateRoute(
				userLocation,
				destinationMarker.location,
				destinationMarker.name
			);

			if (!result.success) {
				return result;
			}

			const spotsOnRoute = findSpotsAlongRoute(result.route, allSpots);

			setNavigation({
				isActive: true,
				route: result.route,
				spotsOnRoute,
				destinationMarker: null,
			});

			logger.navigation.info('Navigation started', {
				destinationName: result.route.destinationName,
				distanceKm: result.route.distanceKm,
				spotsOnRoute: spotsOnRoute.length,
			});

			return { success: true };
		},
		[navigation]
	);

	const stopNavigation = useCallback(() => {
		logger.navigation.info('Navigation stopped');
		setNavigation(INITIAL_NAVIGATION_STATE);
	}, []);

	const value: NavigationContextValue = {
		navigation,
		setDestination,
		clearDestination,
		startNavigation,
		stopNavigation,
	};

	return (
		<NavigationContext.Provider value={value}>
			{children}
		</NavigationContext.Provider>
	);
};

export const useNavigation = (): NavigationContextValue => {
	const context = useContext(NavigationContext);
	if (!context) {
		throw new Error('useNavigation must be used within a NavigationProvider');
	}
	return context;
};

// Re-export types for convenience
export type { NavigationRoute, NavigationState, RoutePoint, SpotOnRoute };
