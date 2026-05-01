import type React from 'react';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { useJourney } from '../../journey/context/JourneyContext';
import {
	getNavigationSessionForJourney,
	saveNavigationSession,
} from '../../journey/services/journeyCache/cachedNavigationRepository';
import { journeyIdAsCachedId } from '../../journey/services/journeyCache/ids';
import { getSpotsInBounds } from '../../spot/services';
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

type NavigationActionResult =
	| { success: true }
	| { success: false; error: RoutingError; message: string };

interface NavigationContextValue {
	navigation: NavigationState;
	setDestination: (location: RoutePoint, name: string) => void;
	clearDestination: () => void;
	startNavigation: (
		userLocation: RoutePoint
	) => Promise<NavigationActionResult>;
	startNavigationWithRoute: (
		startLocation: RoutePoint,
		destinationLocation: RoutePoint,
		destinationName: string
	) => Promise<NavigationActionResult>;
	compareWithDriverDirection: (
		driverDestinationLocation: RoutePoint,
		driverDestinationName: string
	) => Promise<NavigationActionResult>;
	clearDriverComparison: () => void;
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
	const { activeJourney, currentLocation: journeyCurrentLocation } =
		useJourney();
	const hasAttemptedRestoreRef = useRef(false);

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

	const clearDriverComparison = useCallback(() => {
		setNavigation(previous => {
			if (!previous.driverRoute && previous.commonSpotsOnRoute.length === 0) {
				return previous;
			}

			logger.navigation.info('Driver direction comparison cleared');
			return {
				...previous,
				driverRoute: null,
				commonSpotsOnRoute: [],
			};
		});
	}, []);

