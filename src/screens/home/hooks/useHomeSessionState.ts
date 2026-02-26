import { useArrivalDetection } from '../../../navigation/hooks';
import type { NavigationState } from '../../../navigation/types';
import type { Spot } from '../../../spot/types';
import type { Location } from '../../../types';
import type { NamedLocation } from '../types';
import { useHomeDriverDirection } from './useHomeDriverDirection';
import { useHomeEmbarquerFlow } from './useHomeEmbarquerFlow';
import { useHomeJourneySession } from './useHomeJourneySession';

interface CompareResult {
	success: boolean;
	message?: string;
}

interface NavigationStartResult {
	success: boolean;
	message?: string;
}

interface UseHomeSessionStateArgs {
	navigation: NavigationState;
	userLocation: Location | null;
	startNavigationWithRoute: (
		startLocation: Location,
		destinationLocation: Location,
		destinationName: string
	) => Promise<NavigationStartResult>;
	compareWithDriverDirection: (
		driverDestinationLocation: NamedLocation['location'],
		driverDestinationName: string
	) => Promise<CompareResult>;
	clearDriverComparison: () => void;
	stopNavigation: () => void;
	startRecording: () => Promise<boolean>;
	stopRecording: () => Promise<void>;
	isRecording: boolean;
	onDeselectSpot: () => void;
}

interface UseHomeSessionStateReturn {
	showCompletionSheet: boolean;
	journeyDurationMinutes: number;
	showEmbarquerSheet: boolean;
	embarquerOrigin: NamedLocation | null;
	embarquerDestination: NamedLocation | null;
	handleEmbarquerFromSearch: (destination: NamedLocation) => void;
	handleLongPressEmbarquer: (location: Location | null) => void;
	handleSpotEmbarquer: (spot: Spot) => void;
	handleEmbarquerStart: (
		start: NamedLocation,
		destination: NamedLocation
	) => Promise<void>;
	handleEmbarquerClose: () => void;
	isDriverDirectionSheetOpen: boolean;
	hasDriverComparison: boolean;
	openDriverDirectionSheet: () => void;
	closeDriverDirectionSheet: () => void;
	handleDriverDirectionCompare: (
		driverDestination: NamedLocation
	) => Promise<void>;
	handleDriverDirectionClear: () => void;
	handleStopNavigation: () => Promise<void>;
	handleSaveJourney: () => Promise<void>;
	handleDiscardJourney: () => Promise<void>;
}

export const useHomeSessionState = ({
	navigation,
	userLocation,
	startNavigationWithRoute,
	compareWithDriverDirection,
	clearDriverComparison,
	stopNavigation,
	startRecording,
	stopRecording,
	isRecording,
	onDeselectSpot,
}: UseHomeSessionStateArgs): UseHomeSessionStateReturn => {
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
		onDeselectSpot,
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

	return {
		showCompletionSheet,
		journeyDurationMinutes,
		showEmbarquerSheet,
		embarquerOrigin,
		embarquerDestination,
		handleEmbarquerFromSearch,
		handleLongPressEmbarquer,
		handleSpotEmbarquer,
		handleEmbarquerStart,
		handleEmbarquerClose,
		isDriverDirectionSheetOpen,
		hasDriverComparison,
		openDriverDirectionSheet,
		closeDriverDirectionSheet,
		handleDriverDirectionCompare,
		handleDriverDirectionClear,
		handleStopNavigation,
		handleSaveJourney,
		handleDiscardJourney,
	};
};
