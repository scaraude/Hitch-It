import { useFocusEffect } from '@react-navigation/native';
import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Keyboard, Platform } from 'react-native';
import type { MapViewRef } from '../../../components';
import type { Spot } from '../../../spot/types';
import type { Location, MapRegion } from '../../../types';
import { logger } from '../../../utils';
import type { NamedLocation } from '../types';

interface UseHomeSearchStateArgs {
	// Visibility dependencies
	isNavigationActive: boolean;
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	showNavigationSetupSheet: boolean;
	showCompletionSheet: boolean;
	selectedSpot: Spot | null;
	// Search actions
	onNavigationSetupFromSearch: (destination: NamedLocation) => void;
	onStopNavigation: () => Promise<void>;
	// Map
	mapViewRef: RefObject<MapViewRef | null>;
}

export interface UseHomeSearchStateReturn {
	// Visibility
	canUseSearch: boolean;
	shouldShowBottomBar: boolean;
	// Search state
	searchText: string;
	searchDestination: NamedLocation | null;
	isSearchOpen: boolean;
	shouldShowSearchNavigationSetup: boolean;
	// Search actions
	handleSearchToggle: () => void;
	handleSearchClear: () => void;
	handleSearchTextChange: (text: string) => void;
	handleSearchLocationSelected: (location: Location, name: string) => void;
	handleSearchNavigationSetup: () => void;
	handleStopNavigationAndOpenSearch: () => Promise<void>;
}

export const useHomeSearchState = ({
	isNavigationActive,
	isPlacingSpot,
	isShowingForm,
	showNavigationSetupSheet,
	showCompletionSheet,
	selectedSpot,
	onNavigationSetupFromSearch,
	onStopNavigation,
	mapViewRef,
}: UseHomeSearchStateArgs): UseHomeSearchStateReturn => {
	// === Visibility State ===
	const { canUseSearch, shouldShowBottomBar } = useMemo(() => {
		const isOverlayBlocking =
			isPlacingSpot ||
			isShowingForm ||
			showNavigationSetupSheet ||
			Boolean(selectedSpot) ||
			showCompletionSheet;
		const canSearch = !isNavigationActive && !isOverlayBlocking;

		return {
			canUseSearch: canSearch,
			shouldShowBottomBar: !isNavigationActive && !isOverlayBlocking,
		};
	}, [
		isNavigationActive,
		isPlacingSpot,
		isShowingForm,
		selectedSpot,
		showCompletionSheet,
		showNavigationSetupSheet,
	]);

	// === Search State ===
	const [searchText, setSearchText] = useState('');
	const [searchDestination, setSearchDestination] =
		useState<NamedLocation | null>(null);
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const handleSearchOpen = useCallback(() => {
		if (!canUseSearch) return;
		setIsSearchOpen(true);
	}, [canUseSearch]);

	const handleSearchToggle = useCallback(() => {
		if (!canUseSearch) return;
		setIsSearchOpen(prev => !prev);
		if (isSearchOpen) {
			Keyboard.dismiss();
		}
	}, [canUseSearch, isSearchOpen]);

	const handleSearchClear = useCallback(() => {
		setSearchText('');
		setSearchDestination(null);
		setIsSearchOpen(false);
		Keyboard.dismiss();
	}, []);

	const handleSearchTextChange = useCallback(
		(text: string) => {
			setSearchText(text);
			if (searchDestination && text !== searchDestination.name) {
				setSearchDestination(null);
			}
		},
		[searchDestination]
	);

	const handleSearchLocationSelected = useCallback(
		(location: Location, name: string) => {
			setSearchDestination({ location, name });
			setSearchText(name);

			const region: MapRegion = {
				latitude: location.latitude,
				longitude: location.longitude,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
			};

			mapViewRef.current?.animateToRegion(region, 1000);
			logger.navigation.info(`Search destination set: ${name}`);
		},
		[mapViewRef]
	);

	const handleSearchNavigationSetup = useCallback(() => {
		if (!searchDestination) return;
		onNavigationSetupFromSearch(searchDestination);
		setIsSearchOpen(false);
		Keyboard.dismiss();
	}, [onNavigationSetupFromSearch, searchDestination]);

	// Close search when it becomes unavailable
	useEffect(() => {
		if (!canUseSearch && isSearchOpen) {
			setIsSearchOpen(false);
			Keyboard.dismiss();
		}
	}, [canUseSearch, isSearchOpen]);

	// === Search Reopen After Navigation Stop ===
	const [
		shouldOpenSearchAfterNavigationStop,
		setShouldOpenSearchAfterNavigationStop,
	] = useState(false);

	const handleStopNavigationAndOpenSearch = useCallback(async () => {
		setShouldOpenSearchAfterNavigationStop(true);
		await onStopNavigation();
	}, [onStopNavigation]);

	useEffect(() => {
		if (!shouldOpenSearchAfterNavigationStop || !canUseSearch) {
			return;
		}

		handleSearchOpen();
		setShouldOpenSearchAfterNavigationStop(false);
	}, [canUseSearch, handleSearchOpen, shouldOpenSearchAfterNavigationStop]);

	// === Android Back Handler (search-related) ===
	useFocusEffect(
		useCallback(() => {
			if (Platform.OS !== 'android') {
				return undefined;
			}

			const onBackPress = () => {
				if (!isSearchOpen) return false;
				handleSearchClear();
				return true;
			};

			const subscription = BackHandler.addEventListener(
				'hardwareBackPress',
				onBackPress
			);
			return () => subscription.remove();
		}, [handleSearchClear, isSearchOpen])
	);

	const shouldShowSearchNavigationSetup =
		!!searchDestination && !isNavigationActive && !showNavigationSetupSheet;

	return {
		canUseSearch,
		shouldShowBottomBar,
		searchText,
		searchDestination,
		isSearchOpen,
		shouldShowSearchNavigationSetup,
		handleSearchToggle,
		handleSearchClear,
		handleSearchTextChange,
		handleSearchLocationSelected,
		handleSearchNavigationSetup,
		handleStopNavigationAndOpenSearch,
	};
};