	/**
	 * Pure routing + state update — no cache persistence side effects. Used
	 * for both initial navigation and crash restoration so the saved session
	 * isn't overwritten with a recalculated origin.
	 */
	const calculateAndApplyRoute = useCallback(
		async (
			startLocation: RoutePoint,
			destinationLocation: RoutePoint,
			destinationName: string
		): Promise<NavigationActionResult> => {
			logger.navigation.info('Calculating route', {
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
			}

			setNavigation({
				isActive: true,
				route: result.route,
				spotsOnRoute,
				driverRoute: null,
				commonSpotsOnRoute: [],
				destinationMarker: null,
			});

			logger.navigation.info('Navigation route applied', {
				destinationName: result.route.destinationName,
				distanceKm: result.route.distanceKm,
				spotsOnRoute: spotsOnRoute.length,
			});

			return { success: true };
		},
		[]
	);

	const startNavigationFlow = useCallback(
		async (
			startLocation: RoutePoint,
			destinationLocation: RoutePoint,
			destinationName: string
		): Promise<NavigationActionResult> => {
			const result = await calculateAndApplyRoute(
				startLocation,
				destinationLocation,
				destinationName
			);

			if (!result.success) {
				return result;
			}

			// Persist the session so the user can recover navigation after a
			// crash. Origin/destination are the business endpoints; the
			// calculated polyline is intentionally not stored (would be stale).
			if (activeJourney) {
				try {
					await saveNavigationSession({
						cachedJourneyId: journeyIdAsCachedId(activeJourney.id),
						origin: {
							latitude: startLocation.latitude,
							longitude: startLocation.longitude,
						},
						destination: {
							latitude: destinationLocation.latitude,
							longitude: destinationLocation.longitude,
							name: destinationName,
						},
					});
				} catch (error) {
					logger.navigation.error(
						'Failed to persist navigation session for crash recovery',
						error
					);
				}
			}

			return { success: true };
		},
		[activeJourney, calculateAndApplyRoute]
	);

	// Crash recovery: when an active journey is restored at boot, look up the
	// associated nav session and recalculate the route from the current GPS
	// position. The saved origin stays as-is (business origin of the trip).
	const activeJourneyId = activeJourney?.id;
	useEffect(() => {
		if (
			hasAttemptedRestoreRef.current ||
			!activeJourneyId ||
			navigation.isActive ||
			!journeyCurrentLocation
		) {
			return;
		}

		hasAttemptedRestoreRef.current = true;
		const cacheId = journeyIdAsCachedId(activeJourneyId);

		void (async () => {
			try {
				const session = await getNavigationSessionForJourney(cacheId);
				if (!session) return;

				logger.navigation.info('Restoring navigation from cache', {
					cacheId,
					destination: session.destinationName,
				});

				await calculateAndApplyRoute(
					{
						latitude: journeyCurrentLocation.latitude,
						longitude: journeyCurrentLocation.longitude,
					},
					{
						latitude: session.destinationLatitude,
						longitude: session.destinationLongitude,
					},
					session.destinationName ?? 'Destination'
				);
			} catch (error) {
				logger.navigation.error(
					'Failed to restore navigation session at boot',
					error
				);
			}
		})();
	}, [
		activeJourneyId,
		calculateAndApplyRoute,
		journeyCurrentLocation,
		navigation.isActive,
	]);

	// Reset the restore guard when the active journey is cleared so a future
	// recording session can attempt its own restoration.
	useEffect(() => {
		if (!activeJourneyId) {
			hasAttemptedRestoreRef.current = false;
		}
	}, [activeJourneyId]);

	const startNavigation = useCallback(
		async (userLocation: RoutePoint): Promise<NavigationActionResult> => {
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
		): Promise<NavigationActionResult> =>
			startNavigationFlow(startLocation, destinationLocation, destinationName),
		[startNavigationFlow]
	);

	const compareWithDriverDirection = useCallback(
		async (
			driverDestinationLocation: RoutePoint,
			driverDestinationName: string
		): Promise<NavigationActionResult> => {
			if (!navigation.isActive || !navigation.route) {
				logger.navigation.warn(
					'Cannot compare with driver direction: navigation inactive'
				);
				return {
					success: false,
					error: 'invalid_coordinates',
					message: 'Navigation inactive',
				};
			}

			const baseRoute = navigation.route;
			logger.navigation.info('Comparing with driver direction', {
				userDestination: baseRoute.destinationName,
				driverDestination: driverDestinationName,
			});

			const driverRouteResult = await calculateRoute(
				baseRoute.origin,
				driverDestinationLocation,
				driverDestinationName
			);

			if (!driverRouteResult.success) {
				return driverRouteResult;
			}

			let driverSpotsOnRoute: SpotOnRoute[] = [];
			try {
				const driverRouteBounds = polylineToBounds(
					driverRouteResult.route.polyline
				);
				const spotsInDriverRouteBounds =
					await getSpotsInBounds(driverRouteBounds);
				driverSpotsOnRoute = findSpotsAlongRoute(
					driverRouteResult.route,
					spotsInDriverRouteBounds
				);
			} catch (error) {
				logger.navigation.error(
					'Failed to fetch driver route spots for comparison',
					error
				);
			}

			const driverSpotIds = new Set(
				driverSpotsOnRoute.map(({ spot }) => spot.id as string)
			);
			const commonSpotsOnRoute = navigation.spotsOnRoute.filter(({ spot }) =>
				driverSpotIds.has(spot.id as string)
			);

			setNavigation(previous => ({
				...previous,
				driverRoute: driverRouteResult.route,
				commonSpotsOnRoute,
			}));

			logger.navigation.info('Driver direction comparison ready', {
				driverRouteDistanceKm: driverRouteResult.route.distanceKm,
				commonSpotsOnRoute: commonSpotsOnRoute.length,
			});

			return { success: true };
		},
		[navigation.isActive, navigation.route, navigation.spotsOnRoute]
	);

	const value: NavigationContextValue = {
		navigation,
		setDestination,
		clearDestination,
		startNavigation,
		startNavigationWithRoute,
		compareWithDriverDirection,
		clearDriverComparison,
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
