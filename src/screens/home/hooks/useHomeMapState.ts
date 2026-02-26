import { useFocusEffect } from '@react-navigation/native';
import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import type { MapViewRef } from '../../../components';
import type { NavigationRoute, SpotOnRoute } from '../../../navigation/types';
import type { Spot, SpotMarkerData } from '../../../spot/types';
import type { Location, MapRegion } from '../../../types';
import { polylineToRegion } from '../../../utils';

interface UseHomeMapStateArgs {
	// Navigation state
	isNavigationActive: boolean;
	navigationRoute: NavigationRoute | null;
	driverRoute: NavigationRoute | null;
	spotsOnRoute: SpotOnRoute[];
	commonSpotsOnRoute: SpotOnRoute[];
	hasDriverComparison: boolean;
	onClearDriverComparison: () => void;
	onStopNavigationAndOpenSearch: () => Promise<void>;
	// Spot state
	spots: SpotMarkerData[];
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	isSearchOpen: boolean;
	onSelectSpot: (spotId: string) => void;
	onSelectRouteSpot: (spot: Spot) => void;
	// Map
	mapViewRef: RefObject<MapViewRef | null>;
	currentRegion: MapRegion;
	onRegionChange: (region: MapRegion) => void;
	userLocation: Location | null;
}

export interface UseHomeMapStateReturn {
	// Map interactions
	mapRegion: MapRegion;
	longPressMarker: Location | null;
	clearLongPressMarker: () => void;
	handleRegionChange: (region: MapRegion) => void;
	handleMarkerPress: (markerId: string) => void;
	handleLongPress: (location: Location) => void;
	handleMapPress: (location: Location) => void;
	// Map controls
	mapHeading: number;
	isFollowingUser: boolean;
	handleHeadingChange: (heading: number) => void;
	handleResetHeading: () => void;
	handleLocateUser: () => void;
	// Navigation map data
	visibleSpots: SpotMarkerData[];
}

