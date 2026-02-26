import type { MapViewRef } from '../../../components';
import type { NavigationState } from '../../../navigation/types';
import type { Spot, SpotMarkerData } from '../../../spot/types';
import type { Location, MapRegion } from '../../../types';
import type { NamedLocation } from '../types';
import { useHomeMapControls } from './useHomeMapControls';
import { useHomeMapInteractions } from './useHomeMapInteractions';
import { useHomeNavigationMapData } from './useHomeNavigationMapData';
import { useHomeSearch } from './useHomeSearch';
import { useHomeSearchReopenAfterNavigation } from './useHomeSearchReopenAfterNavigation';
import { useHomeVisibilityState } from './useHomeVisibilityState';

interface UseHomeMapSearchStateArgs {
	navigation: NavigationState;
	spots: SpotMarkerData[];
	selectedSpot: Spot | null;
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	showEmbarquerSheet: boolean;
	showCompletionSheet: boolean;
	hasDriverComparison: boolean;
	onClearDriverComparison: () => void;
	onStopNavigation: () => Promise<void>;
	onEmbarquerFromSearch: (destination: NamedLocation) => void;
	mapViewRef: React.RefObject<MapViewRef | null>;
	currentRegion: MapRegion;
	onRegionChange: (region: MapRegion) => void;
	onSelectSpot: (spotId: string) => void;
	onSelectRouteSpot: (spot: Spot) => void;
	userLocation: Location | null;
}

interface UseHomeMapSearchStateReturn {
	canUseSearch: boolean;
	shouldShowBottomBar: boolean;
	shouldShowSearchEmbarquer: boolean;
	searchText: string;
	searchDestination: NamedLocation | null;
	isSearchOpen: boolean;
	handleSearchToggle: () => void;
	handleSearchTextChange: (text: string) => void;
	handleSearchLocationSelected: (location: Location, name: string) => void;
	handleSearchEmbarquer: () => void;
	handleStopNavigationAndOpenSearch: () => Promise<void>;
	mapRegion: MapRegion;
	longPressMarker: Location | null;
	clearLongPressMarker: () => void;
	handleRegionChange: (region: MapRegion) => void;
	handleMarkerPress: (markerId: string) => void;
	handleLongPress: (location: Location) => void;
	handleMapPress: (location: Location) => void;
	mapHeading: number;
	isFollowingUser: boolean;
	handleHeadingChange: (heading: number) => void;
	handleResetHeading: () => void;
	handleLocateUser: () => void;
	visibleSpots: SpotMarkerData[];
}

export const useHomeMapSearchState = ({
	navigation,
	spots,
	selectedSpot,
	isPlacingSpot,
	isShowingForm,
	showEmbarquerSheet,
	showCompletionSheet,
	hasDriverComparison,
	onClearDriverComparison,
	onStopNavigation,
	onEmbarquerFromSearch,
	mapViewRef,
	currentRegion,
	onRegionChange,
	onSelectSpot,
	onSelectRouteSpot,
	userLocation,
}: UseHomeMapSearchStateArgs): UseHomeMapSearchStateReturn => {
	const { canUseSearch, shouldShowBottomBar } = useHomeVisibilityState({
		isNavigationActive: navigation.isActive,
		isPlacingSpot,
		isShowingForm,
		showEmbarquerSheet,
		selectedSpot,
		showCompletionSheet,
	});

	const {
		searchText,
		searchDestination,
		isSearchOpen,
		handleSearchOpen,
		handleSearchToggle,
		handleSearchTextChange,
		handleSearchLocationSelected,
		handleSearchEmbarquer,
	} = useHomeSearch({
		canUseSearch,
		mapViewRef,
		onEmbarquerFromSearch,
	});

	const { handleStopNavigationAndOpenSearch } =
		useHomeSearchReopenAfterNavigation({
			canUseSearch,
			handleSearchOpen,
			handleStopNavigation: onStopNavigation,
		});

	const {
		mapRegion,
		longPressMarker,
		clearLongPressMarker,
		handleRegionChange,
		handleMarkerPress,
		handleLongPress,
		handleMapPress,
	} = useHomeMapInteractions({
		initialRegion: currentRegion,
		onRegionChange,
		isNavigationActive: navigation.isActive,
		hasDriverComparison,
		spotsOnRoute: navigation.spotsOnRoute,
		isPlacingSpot,
		isShowingForm,
		isSearchOpen,
		onClearDriverComparison,
		onStopNavigationFromBack: handleStopNavigationAndOpenSearch,
		onSelectSpot,
		onSelectRouteSpot,
	});

	const {
		mapHeading,
		isFollowingUser,
		handleHeadingChange,
		handleResetHeading,
		handleLocateUser,
	} = useHomeMapControls({
		userLocation,
		mapViewRef,
	});

	const { visibleSpots } = useHomeNavigationMapData({
		isNavigationActive: navigation.isActive,
		navigationRoute: navigation.route,
		driverRoute: navigation.driverRoute,
		spotsOnRoute: navigation.spotsOnRoute,
		commonSpotsOnRoute: navigation.commonSpotsOnRoute,
		spots,
		mapViewRef,
	});

	const shouldShowSearchEmbarquer =
		!!searchDestination && !navigation.isActive && !showEmbarquerSheet;

	return {
		canUseSearch,
		shouldShowBottomBar,
		shouldShowSearchEmbarquer,
		searchText,
		searchDestination,
		isSearchOpen,
		handleSearchToggle,
		handleSearchTextChange,
		handleSearchLocationSelected,
		handleSearchEmbarquer,
		handleStopNavigationAndOpenSearch,
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
