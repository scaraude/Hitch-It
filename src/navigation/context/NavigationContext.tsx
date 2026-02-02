import type React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { getSpotsInBounds } from '../../spot/services';
import type { MapBounds } from '../../types';
import { polylineToBounds } from '../../utils';
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
		userLocation: RoutePoint
	) => Promise<
		{ success: true } | { success: false; error: RoutingError; message: string }
	>;
	startNavigationWithRoute: (
		startLocation: RoutePoint,
		destinationLocation: RoutePoint,
		destinationName: string
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

	const stopNavigation = useCallback(() => {
		logger.navigation.info('Navigation stopped');
		setNavigation(INITIAL_NAVIGATION_STATE);
	}, []);

	const startNavigationFlow = useCallback(
		async (
			startLocation: RoutePoint,
			destinationLocation: RoutePoint,
			destinationName: string
		): Promise<
			| { success: true }
			| { success: false; error: RoutingError; message: string }
		> => {
			logger.navigation.info('Starting navigation', {
				destination: destinationName,
				from: startLocation,
			});

			const result = await calculateRoute(
				startLocation,
				destinationLocation,
				destinationName
			);

			if (!result.success) {
				return result;
			}

			const routeBounds = polylineToBounds(result.route.polyline);
			logger.navigation.debug('Fetching spots for route bounds', {
				...routeBounds,
			});

			let spotsOnRoute: SpotOnRoute[] = [];
			try {
				const spotsInRouteBounds = await getSpotsInBounds(routeBounds);
				spotsOnRoute = findSpotsAlongRoute(result.route, spotsInRouteBounds);
				logger.navigation.info('Spots found along route', {
					spotsInBounds: spotsInRouteBounds.length,
					spotsOnRoute: spotsOnRoute.length,
				});
			} catch (error) {
				logger.navigation.error('Failed to fetch spots for route', error);
				// Continue navigation even if spots fail to load
			}

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
		[]
	);

	const startNavigation = useCallback(
		async (
			userLocation: RoutePoint
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

			return startNavigationFlow(
				userLocation,
				destinationMarker.location,
				destinationMarker.name
			);
		},
		[navigation, startNavigationFlow]
	);

	const startNavigationWithRoute = useCallback(
		async (
			startLocation: RoutePoint,
			destinationLocation: RoutePoint,
			destinationName: string
		): Promise<
			| { success: true }
			| { success: false; error: RoutingError; message: string }
		> =>
			startNavigationFlow(startLocation, destinationLocation, destinationName),
		[startNavigationFlow]
	);

	const value: NavigationContextValue = {
		navigation,
		setDestination,
		clearDestination,
		startNavigation,
		startNavigationWithRoute,
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
