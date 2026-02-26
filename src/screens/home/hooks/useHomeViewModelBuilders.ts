import type React from 'react';
import type { MapViewRef } from '../../../components';
import type { NavigationRoute, SpotOnRoute } from '../../../navigation/types';
import type { SpotFormData } from '../../../spot/hooks/useSpots';
import type { Spot, SpotMarkerData } from '../../../spot/types';
import type { Location, MapRegion } from '../../../types';
import type {
	HomeFixedOverlayState,
	HomeMapLayerState,
	HomeSheetsOverlayState,
	HomeTabId,
	NamedLocation,
} from '../types';

interface BuildMapLayerStateArgs {
	locationLoading: boolean;
	currentRegion: MapRegion;
	mapViewRef: React.RefObject<MapViewRef | null>;
	visibleSpots: SpotMarkerData[];
	navigationRoute: NavigationRoute | null;
	driverRoute: NavigationRoute | null;
	navigationDestinationMarker: {
		location: Location;
		name: string;
	} | null;
	searchDestination: NamedLocation | null;
	longPressMarker: Location | null;
	isPlacingSpot: boolean;
	showEmbarquerSheet: boolean;
	isNavigationActive: boolean;
	onRegionChange: (region: MapRegion) => void;
	onHeadingChange: (heading: number) => void;
	onMarkerPress: (markerId: string) => void;
	onLongPress: (location: Location) => void;
	onMapPress: (location: Location) => void;
}

export const buildHomeMapLayerState = ({
	locationLoading,
	currentRegion,
	mapViewRef,
	visibleSpots,
	navigationRoute,
	driverRoute,
	navigationDestinationMarker,
	searchDestination,
	longPressMarker,
	isPlacingSpot,
	showEmbarquerSheet,
	isNavigationActive,
	onRegionChange,
	onHeadingChange,
	onMarkerPress,
	onLongPress,
	onMapPress,
}: BuildMapLayerStateArgs): HomeMapLayerState => {
	return {
		locationLoading,
		currentRegion,
		mapViewRef,
		visibleSpots,
		navigationRoute,
		driverRoute,
		navigationDestinationMarker,
		searchDestination,
		longPressMarker,
		isPlacingSpot,
		showEmbarquerSheet,
		isNavigationActive,
		onRegionChange,
		onHeadingChange,
		onMarkerPress,
		onLongPress,
		onMapPress,
	};
};

interface BuildFixedOverlayStateArgs {
	isNavigationActive: boolean;
	navigationRoute: NavigationRoute | null;
	hasDriverComparison: boolean;
	canUseSearch: boolean;
	isSearchOpen: boolean;
	searchText: string;
	shouldShowSearchEmbarquer: boolean;
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	mapHeading: number;
	isFollowingUser: boolean;
	shouldShowBottomBar: boolean;
	longPressMarker: Location | null;
	onStopNavigation: () => void;
	onSearchTextChange: (text: string) => void;
	onSearchLocationSelected: (location: Location, name: string) => void;
	onSearchToggle: () => void;
	onSearchEmbarquer: () => void;
	onResetHeading: () => void;
	onLocateUser: () => void;
	onOpenDriverDirectionSheet: () => void;
	onClearDriverDirectionComparison: () => void;
	onLongPressEmbarquer: () => void;
	onTabPress: (tabId: HomeTabId) => void;
}

export const buildHomeFixedOverlayState = ({
	isNavigationActive,
	navigationRoute,
	hasDriverComparison,
	canUseSearch,
	isSearchOpen,
	searchText,
	shouldShowSearchEmbarquer,
	isPlacingSpot,
	isShowingForm,
	mapHeading,
	isFollowingUser,
	shouldShowBottomBar,
	longPressMarker,
	onStopNavigation,
	onSearchTextChange,
	onSearchLocationSelected,
	onSearchToggle,
	onSearchEmbarquer,
	onResetHeading,
	onLocateUser,
	onOpenDriverDirectionSheet,
	onClearDriverDirectionComparison,
	onLongPressEmbarquer,
	onTabPress,
}: BuildFixedOverlayStateArgs): HomeFixedOverlayState => {
	return {
		isNavigationActive,
		navigationRoute,
		hasDriverComparison,
		canUseSearch,
		isSearchOpen,
		searchText,
		shouldShowSearchEmbarquer,
		isPlacingSpot,
		isShowingForm,
		mapHeading,
		isFollowingUser,
		shouldShowBottomBar,
		longPressMarker,
		onStopNavigation,
		onSearchTextChange,
		onSearchLocationSelected,
		onSearchToggle,
		onSearchEmbarquer,
		onResetHeading,
		onLocateUser,
		onOpenDriverDirectionSheet,
		onClearDriverDirectionComparison,
		onLongPressEmbarquer,
		onTabPress,
	};
};

interface BuildSheetsOverlayStateArgs {
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	selectedSpot: Spot | null;
	showEmbarquerSheet: boolean;
	showDriverDirectionSheet: boolean;
	showCompletionSheet: boolean;
	navigationRoute: NavigationRoute | null;
	navigationSpotsOnRoute: SpotOnRoute[];
	journeyDurationMinutes: number;
	embarquerOrigin: NamedLocation | null;
	embarquerDestination: NamedLocation | null;
	userLocation: Location | null;
	onConfirmSpotPlacement: () => void;
	onCancelSpotPlacement: () => void;
	onSubmitSpotForm: (formData: SpotFormData) => void;
	onCancelSpotForm: () => void;
	onCloseSpotDetails: () => void;
	onSpotEmbarquer: (spot: Spot) => void;
	onEmbarquerStart: (start: NamedLocation, destination: NamedLocation) => void;
	onDriverDirectionCompare: (driverDestination: NamedLocation) => Promise<void>;
	onCloseDriverDirectionSheet: () => void;
	onEmbarquerClose: () => void;
	onSaveJourney: () => void;
	onDiscardJourney: () => void;
}

export const buildHomeSheetsOverlayState = ({
	isPlacingSpot,
	isShowingForm,
	selectedSpot,
	showEmbarquerSheet,
	showDriverDirectionSheet,
	showCompletionSheet,
	navigationRoute,
	navigationSpotsOnRoute,
	journeyDurationMinutes,
	embarquerOrigin,
	embarquerDestination,
	userLocation,
	onConfirmSpotPlacement,
	onCancelSpotPlacement,
	onSubmitSpotForm,
	onCancelSpotForm,
	onCloseSpotDetails,
	onSpotEmbarquer,
	onEmbarquerStart,
	onDriverDirectionCompare,
	onCloseDriverDirectionSheet,
	onEmbarquerClose,
	onSaveJourney,
	onDiscardJourney,
}: BuildSheetsOverlayStateArgs): HomeSheetsOverlayState => {
	return {
		isPlacingSpot,
		isShowingForm,
		selectedSpot,
		showEmbarquerSheet,
		showDriverDirectionSheet,
		showCompletionSheet,
		navigationRoute,
		navigationSpotsOnRoute,
		journeyDurationMinutes,
		embarquerOrigin,
		embarquerDestination,
		userLocation,
		onConfirmSpotPlacement,
		onCancelSpotPlacement,
		onSubmitSpotForm,
		onCancelSpotForm,
		onCloseSpotDetails,
		onSpotEmbarquer,
		onEmbarquerStart,
		onDriverDirectionCompare,
		onCloseDriverDirectionSheet,
		onEmbarquerClose,
		onSaveJourney,
		onDiscardJourney,
	};
};
