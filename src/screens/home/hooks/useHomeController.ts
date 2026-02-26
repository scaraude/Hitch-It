import { useCallback } from 'react';
import type { MapRegion } from '../../../types';
import type {
	HomeFixedOverlayState,
	HomeMapLayerState,
	HomeScreenViewModel,
	HomeSheetsOverlayState,
	HomeTabId,
	NamedLocation,
} from '../types';
import { useHomeControllerState } from './useHomeControllerState';

interface UseHomeControllerArgs {
	onRegionChange: (region: MapRegion) => void;
}

export const useHomeController = ({
	onRegionChange,
}: UseHomeControllerArgs): HomeScreenViewModel => {
	const state = useHomeControllerState({ onRegionChange });

	// Action adapters (inlined from useHomeActionAdapters)
	const handleTabPress = useCallback(
		(tabId: HomeTabId) => {
			switch (tabId) {
				case 'add':
					state.startPlacingSpot();
					break;
				case 'search':
					state.handleSearchToggle();
					break;
				case 'home':
				case 'history':
				case 'profile':
					break;
			}
		},
		[state.handleSearchToggle, state.startPlacingSpot]
	);

	const handleStopNavigationPress = useCallback(() => {
		void state.handleStopNavigationAndOpenSearch();
	}, [state.handleStopNavigationAndOpenSearch]);

	const onLongPressEmbarquer = useCallback(() => {
		state.handleLongPressEmbarquer(state.longPressMarker);
		state.clearLongPressMarker();
	}, [
		state.clearLongPressMarker,
		state.handleLongPressEmbarquer,
		state.longPressMarker,
	]);

	const onConfirmSpotPlacement = useCallback(() => {
		state.confirmSpotPlacement(state.mapRegion);
	}, [state.confirmSpotPlacement, state.mapRegion]);

	const handleEmbarquerStartPress = useCallback(
		(start: NamedLocation, destination: NamedLocation) => {
			void state.handleEmbarquerStart(start, destination);
		},
		[state.handleEmbarquerStart]
	);

	const handleSaveJourneyPress = useCallback(() => {
		void state.handleSaveJourney();
	}, [state.handleSaveJourney]);

	const handleDiscardJourneyPress = useCallback(() => {
		void state.handleDiscardJourney();
	}, [state.handleDiscardJourney]);

	// Build view models directly (inlined from useHomeViewModelBuilders)
	const mapLayer: HomeMapLayerState = {
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
	};

	const fixedOverlay: HomeFixedOverlayState = {
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
	};

	const sheetsOverlay: HomeSheetsOverlayState = {
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
	};

	return { mapLayer, fixedOverlay, sheetsOverlay };
};
