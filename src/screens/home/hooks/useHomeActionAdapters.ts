import { useCallback } from 'react';
import type { MapRegion } from '../../../types';
import type { HomeTabId, NamedLocation } from '../types';

interface UseHomeActionAdaptersArgs {
	startPlacingSpot: () => void;
	handleSearchToggle: () => void;
	handleStopNavigationAndOpenSearch: () => Promise<void>;
	handleLongPressEmbarquer: (
		location: NamedLocation['location'] | null
	) => void;
	longPressMarker: NamedLocation['location'] | null;
	clearLongPressMarker: () => void;
	confirmSpotPlacement: (region: MapRegion) => void;
	mapRegion: MapRegion;
	handleEmbarquerStart: (
		start: NamedLocation,
		destination: NamedLocation
	) => Promise<void>;
	handleSaveJourney: () => Promise<void>;
	handleDiscardJourney: () => Promise<void>;
}

interface UseHomeActionAdaptersReturn {
	handleTabPress: (tabId: HomeTabId) => void;
	handleStopNavigationPress: () => void;
	onLongPressEmbarquer: () => void;
	onConfirmSpotPlacement: () => void;
	handleEmbarquerStartPress: (
		start: NamedLocation,
		destination: NamedLocation
	) => void;
	handleSaveJourneyPress: () => void;
	handleDiscardJourneyPress: () => void;
}

export const useHomeActionAdapters = ({
	startPlacingSpot,
	handleSearchToggle,
	handleStopNavigationAndOpenSearch,
	handleLongPressEmbarquer,
	longPressMarker,
	clearLongPressMarker,
	confirmSpotPlacement,
	mapRegion,
	handleEmbarquerStart,
	handleSaveJourney,
	handleDiscardJourney,
}: UseHomeActionAdaptersArgs): UseHomeActionAdaptersReturn => {
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
		[handleSearchToggle, startPlacingSpot]
	);

	const handleStopNavigationPress = useCallback(() => {
		void handleStopNavigationAndOpenSearch();
	}, [handleStopNavigationAndOpenSearch]);

	const onLongPressEmbarquer = useCallback(() => {
		handleLongPressEmbarquer(longPressMarker);
		clearLongPressMarker();
	}, [clearLongPressMarker, handleLongPressEmbarquer, longPressMarker]);

	const onConfirmSpotPlacement = useCallback(() => {
		confirmSpotPlacement(mapRegion);
	}, [confirmSpotPlacement, mapRegion]);

	const handleEmbarquerStartPress = useCallback(
		(start: NamedLocation, destination: NamedLocation) => {
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
		handleTabPress,
		handleStopNavigationPress,
		onLongPressEmbarquer,
		onConfirmSpotPlacement,
		handleEmbarquerStartPress,
		handleSaveJourneyPress,
		handleDiscardJourneyPress,
	};
};
