import { useFocusEffect } from '@react-navigation/native';
import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Keyboard, Platform } from 'react-native';
import type { MapViewRef } from '../../../components';
import type { Location, MapRegion } from '../../../types';
import { logger } from '../../../utils';
import type { NamedLocation } from '../types';

interface UseHomeSearchArgs {
	canUseSearch: boolean;
	mapViewRef: RefObject<MapViewRef | null>;
	onEmbarquerFromSearch: (destination: NamedLocation) => void;
}

interface UseHomeSearchReturn {
	searchText: string;
	searchDestination: NamedLocation | null;
	isSearchOpen: boolean;
	handleSearchToggle: () => void;
	handleSearchClear: () => void;
	handleSearchTextChange: (text: string) => void;
	handleSearchLocationSelected: (location: Location, name: string) => void;
	handleSearchEmbarquer: () => void;
}

export const useHomeSearch = ({
	canUseSearch,
	mapViewRef,
	onEmbarquerFromSearch,
}: UseHomeSearchArgs): UseHomeSearchReturn => {
	const [searchText, setSearchText] = useState('');
	const [searchDestination, setSearchDestination] =
		useState<NamedLocation | null>(null);
	const [isSearchOpen, setIsSearchOpen] = useState(false);

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

	const handleSearchEmbarquer = useCallback(() => {
		if (!searchDestination) return;
		onEmbarquerFromSearch(searchDestination);
		setIsSearchOpen(false);
		Keyboard.dismiss();
	}, [onEmbarquerFromSearch, searchDestination]);

	useEffect(() => {
		if (!canUseSearch && isSearchOpen) {
			setIsSearchOpen(false);
		}
	}, [canUseSearch, isSearchOpen]);

	return {
		searchText,
		searchDestination,
		isSearchOpen,
		handleSearchToggle,
		handleSearchClear,
		handleSearchTextChange,
		handleSearchLocationSelected,
		handleSearchEmbarquer,
	};
};
