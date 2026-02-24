import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import type { SpotOnRoute } from '../../../navigation/types';
import type { Spot } from '../../../spot/types';
import type { Location, MapRegion } from '../../../types';

interface UseHomeMapInteractionsArgs {
	initialRegion: MapRegion;
	onRegionChange: (region: MapRegion) => void;
	isNavigationActive: boolean;
	hasDriverComparison: boolean;
	spotsOnRoute: SpotOnRoute[];
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	isSearchOpen: boolean;
	onClearDriverComparison: () => void;
	onStopNavigationFromBack: () => Promise<void>;
	onSelectSpot: (spotId: string) => void;
	onSelectRouteSpot: (spot: Spot) => void;
}

interface UseHomeMapInteractionsReturn {
	mapRegion: MapRegion;
	longPressMarker: Location | null;
	clearLongPressMarker: () => void;
	handleRegionChange: (region: MapRegion) => void;
	handleMarkerPress: (markerId: string) => void;
	handleLongPress: (location: Location) => void;
	handleMapPress: (location: Location) => void;
}

export const useHomeMapInteractions = ({
	initialRegion,
	onRegionChange,
	isNavigationActive,
	hasDriverComparison,
	spotsOnRoute,
	isPlacingSpot,
	isShowingForm,
	isSearchOpen,
	onClearDriverComparison,
	onStopNavigationFromBack,
	onSelectSpot,
	onSelectRouteSpot,
}: UseHomeMapInteractionsArgs): UseHomeMapInteractionsReturn => {
	const [mapRegion, setMapRegion] = useState<MapRegion>(initialRegion);
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

	useFocusEffect(
		useCallback(() => {
			if (Platform.OS !== 'android') {
				return undefined;
			}

			const onBackPress = () => {
				if (isNavigationActive) {
					if (hasDriverComparison) {
						onClearDriverComparison();
						return true;
					}

					void onStopNavigationFromBack();
					return true;
				}

				if (isSearchOpen) {
					if (longPressMarker) {
						clearLongPressMarker();
					}
					return false;
				}

				if (!longPressMarker) {
					return false;
				}

				clearLongPressMarker();
				return true;
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
			isSearchOpen,
			longPressMarker,
			onClearDriverComparison,
			onStopNavigationFromBack,
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
	};
};
