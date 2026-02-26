import type React from 'react';
import type { MapViewRef } from '../../components';
import type {
	DestinationMarker,
	NavigationRoute,
	NavigationState,
	SpotOnRoute,
} from '../../navigation/types';
import type { SpotFormData } from '../../spot/hooks/useSpots';
import type { Spot, SpotMarkerData } from '../../spot/types';
import type { Location, MapRegion } from '../../types';

export type HomeTabId = 'home' | 'search' | 'add' | 'history' | 'profile';

export interface NamedLocation {
	location: Location;
	name: string;
}

export interface HomeMapLayerState {
	locationLoading: boolean;
	currentRegion: MapRegion;
	mapViewRef: React.RefObject<MapViewRef | null>;
	visibleSpots: SpotMarkerData[];
	navigationRoute: NavigationRoute | null;
	driverRoute: NavigationRoute | null;
	navigationDestinationMarker: DestinationMarker | null;
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

export interface HomeFixedOverlayState {
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

export interface HomeSheetsOverlayState {
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

export interface HomeScreenViewModel {
	mapLayer: HomeMapLayerState;
	fixedOverlay: HomeFixedOverlayState;
	sheetsOverlay: HomeSheetsOverlayState;
}

export interface HomeControllerState {
	userLocation: Location | null;
	currentRegion: MapRegion;
	locationLoading: boolean;
	mapViewRef: React.RefObject<MapViewRef | null>;
	visibleSpots: SpotMarkerData[];
	navigation: NavigationState;
	selectedSpot: Spot | null;
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	showEmbarquerSheet: boolean;
	showCompletionSheet: boolean;
	isDriverDirectionSheetOpen: boolean;
	hasDriverComparison: boolean;
	shouldShowBottomBar: boolean;
	canUseSearch: boolean;
	shouldShowSearchEmbarquer: boolean;
	searchText: string;
	searchDestination: NamedLocation | null;
	isSearchOpen: boolean;
	mapHeading: number;
	isFollowingUser: boolean;
	longPressMarker: Location | null;
	mapRegion: MapRegion;
	journeyDurationMinutes: number;
	embarquerOrigin: NamedLocation | null;
	embarquerDestination: NamedLocation | null;
	startPlacingSpot: () => void;
	confirmSpotPlacement: (region: MapRegion) => void;
	cancelSpotPlacement: () => void;
	submitSpotForm: (formData: SpotFormData) => void;
	cancelSpotForm: () => void;
	deselectSpot: () => void;
	handleSearchToggle: () => void;
	handleSearchTextChange: (text: string) => void;
	handleSearchLocationSelected: (location: Location, name: string) => void;
	handleSearchEmbarquer: () => void;
	handleRegionChange: (region: MapRegion) => void;
	handleHeadingChange: (heading: number) => void;
	handleMarkerPress: (markerId: string) => void;
	handleLongPress: (location: Location) => void;
	handleMapPress: (location: Location) => void;
	handleResetHeading: () => void;
	handleLocateUser: () => void;
	openDriverDirectionSheet: () => void;
	handleDriverDirectionClear: () => void;
	handleDriverDirectionCompare: (
		driverDestination: NamedLocation
	) => Promise<void>;
	closeDriverDirectionSheet: () => void;
	handleEmbarquerClose: () => void;
	handleSpotEmbarquer: (spot: Spot) => void;
	handleEmbarquerStart: (
		start: NamedLocation,
		destination: NamedLocation
	) => Promise<void>;
	handleLongPressEmbarquer: (location: Location | null) => void;
	clearLongPressMarker: () => void;
	handleStopNavigationAndOpenSearch: () => Promise<void>;
	handleSaveJourney: () => Promise<void>;
	handleDiscardJourney: () => Promise<void>;
}
