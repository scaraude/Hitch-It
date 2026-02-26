import { useFocusEffect } from '@react-navigation/native';
import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Keyboard, Platform } from 'react-native';
import type { MapViewRef } from '../../../components';
import type { NavigationRoute, SpotOnRoute } from '../../../navigation/types';
import type { Spot, SpotMarkerData } from '../../../spot/types';
import type { Location, MapRegion } from '../../../types';
import { logger, polylineToRegion } from '../../../utils';
import type { NamedLocation } from '../types';

interface UseHomeMapSearchStateArgs {
	// Navigation state
	isNavigationActive: boolean;
	navigationRoute: NavigationRoute | null;
	driverRoute: NavigationRoute | null;
	spotsOnRoute: SpotOnRoute[];
	commonSpotsOnRoute: SpotOnRoute[];
	hasDriverComparison: boolean;
	onClearDriverComparison: () => void;
	onStopNavigation: () => Promise<void>;
	// Spot state
	spots: SpotMarkerData[];
	selectedSpot: Spot | null;
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	onSelectSpot: (spotId: string) => void;
	onSelectRouteSpot: (spot: Spot) => void;
	// Embarquer
	showEmbarquerSheet: boolean;
	showCompletionSheet: boolean;
	onEmbarquerFromSearch: (destination: NamedLocation) => void;
	// Map
	mapViewRef: RefObject<MapViewRef | null>;
	currentRegion: MapRegion;
	onRegionChange: (region: MapRegion) => void;
	userLocation: Location | null;
}