export const useHomeMapState = ({
	isNavigationActive,
	navigationRoute,
	driverRoute,
	spotsOnRoute,
	commonSpotsOnRoute,
	hasDriverComparison,
	onClearDriverComparison,
	onStopNavigationAndOpenSearch,
	spots,
	isPlacingSpot,
	isShowingForm,
	isSearchOpen,
	onSelectSpot,
	onSelectRouteSpot,
	mapViewRef,
	currentRegion,
	onRegionChange,
	userLocation,
}: UseHomeMapStateArgs): UseHomeMapStateReturn => {
	// === Map Region & Long Press ===
	const [mapRegion, setMapRegion] = useState<MapRegion>(currentRegion);
	const [longPressMarker, setLongPressMarker] = useState<Location | null>(null);
	const shouldIgnoreNextMapPressRef = useRef(false);

	const clearLongPressMarker = useCallback(() => {
		shouldIgnoreNextMapPressRef.current = false;
		setLongPressMarker(previous => (previous ? null : previous));
	}, []);

	const handleRegionChange = useCallback(
		(region: MapRegion) => {
			setMapRegion(region);
			onRegionChange(region);
			clearLongPressMarker();
		},
		[clearLongPressMarker, onRegionChange]
	);

	const handleMarkerPress = useCallback(
		(markerId: string) => {
			clearLongPressMarker();

			if (isNavigationActive) {
				const routeSpot = spotsOnRoute.find(({ spot }) => spot.id === markerId);
				if (routeSpot) {
					onSelectRouteSpot(routeSpot.spot);
					return;
				}
			}

			onSelectSpot(markerId);
		},
		[
			clearLongPressMarker,
			isNavigationActive,
			onSelectRouteSpot,
			onSelectSpot,
			spotsOnRoute,
		]
	);

	const handleLongPress = useCallback(
		(location: Location) => {
			if (
				isNavigationActive ||
				isPlacingSpot ||
				isShowingForm ||
				isSearchOpen
			) {
				return;
			}
			shouldIgnoreNextMapPressRef.current = true;
			setLongPressMarker(location);
		},
		[isNavigationActive, isPlacingSpot, isShowingForm, isSearchOpen]
	);

	const handleMapPress = useCallback(
		(_: Location) => {
			if (shouldIgnoreNextMapPressRef.current) {
				shouldIgnoreNextMapPressRef.current = false;
				return;
			}
			clearLongPressMarker();
		},
		[clearLongPressMarker]
	);

	// === Map Controls (heading, locate user) ===
	const [mapHeading, setMapHeading] = useState(0);
	const [isFollowingUser, setIsFollowingUser] = useState(false);
	const followUserTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);

	const handleHeadingChange = useCallback((heading: number) => {
		setMapHeading(heading);
	}, []);

	const handleResetHeading = useCallback(() => {
		mapViewRef.current?.animateToBearing(0);
		setMapHeading(0);
	}, [mapViewRef]);

	const handleLocateUser = useCallback(() => {
		if (!userLocation) return;

		const region: MapRegion = {
			latitude: userLocation.latitude,
			longitude: userLocation.longitude,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01,
		};

		mapViewRef.current?.animateToRegion(region, 500);
		setIsFollowingUser(true);

		if (followUserTimeoutRef.current) {
			clearTimeout(followUserTimeoutRef.current);
		}

		followUserTimeoutRef.current = setTimeout(() => {
			setIsFollowingUser(false);
			followUserTimeoutRef.current = null;
		}, 3000);
	}, [mapViewRef, userLocation]);

	useEffect(() => {
		return () => {
			if (followUserTimeoutRef.current) {
				clearTimeout(followUserTimeoutRef.current);
			}
		};
	}, []);

	// === Navigation Route Animation ===
	useEffect(() => {
		if (isNavigationActive && navigationRoute) {
			const polyline =
				driverRoute !== null
					? [...navigationRoute.polyline, ...driverRoute.polyline]
					: navigationRoute.polyline;
			const routeBounds = polylineToRegion(polyline);
			mapViewRef.current?.animateToRegion(routeBounds, 1000);
		}
	}, [driverRoute, isNavigationActive, mapViewRef, navigationRoute]);

	// === Visible Spots (filtered during navigation) ===
	const visibleSpots = useMemo(
		() =>
			isNavigationActive
				? (driverRoute ? commonSpotsOnRoute : spotsOnRoute).map(({ spot }) => ({
						id: spot.id as string,
						coordinates: spot.coordinates,
						title: spot.roadName,
						description: spot.direction,
					}))
				: spots,
		[commonSpotsOnRoute, driverRoute, isNavigationActive, spots, spotsOnRoute]
	);

	// === Android Back Handler (map-related) ===
	useFocusEffect(
		useCallback(() => {
			if (Platform.OS !== 'android') {
				return undefined;
			}

			const onBackPress = () => {
				// Handle navigation back
				if (isNavigationActive) {
					if (hasDriverComparison) {
						onClearDriverComparison();
						return true;
					}

					void onStopNavigationAndOpenSearch();
					return true;
				}

				// Handle long press marker
				if (longPressMarker) {
					clearLongPressMarker();
					return true;
				}

				return false;
			};

			const subscription = BackHandler.addEventListener(
				'hardwareBackPress',
				onBackPress
			);

			return () => subscription.remove();
		}, [
			clearLongPressMarker,
			hasDriverComparison,
			isNavigationActive,
			longPressMarker,
			onClearDriverComparison,
			onStopNavigationAndOpenSearch,
		])
	);

	return {
		mapRegion,
		longPressMarker,
		clearLongPressMarker,
		handleRegionChange,
		handleMarkerPress,
		handleLongPress,
		handleMapPress,
		mapHeading,
		isFollowingUser,
		handleHeadingChange,
		handleResetHeading,
		handleLocateUser,
		visibleSpots,
	};
};
