import type { MapRegion } from '../../../types';
import type { HomeScreenViewModel } from '../types';
import { useHomeActionAdapters } from './useHomeActionAdapters';
import { useHomeControllerState } from './useHomeControllerState';
import {
	buildHomeFixedOverlayState,
	buildHomeMapLayerState,
	buildHomeSheetsOverlayState,
} from './useHomeViewModelBuilders';

interface UseHomeControllerArgs {
	onRegionChange: (region: MapRegion) => void;
}

export const useHomeController = ({
	onRegionChange,
}: UseHomeControllerArgs): HomeScreenViewModel => {
	const state = useHomeControllerState({ onRegionChange });

	const {
		handleTabPress,
		handleStopNavigationPress,
		onLongPressEmbarquer,
		onConfirmSpotPlacement,
		handleEmbarquerStartPress,
		handleSaveJourneyPress,
		handleDiscardJourneyPress,
	} = useHomeActionAdapters({
		startPlacingSpot: state.startPlacingSpot,
		handleSearchToggle: state.handleSearchToggle,
		handleStopNavigationAndOpenSearch: state.handleStopNavigationAndOpenSearch,
		handleLongPressEmbarquer: state.handleLongPressEmbarquer,
		longPressMarker: state.longPressMarker,
		clearLongPressMarker: state.clearLongPressMarker,
		confirmSpotPlacement: state.confirmSpotPlacement,
		mapRegion: state.mapRegion,
		handleEmbarquerStart: state.handleEmbarquerStart,
		handleSaveJourney: state.handleSaveJourney,
		handleDiscardJourney: state.handleDiscardJourney,
	});

	const mapLayer = buildHomeMapLayerState({
		locationLoading: state.locationLoading,
		currentRegion: state.currentRegion,
		mapViewRef: state.mapViewRef,
		visibleSpots: state.visibleSpots,
		navigationRoute: state.navigation.route,
		driverRoute: state.navigation.driverRoute,
		navigationDestinationMarker: state.navigation.destinationMarker,
		searchDestination: state.searchDestination,
		longPressMarker: state.longPressMarker,
		isPlacingSpot: state.isPlacingSpot,
		showEmbarquerSheet: state.showEmbarquerSheet,
		isNavigationActive: state.navigation.isActive,
		onRegionChange: state.handleRegionChange,
		onHeadingChange: state.handleHeadingChange,
		onMarkerPress: state.handleMarkerPress,
		onLongPress: state.handleLongPress,
		onMapPress: state.handleMapPress,
	});

	const fixedOverlay = buildHomeFixedOverlayState({
		isNavigationActive: state.navigation.isActive,
		navigationRoute: state.navigation.route,
		hasDriverComparison: state.hasDriverComparison,
		canUseSearch: state.canUseSearch,
		isSearchOpen: state.isSearchOpen,
		searchText: state.searchText,
		shouldShowSearchEmbarquer: state.shouldShowSearchEmbarquer,
		isPlacingSpot: state.isPlacingSpot,
		isShowingForm: state.isShowingForm,
		mapHeading: state.mapHeading,
		isFollowingUser: state.isFollowingUser,
		shouldShowBottomBar: state.shouldShowBottomBar,
		longPressMarker: state.longPressMarker,
		onStopNavigation: handleStopNavigationPress,
		onSearchTextChange: state.handleSearchTextChange,
		onSearchLocationSelected: state.handleSearchLocationSelected,
		onSearchToggle: state.handleSearchToggle,
		onSearchEmbarquer: state.handleSearchEmbarquer,
		onResetHeading: state.handleResetHeading,
		onLocateUser: state.handleLocateUser,
		onOpenDriverDirectionSheet: state.openDriverDirectionSheet,
		onClearDriverDirectionComparison: state.handleDriverDirectionClear,
		onLongPressEmbarquer,
		onTabPress: handleTabPress,
	});

	const sheetsOverlay = buildHomeSheetsOverlayState({
		isPlacingSpot: state.isPlacingSpot,
		isShowingForm: state.isShowingForm,
		selectedSpot: state.selectedSpot,
		showEmbarquerSheet: state.showEmbarquerSheet,
		showDriverDirectionSheet: state.isDriverDirectionSheetOpen,
		showCompletionSheet: state.showCompletionSheet,
		navigationRoute: state.navigation.route,
		navigationSpotsOnRoute: state.navigation.spotsOnRoute,
		journeyDurationMinutes: state.journeyDurationMinutes,
		embarquerOrigin: state.embarquerOrigin,
		embarquerDestination: state.embarquerDestination,
		userLocation: state.userLocation,
		onConfirmSpotPlacement,
		onCancelSpotPlacement: state.cancelSpotPlacement,
		onSubmitSpotForm: state.submitSpotForm,
		onCancelSpotForm: state.cancelSpotForm,
		onCloseSpotDetails: state.deselectSpot,
		onSpotEmbarquer: state.handleSpotEmbarquer,
		onEmbarquerStart: handleEmbarquerStartPress,
		onDriverDirectionCompare: state.handleDriverDirectionCompare,
		onCloseDriverDirectionSheet: state.closeDriverDirectionSheet,
		onEmbarquerClose: state.handleEmbarquerClose,
		onSaveJourney: handleSaveJourneyPress,
		onDiscardJourney: handleDiscardJourneyPress,
	});

	return { mapLayer, fixedOverlay, sheetsOverlay };
};
