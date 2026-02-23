import { useCallback, useState } from 'react';
import type { SpotOnRoute } from '../../../navigation/types';
import type { Spot } from '../../../spot/types';
import type { Location, MapRegion } from '../../../types';

interface UseHomeMapInteractionsArgs {
	initialRegion: MapRegion;
	onRegionChange: (region: MapRegion) => void;
	isNavigationActive: boolean;
	spotsOnRoute: SpotOnRoute[];
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	isSearchOpen: boolean;
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
}

export const useHomeMapInteractions = ({
	initialRegion,
	onRegionChange,
	isNavigationActive,
	spotsOnRoute,
	isPlacingSpot,
	isShowingForm,
	isSearchOpen,
	onSelectSpot,
	onSelectRouteSpot,
}: UseHomeMapInteractionsArgs): UseHomeMapInteractionsReturn => {
	const [mapRegion, setMapRegion] = useState<MapRegion>(initialRegion);
	const [longPressMarker, setLongPressMarker] = useState<Location | null>(null);

	const clearLongPressMarker = useCallback(() => {
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
			setLongPressMarker(location);
		},
		[isNavigationActive, isPlacingSpot, isShowingForm, isSearchOpen]
	);

	return {
		mapRegion,
		longPressMarker,
		clearLongPressMarker,
		handleRegionChange,
		handleMarkerPress,
		handleLongPress,
	};
};
