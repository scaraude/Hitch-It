import { useRef } from 'react';
import type { MapViewRef } from '../../../components';
import { useLocation } from '../../../hooks';
import { useJourney } from '../../../journey/context';
import { useNavigation } from '../../../navigation/context/NavigationContext';
import { useSpotContext } from '../../../spot/context';
import type { MapRegion } from '../../../types';
import type { HomeControllerState } from '../types';
import { useHomeMapSearchState } from './useHomeMapSearchState';
import { useHomeSessionState } from './useHomeSessionState';

interface UseHomeControllerStateArgs {
	onRegionChange: (region: MapRegion) => void;
}

export const useHomeControllerState = ({
	onRegionChange,
}: UseHomeControllerStateArgs): HomeControllerState => {
	const { userLocation, currentRegion, locationLoading } = useLocation();
	const spotState = useSpotContext();
	const navigationState = useNavigation();
	const journeyState = useJourney();
	const mapViewRef = useRef<MapViewRef>(null);

	const sessionState = useHomeSessionState({
		navigation: navigationState.navigation,
		userLocation,
		startNavigationWithRoute: navigationState.startNavigationWithRoute,
		compareWithDriverDirection: navigationState.compareWithDriverDirection,
		clearDriverComparison: navigationState.clearDriverComparison,
		stopNavigation: navigationState.stopNavigation,
		startRecording: journeyState.startRecording,
		stopRecording: journeyState.stopRecording,
		isRecording: journeyState.isRecording,
		onDeselectSpot: spotState.deselectSpot,
	});

	const mapSearchState = useHomeMapSearchState({
		navigation: navigationState.navigation,
		spots: spotState.spots,
		selectedSpot: spotState.selectedSpot,
		isPlacingSpot: spotState.isPlacingSpot,
		isShowingForm: spotState.isShowingForm,
		showEmbarquerSheet: sessionState.showEmbarquerSheet,
		showCompletionSheet: sessionState.showCompletionSheet,
		hasDriverComparison: sessionState.hasDriverComparison,
		onClearDriverComparison: sessionState.handleDriverDirectionClear,
		onStopNavigation: sessionState.handleStopNavigation,
		onEmbarquerFromSearch: sessionState.handleEmbarquerFromSearch,
		mapViewRef,
		currentRegion,
		onRegionChange,
		onSelectSpot: spotState.selectSpot,
		onSelectRouteSpot: spotState.selectSpotEntity,
		userLocation,
	});

	return {
		userLocation,
		currentRegion,
		locationLoading,
		mapViewRef,
		visibleSpots: mapSearchState.visibleSpots,
		navigation: navigationState.navigation,
		selectedSpot: spotState.selectedSpot,
		isPlacingSpot: spotState.isPlacingSpot,
		isShowingForm: spotState.isShowingForm,
		showEmbarquerSheet: sessionState.showEmbarquerSheet,
		showCompletionSheet: sessionState.showCompletionSheet,
		isDriverDirectionSheetOpen: sessionState.isDriverDirectionSheetOpen,
		hasDriverComparison: sessionState.hasDriverComparison,
		shouldShowBottomBar: mapSearchState.shouldShowBottomBar,
		canUseSearch: mapSearchState.canUseSearch,
		shouldShowSearchEmbarquer: mapSearchState.shouldShowSearchEmbarquer,
		searchText: mapSearchState.searchText,
		searchDestination: mapSearchState.searchDestination,
		isSearchOpen: mapSearchState.isSearchOpen,
		mapHeading: mapSearchState.mapHeading,
		isFollowingUser: mapSearchState.isFollowingUser,
		longPressMarker: mapSearchState.longPressMarker,
		mapRegion: mapSearchState.mapRegion,
		journeyDurationMinutes: sessionState.journeyDurationMinutes,
		embarquerOrigin: sessionState.embarquerOrigin,
		embarquerDestination: sessionState.embarquerDestination,
		startPlacingSpot: spotState.startPlacingSpot,
		confirmSpotPlacement: spotState.confirmSpotPlacement,
		cancelSpotPlacement: spotState.cancelSpotPlacement,
		submitSpotForm: spotState.submitSpotForm,
		cancelSpotForm: spotState.cancelSpotForm,
		deselectSpot: spotState.deselectSpot,
		handleSearchToggle: mapSearchState.handleSearchToggle,
		handleSearchTextChange: mapSearchState.handleSearchTextChange,
		handleSearchLocationSelected: mapSearchState.handleSearchLocationSelected,
		handleSearchEmbarquer: mapSearchState.handleSearchEmbarquer,
		handleRegionChange: mapSearchState.handleRegionChange,
		handleHeadingChange: mapSearchState.handleHeadingChange,
		handleMarkerPress: mapSearchState.handleMarkerPress,
		handleLongPress: mapSearchState.handleLongPress,
		handleMapPress: mapSearchState.handleMapPress,
		handleResetHeading: mapSearchState.handleResetHeading,
		handleLocateUser: mapSearchState.handleLocateUser,
		openDriverDirectionSheet: sessionState.openDriverDirectionSheet,
		handleDriverDirectionClear: sessionState.handleDriverDirectionClear,
		handleDriverDirectionCompare: sessionState.handleDriverDirectionCompare,
		closeDriverDirectionSheet: sessionState.closeDriverDirectionSheet,
		handleEmbarquerClose: sessionState.handleEmbarquerClose,
		handleSpotEmbarquer: sessionState.handleSpotEmbarquer,
		handleEmbarquerStart: sessionState.handleEmbarquerStart,
		handleLongPressEmbarquer: sessionState.handleLongPressEmbarquer,
		clearLongPressMarker: mapSearchState.clearLongPressMarker,
		handleStopNavigationAndOpenSearch:
			mapSearchState.handleStopNavigationAndOpenSearch,
		handleSaveJourney: sessionState.handleSaveJourney,
		handleDiscardJourney: sessionState.handleDiscardJourney,
	};
};
