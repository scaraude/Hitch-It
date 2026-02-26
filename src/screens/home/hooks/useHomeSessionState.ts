import { useCallback, useEffect, useMemo, useState } from 'react';
import { toastUtils } from '../../../components/ui';
import { useArrivalDetection } from '../../../navigation/hooks';
import type { NavigationState } from '../../../navigation/types';
import type { Spot } from '../../../spot/types';
import type { Location } from '../../../types';
import { logger } from '../../../utils';
import type { NamedLocation } from '../types';

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
	// Journey completion
	showCompletionSheet: boolean;
	journeyDurationMinutes: number;
	handleStopNavigation: () => Promise<void>;
	handleSaveJourney: () => Promise<void>;
	handleDiscardJourney: () => Promise<void>;
	// Embarquer flow
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
	// Driver direction
	isDriverDirectionSheetOpen: boolean;
	hasDriverComparison: boolean;
	openDriverDirectionSheet: () => void;
	closeDriverDirectionSheet: () => void;
	handleDriverDirectionCompare: (
		driverDestination: NamedLocation
	) => Promise<void>;
	handleDriverDirectionClear: () => void;
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
	// === Journey Session State ===
	const [showCompletionSheet, setShowCompletionSheet] = useState(false);
	const [journeyStartTime, setJourneyStartTime] = useState<Date | null>(null);

	const { hasArrived } = useArrivalDetection(navigation.route, userLocation);

	useEffect(() => {
		if (hasArrived && navigation.isActive) {
			setShowCompletionSheet(true);
		}
	}, [hasArrived, navigation.isActive]);

	const journeyDurationMinutes = useMemo(
		() =>
			journeyStartTime
				? Math.round((Date.now() - journeyStartTime.getTime()) / 60000)
				: 0,
		[journeyStartTime]
	);

	const endNavigationSession = useCallback(
		async (
			options: {
				hideCompletionSheet?: boolean;
				resetJourneyStart?: boolean;
			} = {}
		) => {
			const { hideCompletionSheet = true, resetJourneyStart = true } = options;

			if (hideCompletionSheet) {
				setShowCompletionSheet(false);
			}

			stopNavigation();

			if (isRecording) {
				await stopRecording();
			}

			if (resetJourneyStart) {
				setJourneyStartTime(null);
			}
		},
		[isRecording, stopNavigation, stopRecording]
	);

	const handleStopNavigation = useCallback(async () => {
		await endNavigationSession({ hideCompletionSheet: false });
		logger.navigation.info('Navigation and journey recording stopped');
	}, [endNavigationSession]);

	const handleSaveJourney = useCallback(async () => {
		await endNavigationSession();
		toastUtils.success('Voyage sauvegardé', 'Votre voyage a été enregistré');
	}, [endNavigationSession]);

	const handleDiscardJourney = useCallback(async () => {
		await endNavigationSession();
	}, [endNavigationSession]);

	const markJourneyStarted = useCallback(() => {
		setJourneyStartTime(new Date());
	}, []);

	// === Embarquer Flow State ===
	const [showEmbarquerSheet, setShowEmbarquerSheet] = useState(false);
	const [embarquerOrigin, setEmbarquerOrigin] = useState<NamedLocation | null>(
		null
	);
	const [embarquerDestination, setEmbarquerDestination] =
		useState<NamedLocation | null>(null);

	const clearEmbarquerState = useCallback(() => {
		setShowEmbarquerSheet(false);
		setEmbarquerOrigin(null);
		setEmbarquerDestination(null);
	}, []);

	const handleEmbarquerFromSearch = useCallback(
		(destination: NamedLocation) => {
			setEmbarquerOrigin(null);
			setEmbarquerDestination(destination);
			setShowEmbarquerSheet(true);
		},
		[]
	);

	const handleLongPressEmbarquer = useCallback((location: Location | null) => {
		if (!location) return;

		setEmbarquerOrigin(null);
		setEmbarquerDestination({
			location,
			name: 'Position sélectionnée',
		});
		setShowEmbarquerSheet(true);
	}, []);

	const handleSpotEmbarquer = useCallback(
		(spot: Spot) => {
			onDeselectSpot();
			setEmbarquerOrigin({
				location: spot.coordinates,
				name: spot.roadName,
			});
			setShowEmbarquerSheet(true);
		},
		[onDeselectSpot]
	);

	const handleEmbarquerStart = useCallback(
		async (start: NamedLocation, destination: NamedLocation) => {
			clearEmbarquerState();

			const result = await startNavigationWithRoute(
				start.location,
				destination.location,
				destination.name
			);

			if (!result.success) {
				toastUtils.error('Erreur', result.message ?? 'Navigation impossible');
				return;
			}

			const journeyStarted = await startRecording();
			if (journeyStarted) {
				markJourneyStarted();
				logger.navigation.info('Journey recording started with custom route');
			}
		},
		[
			clearEmbarquerState,
			markJourneyStarted,
			startNavigationWithRoute,
			startRecording,
		]
	);

	// === Driver Direction State ===
	const [isDriverDirectionSheetOpen, setIsDriverDirectionSheetOpen] =
		useState(false);

	const openDriverDirectionSheet = useCallback(() => {
		setIsDriverDirectionSheetOpen(true);
	}, []);

	const closeDriverDirectionSheet = useCallback(() => {
		setIsDriverDirectionSheetOpen(false);
	}, []);

	const handleDriverDirectionCompare = useCallback(
		async (driverDestination: NamedLocation) => {
			const result = await compareWithDriverDirection(
				driverDestination.location,
				driverDestination.name
			);

			if (!result.success) {
				toastUtils.error('Erreur', result.message ?? 'Comparaison impossible');
				return;
			}

			logger.navigation.info('Driver direction comparison applied', {
				driverDestination: driverDestination.name,
			});
			setIsDriverDirectionSheetOpen(false);
		},
		[compareWithDriverDirection]
	);

	const handleDriverDirectionClear = useCallback(() => {
		clearDriverComparison();
	}, [clearDriverComparison]);

	return {
		// Journey completion
		showCompletionSheet,
		journeyDurationMinutes,
		handleStopNavigation,
		handleSaveJourney,
		handleDiscardJourney,
		// Embarquer flow
		showEmbarquerSheet,
		embarquerOrigin,
		embarquerDestination,
		handleEmbarquerFromSearch,
		handleLongPressEmbarquer,
		handleSpotEmbarquer,
		handleEmbarquerStart,
		handleEmbarquerClose: clearEmbarquerState,
		// Driver direction
		isDriverDirectionSheetOpen,
		hasDriverComparison: navigation.driverRoute !== null,
		openDriverDirectionSheet,
		closeDriverDirectionSheet,
		handleDriverDirectionCompare,
		handleDriverDirectionClear,
	};
};
