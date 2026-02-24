import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import type { MapViewRef } from '../components';
import { useLocation } from '../hooks';
import { JourneyProvider, useJourney } from '../journey/context';
import {
	NavigationProvider,
	useNavigation,
} from '../navigation/context/NavigationContext';
import { useArrivalDetection } from '../navigation/hooks';
import { SpotProvider, useSpotContext } from '../spot/context';
import type { MapBounds, MapRegion } from '../types';
import { calculateZoomLevel, regionToBounds } from '../utils';
import { HomeFixedOverlay } from './home/components/HomeFixedOverlay';
import { HomeMapLayer } from './home/components/HomeMapLayer';
import { HomeSheetsOverlay } from './home/components/HomeSheetsOverlay';
import { homeScreenStyles as styles } from './home/homeScreenStyles';
import { useHomeEmbarquerFlow } from './home/hooks/useHomeEmbarquerFlow';
import { useHomeJourneySession } from './home/hooks/useHomeJourneySession';
import { useHomeMapControls } from './home/hooks/useHomeMapControls';
import { useHomeMapInteractions } from './home/hooks/useHomeMapInteractions';
import { useHomeNavigationMapData } from './home/hooks/useHomeNavigationMapData';
import { useHomeSearch } from './home/hooks/useHomeSearch';
import type { HomeTabId } from './home/types';

interface HomeScreenContentProps {
	onRegionChange: (region: MapRegion) => void;
}

const HomeScreenContent: React.FC<HomeScreenContentProps> = ({
	onRegionChange,
}) => {
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
	const { navigation, startNavigationWithRoute, stopNavigation } =
		useNavigation();
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
		handleSearchToggle,
		handleSearchTextChange,
		handleSearchLocationSelected,
		handleSearchEmbarquer,
	} = useHomeSearch({
		canUseSearch,
		mapViewRef,
		onEmbarquerFromSearch: handleEmbarquerFromSearch,
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
		spotsOnRoute: navigation.spotsOnRoute,
		isPlacingSpot,
		isShowingForm,
		isSearchOpen,
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
		spotsOnRoute: navigation.spotsOnRoute,
		spots,
		mapViewRef,
	});

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

	return (
		<View style={styles.container}>
			<HomeMapLayer
				locationLoading={locationLoading}
				currentRegion={currentRegion}
				mapViewRef={mapViewRef}
				visibleSpots={visibleSpots}
				navigationRoute={navigation.route}
				navigationDestinationMarker={navigation.destinationMarker}
				searchDestination={searchDestination}
				longPressMarker={longPressMarker}
				isPlacingSpot={isPlacingSpot}
				showEmbarquerSheet={showEmbarquerSheet}
				isNavigationActive={navigation.isActive}
				onRegionChange={handleRegionChange}
				onHeadingChange={handleHeadingChange}
				onMarkerPress={handleMarkerPress}
				onLongPress={handleLongPress}
				onMapPress={handleMapPress}
			/>

			<HomeFixedOverlay
				isNavigationActive={navigation.isActive}
				navigationRoute={navigation.route}
				canUseSearch={canUseSearch}
				isSearchOpen={isSearchOpen}
				searchText={searchText}
				shouldShowSearchEmbarquer={shouldShowSearchEmbarquer}
				isPlacingSpot={isPlacingSpot}
				isShowingForm={isShowingForm}
				mapHeading={mapHeading}
				isFollowingUser={isFollowingUser}
				shouldShowBottomBar={shouldShowBottomBar}
				longPressMarker={longPressMarker}
				onStopNavigation={handleStopNavigation}
				onSearchTextChange={handleSearchTextChange}
				onSearchLocationSelected={handleSearchLocationSelected}
				onSearchToggle={handleSearchToggle}
				onSearchEmbarquer={handleSearchEmbarquer}
				onResetHeading={handleResetHeading}
				onLocateUser={handleLocateUser}
				onLongPressEmbarquer={onLongPressEmbarquer}
				onTabPress={handleTabPress}
			/>

			<HomeSheetsOverlay
				isPlacingSpot={isPlacingSpot}
				isShowingForm={isShowingForm}
				selectedSpot={selectedSpot}
				showEmbarquerSheet={showEmbarquerSheet}
				showCompletionSheet={showCompletionSheet}
				navigationRoute={navigation.route}
				navigationSpotsOnRoute={navigation.spotsOnRoute}
				journeyDurationMinutes={journeyDurationMinutes}
				embarquerOrigin={embarquerOrigin}
				embarquerDestination={embarquerDestination}
				onConfirmSpotPlacement={onConfirmSpotPlacement}
				onCancelSpotPlacement={cancelSpotPlacement}
				onSubmitSpotForm={submitSpotForm}
				onCancelSpotForm={cancelSpotForm}
				onCloseSpotDetails={deselectSpot}
				onSpotEmbarquer={handleSpotEmbarquer}
				onEmbarquerStart={handleEmbarquerStart}
				onEmbarquerClose={handleEmbarquerClose}
				onSaveJourney={handleSaveJourney}
				onDiscardJourney={handleDiscardJourney}
			/>
		</View>
	);
};

const HomeScreen: React.FC = () => {
	const [bounds, setBounds] = useState<MapBounds | null>(null);
	const [zoomLevel, setZoomLevel] = useState<number>(0);

	const handleRegionChange = (region: MapRegion) => {
		setBounds(regionToBounds(region));
		setZoomLevel(calculateZoomLevel(region));
	};

	const content = (
		<SpotProvider bounds={bounds} zoomLevel={zoomLevel}>
			<HomeScreenContent onRegionChange={handleRegionChange} />
		</SpotProvider>
	);

	return (
		<JourneyProvider>
			<NavigationProvider>{content}</NavigationProvider>
		</JourneyProvider>
	);
};

export default HomeScreen;
