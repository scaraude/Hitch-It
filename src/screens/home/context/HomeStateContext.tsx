import type React from 'react';
import { createContext, useContext, useRef } from 'react';
import type { MapViewRef } from '../../../components';
import { useLocation } from '../../../hooks';
import { useJourney } from '../../../journey/context';
import { useNavigation } from '../../../navigation/context/NavigationContext';
import { useSpotContext } from '../../../spot/context';
import type { MapRegion } from '../../../types';
import {
	type UseHomeMapStateReturn,
	useHomeMapState,
} from '../hooks/useHomeMapState';
import {
	type UseHomeSearchStateReturn,
	useHomeSearchState,
} from '../hooks/useHomeSearchState';
import {
	type UseHomeSessionStateReturn,
	useHomeSessionState,
} from '../hooks/useHomeSessionState';

// Re-export hook return types for consumers
export type { UseHomeMapStateReturn as HomeMapState };
export type { UseHomeSearchStateReturn as HomeSearchState };
export type { UseHomeSessionStateReturn as HomeSessionState };

interface HomeStateContextValue {
	// Location
	userLocation: ReturnType<typeof useLocation>['userLocation'];
	currentRegion: ReturnType<typeof useLocation>['currentRegion'];
	locationLoading: ReturnType<typeof useLocation>['locationLoading'];
	// Refs
	mapViewRef: React.RefObject<MapViewRef | null>;
	// Grouped state
	session: UseHomeSessionStateReturn;
	search: UseHomeSearchStateReturn;
	map: UseHomeMapStateReturn;
	// Context hooks (for actions not in local state)
	spot: ReturnType<typeof useSpotContext>;
	nav: ReturnType<typeof useNavigation>;
}

const HomeStateContext = createContext<HomeStateContextValue | null>(null);

interface HomeStateProviderProps {
	children: React.ReactNode;
	onRegionChange: (region: MapRegion) => void;
}

export const HomeStateProvider: React.FC<HomeStateProviderProps> = ({
	children,
	onRegionChange,
}) => {
	const { userLocation, currentRegion, locationLoading } = useLocation();
	const spot = useSpotContext();
	const nav = useNavigation();
	const journey = useJourney();
	const mapViewRef = useRef<MapViewRef>(null);

	const session = useHomeSessionState({
		navigation: nav.navigation,
		userLocation,
		startNavigationWithRoute: nav.startNavigationWithRoute,
		compareWithDriverDirection: nav.compareWithDriverDirection,
		clearDriverComparison: nav.clearDriverComparison,
		stopNavigation: nav.stopNavigation,
		startRecording: journey.startRecording,
		stopRecording: journey.stopRecording,
		isRecording: journey.isRecording,
		onDeselectSpot: spot.deselectSpot,
	});

	const search = useHomeSearchState({
		isNavigationActive: nav.navigation.isActive,
		isPlacingSpot: spot.isPlacingSpot,
		isShowingForm: spot.isShowingForm,
		showEmbarquerSheet: session.showEmbarquerSheet,
		showCompletionSheet: session.showCompletionSheet,
		selectedSpot: spot.selectedSpot,
		onEmbarquerFromSearch: session.handleEmbarquerFromSearch,
		onStopNavigation: session.handleStopNavigation,
		mapViewRef,
	});

	const map = useHomeMapState({
		isNavigationActive: nav.navigation.isActive,
		navigationRoute: nav.navigation.route,
		driverRoute: nav.navigation.driverRoute,
		spotsOnRoute: nav.navigation.spotsOnRoute,
		commonSpotsOnRoute: nav.navigation.commonSpotsOnRoute,
		hasDriverComparison: session.hasDriverComparison,
		onClearDriverComparison: session.handleDriverDirectionClear,
		onStopNavigationAndOpenSearch: search.handleStopNavigationAndOpenSearch,
		spots: spot.spots,
		isPlacingSpot: spot.isPlacingSpot,
		isShowingForm: spot.isShowingForm,
		isSearchOpen: search.isSearchOpen,
		onSelectSpot: spot.selectSpot,
		onSelectRouteSpot: spot.selectSpotEntity,
		mapViewRef,
		currentRegion,
		onRegionChange,
		userLocation,
	});

	const value: HomeStateContextValue = {
		userLocation,
		currentRegion,
		locationLoading,
		mapViewRef,
		session,
		search,
		map,
		spot,
		nav,
	};

	return (
		<HomeStateContext.Provider value={value}>
			{children}
		</HomeStateContext.Provider>
	);
};

// Individual hooks for components to consume only what they need

export const useHomeLocation = () => {
	const ctx = useContext(HomeStateContext);
	if (!ctx)
		throw new Error('useHomeLocation must be used within HomeStateProvider');
	return {
		userLocation: ctx.userLocation,
		currentRegion: ctx.currentRegion,
		locationLoading: ctx.locationLoading,
	};
};

export const useHomeMapRef = () => {
	const ctx = useContext(HomeStateContext);
	if (!ctx)
		throw new Error('useHomeMapRef must be used within HomeStateProvider');
	return ctx.mapViewRef;
};

export const useHomeSession = () => {
	const ctx = useContext(HomeStateContext);
	if (!ctx)
		throw new Error('useHomeSession must be used within HomeStateProvider');
	return ctx.session;
};

export const useHomeSearch = () => {
	const ctx = useContext(HomeStateContext);
	if (!ctx)
		throw new Error('useHomeSearch must be used within HomeStateProvider');
	return ctx.search;
};

export const useHomeMap = () => {
	const ctx = useContext(HomeStateContext);
	if (!ctx) throw new Error('useHomeMap must be used within HomeStateProvider');
	return ctx.map;
};

export const useHomeSpot = () => {
	const ctx = useContext(HomeStateContext);
	if (!ctx)
		throw new Error('useHomeSpot must be used within HomeStateProvider');
	return ctx.spot;
};

export const useHomeNav = () => {
	const ctx = useContext(HomeStateContext);
	if (!ctx) throw new Error('useHomeNav must be used within HomeStateProvider');
	return ctx.nav;
};
