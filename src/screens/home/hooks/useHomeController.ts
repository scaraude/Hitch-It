import { useCallback, useEffect, useRef, useState } from 'react';
import type { MapViewRef } from '../../../components';
import { useLocation } from '../../../hooks';
import { useJourney } from '../../../journey/context';
import { useNavigation } from '../../../navigation/context/NavigationContext';
import { useArrivalDetection } from '../../../navigation/hooks';
import { useSpotContext } from '../../../spot/context';
import type { MapRegion } from '../../../types';
import type { HomeScreenViewModel, HomeTabId } from '../types';
import { useHomeDriverDirection } from './useHomeDriverDirection';
import { useHomeEmbarquerFlow } from './useHomeEmbarquerFlow';
import { useHomeJourneySession } from './useHomeJourneySession';
import { useHomeMapControls } from './useHomeMapControls';
import { useHomeMapInteractions } from './useHomeMapInteractions';
import { useHomeNavigationMapData } from './useHomeNavigationMapData';
import { useHomeSearch } from './useHomeSearch';

interface UseHomeControllerArgs {
	onRegionChange: (region: MapRegion) => void;
}

export const useHomeController = ({
	onRegionChange,
}: UseHomeControllerArgs): HomeScreenViewModel => {
	const [
		shouldOpenSearchAfterNavigationStop,
		setShouldOpenSearchAfterNavigationStop,
	] = useState(false);
	const { userLocation, currentRegion, locationLoading } = useLocation();
	const {
		spots,
		selectedSpot,
		isPlacingSpot,
		isShowingForm,
		startPlacingSpot,
		confirmSpotPlacement,
		cancelSpotPlacement,
		submitSpotForm,
		cancelSpotForm,
		selectSpot,
		selectSpotEntity,
		deselectSpot,
	} = useSpotContext();
	const {
		navigation,
		startNavigationWithRoute,
		compareWithDriverDirection,
		clearDriverComparison,
		stopNavigation,
	} = useNavigation();
	const { startRecording, stopRecording, isRecording } = useJourney();

	const mapViewRef = useRef<MapViewRef>(null);
	const { hasArrived } = useArrivalDetection(navigation.route, userLocation);

	const {
		showCompletionSheet,
		journeyDurationMinutes,
		markJourneyStarted,
		handleStopNavigation,
		handleSaveJourney,
		handleDiscardJourney,
	} = useHomeJourneySession({
		hasArrived,
		isNavigationActive: navigation.isActive,
		isRecording,
		stopNavigation,
		stopRecording,
	});

	const {
		showEmbarquerSheet,
		embarquerOrigin,
		embarquerDestination,
		handleEmbarquerFromSearch,
		handleLongPressEmbarquer,
		handleSpotEmbarquer,
		handleEmbarquerStart,
		handleEmbarquerClose,
	} = useHomeEmbarquerFlow({
		startNavigationWithRoute,
		startRecording,
		markJourneyStarted,
		onDeselectSpot: deselectSpot,
	});

	const {
		isDriverDirectionSheetOpen,
		hasDriverComparison,
		openDriverDirectionSheet,
		closeDriverDirectionSheet,
		handleDriverDirectionCompare,
		handleDriverDirectionClear,
	} = useHomeDriverDirection({
		driverRoute: navigation.driverRoute,
		compareWithDriverDirection,
		clearDriverComparison,
	});

	const canUseSearch =
		!navigation.isActive &&
		!isPlacingSpot &&
		!isShowingForm &&
		!showEmbarquerSheet &&
		!selectedSpot &&
		!showCompletionSheet;

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
		onEmbarquerFromSearch: handleEmbarquerFromSearch,
	});

	const handleStopNavigationAndOpenSearch = useCallback(async () => {
		setShouldOpenSearchAfterNavigationStop(true);
		await handleStopNavigation();
	}, [handleStopNavigation]);

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
		onClearDriverComparison: handleDriverDirectionClear,
		onStopNavigationFromBack: handleStopNavigationAndOpenSearch,
		onSelectSpot: selectSpot,
		onSelectRouteSpot: selectSpotEntity,
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

	useEffect(() => {
		if (!shouldOpenSearchAfterNavigationStop || !canUseSearch) {
			return;
		}

		handleSearchOpen();
		setShouldOpenSearchAfterNavigationStop(false);
	}, [canUseSearch, handleSearchOpen, shouldOpenSearchAfterNavigationStop]);

	const onLongPressEmbarquer = useCallback(() => {
		handleLongPressEmbarquer(longPressMarker);
		clearLongPressMarker();
	}, [clearLongPressMarker, handleLongPressEmbarquer, longPressMarker]);

	const onConfirmSpotPlacement = useCallback(() => {
		confirmSpotPlacement(mapRegion);
	}, [confirmSpotPlacement, mapRegion]);

	const shouldShowBottomBar =
		!navigation.isActive &&
		!isPlacingSpot &&
		!isShowingForm &&
		!showEmbarquerSheet &&
		!selectedSpot &&
		!showCompletionSheet;

	const shouldShowSearchEmbarquer =
		!!searchDestination && !navigation.isActive && !showEmbarquerSheet;

	const handleTabPress = useCallback(
		(tabId: HomeTabId) => {
			switch (tabId) {
				case 'add':
					startPlacingSpot();
					break;
				case 'search':
					handleSearchToggle();
					break;
				case 'home':
				case 'history':
				case 'profile':
					break;
			}
		},
		[startPlacingSpot, handleSearchToggle]
	);

	const handleStopNavigationPress = useCallback(() => {
		void handleStopNavigationAndOpenSearch();
	}, [handleStopNavigationAndOpenSearch]);

	const handleEmbarquerStartPress = useCallback(
		(
			start: Parameters<typeof handleEmbarquerStart>[0],
			destination: Parameters<typeof handleEmbarquerStart>[1]
		) => {
			void handleEmbarquerStart(start, destination);
		},
		[handleEmbarquerStart]
	);

	const handleSaveJourneyPress = useCallback(() => {
		void handleSaveJourney();
	}, [handleSaveJourney]);

	const handleDiscardJourneyPress = useCallback(() => {
		void handleDiscardJourney();
	}, [handleDiscardJourney]);

	return {
		mapLayer: {
			locationLoading,
			currentRegion,
			mapViewRef,
			visibleSpots,
			navigationRoute: navigation.route,
			driverRoute: navigation.driverRoute,
			navigationDestinationMarker: navigation.destinationMarker,
			searchDestination,
			longPressMarker,
			isPlacingSpot,
			showEmbarquerSheet,
			isNavigationActive: navigation.isActive,
			onRegionChange: handleRegionChange,
			onHeadingChange: handleHeadingChange,
			onMarkerPress: handleMarkerPress,
			onLongPress: handleLongPress,
			onMapPress: handleMapPress,
		},
		fixedOverlay: {
			isNavigationActive: navigation.isActive,
			navigationRoute: navigation.route,
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
			onStopNavigation: handleStopNavigationPress,
			onSearchTextChange: handleSearchTextChange,
			onSearchLocationSelected: handleSearchLocationSelected,
			onSearchToggle: handleSearchToggle,
			onSearchEmbarquer: handleSearchEmbarquer,
			onResetHeading: handleResetHeading,
			onLocateUser: handleLocateUser,
			onOpenDriverDirectionSheet: openDriverDirectionSheet,
			onClearDriverDirectionComparison: handleDriverDirectionClear,
			onLongPressEmbarquer,
			onTabPress: handleTabPress,
		},
		sheetsOverlay: {
			isPlacingSpot,
			isShowingForm,
			selectedSpot,
			showEmbarquerSheet,
			showDriverDirectionSheet: isDriverDirectionSheetOpen,
			showCompletionSheet,
			navigationRoute: navigation.route,
			navigationSpotsOnRoute: navigation.spotsOnRoute,
			journeyDurationMinutes,
			embarquerOrigin,
			embarquerDestination,
			userLocation,
			onConfirmSpotPlacement,
			onCancelSpotPlacement: cancelSpotPlacement,
			onSubmitSpotForm: submitSpotForm,
			onCancelSpotForm: cancelSpotForm,
			onCloseSpotDetails: deselectSpot,
			onSpotEmbarquer: handleSpotEmbarquer,
			onEmbarquerStart: handleEmbarquerStartPress,
			onDriverDirectionCompare: handleDriverDirectionCompare,
			onCloseDriverDirectionSheet: closeDriverDirectionSheet,
			onEmbarquerClose: handleEmbarquerClose,
			onSaveJourney: handleSaveJourneyPress,
			onDiscardJourney: handleDiscardJourneyPress,
		},
	};
};
