import { useRef } from 'react';
import type { MapViewRef } from '../../../components';
import { useLocation } from '../../../hooks';
import { useJourney } from '../../../journey/context';
import { useNavigation } from '../../../navigation/context/NavigationContext';
import { useSpotContext } from '../../../spot/context';
import type { MapRegion } from '../../../types';
import type { HomeControllerState } from '../types';
import { useHomeMapState } from './useHomeMapState';
import { useHomeSearchState } from './useHomeSearchState';
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

	const searchState = useHomeSearchState({
		isNavigationActive: navigationState.navigation.isActive,
		isPlacingSpot: spotState.isPlacingSpot,
		isShowingForm: spotState.isShowingForm,
		showEmbarquerSheet: sessionState.showEmbarquerSheet,
		showCompletionSheet: sessionState.showCompletionSheet,
		selectedSpot: spotState.selectedSpot,
		onEmbarquerFromSearch: sessionState.handleEmbarquerFromSearch,
		onStopNavigation: sessionState.handleStopNavigation,
		mapViewRef,
	});

	const mapState = useHomeMapState({
		isNavigationActive: navigationState.navigation.isActive,
		navigationRoute: navigationState.navigation.route,
		driverRoute: navigationState.navigation.driverRoute,
		spotsOnRoute: navigationState.navigation.spotsOnRoute,
		commonSpotsOnRoute: navigationState.navigation.commonSpotsOnRoute,
		hasDriverComparison: sessionState.hasDriverComparison,
		onClearDriverComparison: sessionState.handleDriverDirectionClear,
		onStopNavigationAndOpenSearch:
			searchState.handleStopNavigationAndOpenSearch,
		spots: spotState.spots,
		isPlacingSpot: spotState.isPlacingSpot,
		isShowingForm: spotState.isShowingForm,
		isSearchOpen: searchState.isSearchOpen,
		onSelectSpot: spotState.selectSpot,
		onSelectRouteSpot: spotState.selectSpotEntity,
		mapViewRef,
		currentRegion,
		onRegionChange,
		userLocation,
	});

	return {
		userLocation,
		currentRegion,
		locationLoading,
		mapViewRef,
		visibleSpots: mapState.visibleSpots,
		navigation: navigationState.navigation,
		selectedSpot: spotState.selectedSpot,
		isPlacingSpot: spotState.isPlacingSpot,
		isShowingForm: spotState.isShowingForm,
		showEmbarquerSheet: sessionState.showEmbarquerSheet,
		showCompletionSheet: sessionState.showCompletionSheet,
		isDriverDirectionSheetOpen: sessionState.isDriverDirectionSheetOpen,
		hasDriverComparison: sessionState.hasDriverComparison,
		shouldShowBottomBar: searchState.shouldShowBottomBar,
		canUseSearch: searchState.canUseSearch,
		shouldShowSearchEmbarquer: searchState.shouldShowSearchEmbarquer,
		searchText: searchState.searchText,
		searchDestination: searchState.searchDestination,
		isSearchOpen: searchState.isSearchOpen,
		mapHeading: mapState.mapHeading,
		isFollowingUser: mapState.isFollowingUser,
		longPressMarker: mapState.longPressMarker,
		mapRegion: mapState.mapRegion,
		journeyDurationMinutes: sessionState.journeyDurationMinutes,
		embarquerOrigin: sessionState.embarquerOrigin,
		embarquerDestination: sessionState.embarquerDestination,
		startPlacingSpot: spotState.startPlacingSpot,
		confirmSpotPlacement: spotState.confirmSpotPlacement,
		cancelSpotPlacement: spotState.cancelSpotPlacement,
		submitSpotForm: spotState.submitSpotForm,
		cancelSpotForm: spotState.cancelSpotForm,
		deselectSpot: spotState.deselectSpot,
		handleSearchToggle: searchState.handleSearchToggle,
		handleSearchTextChange: searchState.handleSearchTextChange,
		handleSearchLocationSelected: searchState.handleSearchLocationSelected,
		handleSearchEmbarquer: searchState.handleSearchEmbarquer,
		handleRegionChange: mapState.handleRegionChange,
		handleHeadingChange: mapState.handleHeadingChange,
		handleMarkerPress: mapState.handleMarkerPress,
		handleLongPress: mapState.handleLongPress,
		handleMapPress: mapState.handleMapPress,
		handleResetHeading: mapState.handleResetHeading,
		handleLocateUser: mapState.handleLocateUser,
		openDriverDirectionSheet: sessionState.openDriverDirectionSheet,
		handleDriverDirectionClear: sessionState.handleDriverDirectionClear,
		handleDriverDirectionCompare: sessionState.handleDriverDirectionCompare,
		closeDriverDirectionSheet: sessionState.closeDriverDirectionSheet,
		handleEmbarquerClose: sessionState.handleEmbarquerClose,
		handleSpotEmbarquer: sessionState.handleSpotEmbarquer,
		handleEmbarquerStart: sessionState.handleEmbarquerStart,
		handleLongPressEmbarquer: sessionState.handleLongPressEmbarquer,
		clearLongPressMarker: mapState.clearLongPressMarker,
		handleStopNavigationAndOpenSearch:
			searchState.handleStopNavigationAndOpenSearch,
		handleSaveJourney: sessionState.handleSaveJourney,
		handleDiscardJourney: sessionState.handleDiscardJourney,
	};
};