interface UseHomeMapSearchStateReturn {
	// Visibility
	canUseSearch: boolean;
	shouldShowBottomBar: boolean;
	// Search
	searchText: string;
	searchDestination: NamedLocation | null;
	isSearchOpen: boolean;
	shouldShowSearchEmbarquer: boolean;
	handleSearchToggle: () => void;
	handleSearchTextChange: (text: string) => void;
	handleSearchLocationSelected: (location: Location, name: string) => void;
	handleSearchEmbarquer: () => void;
	handleStopNavigationAndOpenSearch: () => Promise<void>;
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

export const useHomeMapSearchState = ({
	isNavigationActive,
	navigationRoute,
	driverRoute,
	spotsOnRoute,
	commonSpotsOnRoute,
	hasDriverComparison,
	onClearDriverComparison,
	onStopNavigation,
	spots,
	selectedSpot,
	isPlacingSpot,
	isShowingForm,
	onSelectSpot,
	onSelectRouteSpot,
	showEmbarquerSheet,
	showCompletionSheet,
	onEmbarquerFromSearch,
	mapViewRef,
	currentRegion,
	onRegionChange,
	userLocation,
}: UseHomeMapSearchStateArgs): UseHomeMapSearchStateReturn => {
	// === Visibility State (inlined from useHomeVisibilityState) ===
	const { canUseSearch, shouldShowBottomBar } = useMemo(() => {
		const isOverlayBlocking =
			isPlacingSpot ||
			isShowingForm ||
			showEmbarquerSheet ||
			Boolean(selectedSpot) ||
			showCompletionSheet;
		const canSearch = !isNavigationActive && !isOverlayBlocking;

		return {
			canUseSearch: canSearch,
			shouldShowBottomBar: !isNavigationActive && !isOverlayBlocking,
		};
	}, [
		isNavigationActive,
		isPlacingSpot,
		isShowingForm,
		selectedSpot,
		showCompletionSheet,
		showEmbarquerSheet,
	]);

	// === Search State (inlined from useHomeSearch) ===
	const [searchText, setSearchText] = useState('');
	const [searchDestination, setSearchDestination] =
		useState<NamedLocation | null>(null);
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const handleSearchOpen = useCallback(() => {
		if (!canUseSearch) return;
		setIsSearchOpen(true);
	}, [canUseSearch]);

	const handleSearchToggle = useCallback(() => {
		if (!canUseSearch) return;
		setIsSearchOpen(prev => !prev);
		if (isSearchOpen) {
			Keyboard.dismiss();
		}
	}, [canUseSearch, isSearchOpen]);

	const handleSearchClear = useCallback(() => {
		setSearchText('');
		setSearchDestination(null);
		setIsSearchOpen(false);
		Keyboard.dismiss();
	}, []);

	const handleSearchTextChange = useCallback(
		(text: string) => {
			setSearchText(text);
			if (searchDestination && text !== searchDestination.name) {
				setSearchDestination(null);
			}
		},
		[searchDestination]
	);

	const handleSearchLocationSelected = useCallback(
		(location: Location, name: string) => {
			setSearchDestination({ location, name });
			setSearchText(name);

			const region: MapRegion = {
				latitude: location.latitude,
				longitude: location.longitude,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
			};

			mapViewRef.current?.animateToRegion(region, 1000);
			logger.navigation.info(`Search destination set: ${name}`);
		},
		[mapViewRef]
	);

	const handleSearchEmbarquer = useCallback(() => {
		if (!searchDestination) return;
		onEmbarquerFromSearch(searchDestination);
		setIsSearchOpen(false);
		Keyboard.dismiss();
	}, [onEmbarquerFromSearch, searchDestination]);

	useEffect(() => {
		if (!canUseSearch && isSearchOpen) {
			setIsSearchOpen(false);
		}
	}, [canUseSearch, isSearchOpen]);

	// === Search Reopen After Navigation (inlined from useHomeSearchReopenAfterNavigation) ===
	const [
		shouldOpenSearchAfterNavigationStop,
		setShouldOpenSearchAfterNavigationStop,
	] = useState(false);

	const handleStopNavigationAndOpenSearch = useCallback(async () => {
		setShouldOpenSearchAfterNavigationStop(true);
		await onStopNavigation();
	}, [onStopNavigation]);

	useEffect(() => {
		if (!shouldOpenSearchAfterNavigationStop || !canUseSearch) {
			return;
		}

		handleSearchOpen();
		setShouldOpenSearchAfterNavigationStop(false);
	}, [canUseSearch, handleSearchOpen, shouldOpenSearchAfterNavigationStop]);

	// === Map Interactions (inlined from useHomeMapInteractions) ===
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

	// === Map Controls (inlined from useHomeMapControls) ===
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

	// === Navigation Map Data (inlined from useHomeNavigationMapData) ===
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

	// === Back Handler for Android ===
	useFocusEffect(
		useCallback(() => {
			if (Platform.OS !== 'android') {
				return undefined;
			}

			const onBackPress = () => {
				// Handle search back
				if (isSearchOpen) {
					handleSearchClear();
					return true;
				}

				// Handle navigation back
				if (isNavigationActive) {
					if (hasDriverComparison) {
						onClearDriverComparison();
						return true;
					}

					void handleStopNavigationAndOpenSearch();
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
			handleSearchClear,
			handleStopNavigationAndOpenSearch,
			hasDriverComparison,
			isNavigationActive,
			isSearchOpen,
			longPressMarker,
			onClearDriverComparison,
		])
	);

	const shouldShowSearchEmbarquer =
		!!searchDestination && !isNavigationActive && !showEmbarquerSheet;

	return {
		// Visibility
		canUseSearch,
		shouldShowBottomBar,
		// Search
		searchText,
		searchDestination,
		isSearchOpen,
		shouldShowSearchEmbarquer,
		handleSearchToggle,
		handleSearchTextChange,
		handleSearchLocationSelected,
		handleSearchEmbarquer,
		handleStopNavigationAndOpenSearch,
		// Map interactions
		mapRegion,
		longPressMarker,
		clearLongPressMarker,
		handleRegionChange,
		handleMarkerPress,
		handleLongPress,
		handleMapPress,
		// Map controls
		mapHeading,
		isFollowingUser,
		handleHeadingChange,
		handleResetHeading,
		handleLocateUser,
		// Navigation map data
		visibleSpots,
	};
};
