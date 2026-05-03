import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { toastUtils } from '../../../components/ui';
import { useArrivalDetection } from '../../../navigation/hooks';
import type {
	NavigationRoute,
	NavigationState,
	RootStackParamList,
	SpotOnRoute,
} from '../../../navigation/types';
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
	isAuthenticated: boolean;
	hasActiveJourney: boolean;
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
	discardJourney: () => Promise<void>;
	isRecording: boolean;
	onDeselectSpot: () => void;
}

export interface UseHomeSessionStateReturn {
	// Journey completion
	showCompletionSheet: boolean;
	completionRoute: NavigationRoute | null;
	completionSpotsUsed: SpotOnRoute[];
	journeyDurationMinutes: number;
	handleStopNavigation: () => Promise<void>;
	handleSaveJourney: () => Promise<void>;
	handleDiscardJourney: () => Promise<void>;
	// Arrival prompt (replaces the previous auto-stop behavior)
	showArrivalPromptSheet: boolean;
	arrivalPromptDestinationName: string;
	handleArrivalPromptFinish: () => Promise<void>;
	handleArrivalPromptContinue: () => void;
	// NavigationSetup flow
	showNavigationSetupSheet: boolean;
	navigationSetupOrigin: NamedLocation | null;
	navigationSetupDestination: NamedLocation | null;
	handleNavigationSetupFromSearch: (destination: NamedLocation) => void;
	handleLongPressNavigationSetup: (location: Location | null) => void;
	handleSpotNavigationSetup: (spot: Spot) => void;
	handleNavigationSetupStart: (
		start: NamedLocation,
		destination: NamedLocation
	) => Promise<void>;
	handleNavigationSetupClose: () => void;
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
	isAuthenticated,
	hasActiveJourney,
	userLocation,
	startNavigationWithRoute,
	compareWithDriverDirection,
	clearDriverComparison,
	stopNavigation,
	startRecording,
	stopRecording,
	discardJourney,
	isRecording,
	onDeselectSpot,
}: UseHomeSessionStateArgs): UseHomeSessionStateReturn => {
	const rootNavigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	// === Journey Session State ===
	const [showCompletionSheet, setShowCompletionSheet] = useState(false);
	const [completionRoute, setCompletionRoute] =
		useState<NavigationRoute | null>(null);
	const [completionSpotsUsed, setCompletionSpotsUsed] = useState<SpotOnRoute[]>(
		[]
	);
	const [journeyStartTime, setJourneyStartTime] = useState<Date | null>(null);
	const [showArrivalPromptSheet, setShowArrivalPromptSheet] = useState(false);
	const [arrivalPromptDestinationName, setArrivalPromptDestinationName] =
		useState('');
	const hasHandledArrivalRef = useRef(false);

	const { hasArrived } = useArrivalDetection(navigation.route, userLocation);

	useEffect(() => {
		if (!navigation.isActive || !navigation.route) {
			hasHandledArrivalRef.current = false;
			return;
		}

		if (!hasArrived || hasHandledArrivalRef.current) {
			return;
		}

		hasHandledArrivalRef.current = true;

		if (!hasActiveJourney) {
			stopNavigation();
			toastUtils.info('Destination proche', 'Arrivée détectée');
			return;
		}

		// Active recording: prompt the user instead of auto-stopping. The
		// underlying useArrivalDetection guards against re-trigger within the
		// same session, so picking "Continue" leaves the sheet permanently
		// dismissed for this trip.
		setArrivalPromptDestinationName(navigation.route.destinationName);
		setShowArrivalPromptSheet(true);
	}, [
		hasArrived,
		hasActiveJourney,
		navigation.isActive,
		navigation.route,
		stopNavigation,
	]);

	const journeyDurationMinutes = useMemo(
		() =>
			journeyStartTime
				? Math.round((Date.now() - journeyStartTime.getTime()) / 60000)
				: 0,
		[journeyStartTime]
	);

	const clearCompletionState = useCallback(() => {
		setCompletionRoute(null);
		setCompletionSpotsUsed([]);
		hasHandledArrivalRef.current = false;
	}, []);

	const endNavigationSession = useCallback(
		async (
			options: {
				hideCompletionSheet?: boolean;
				resetJourneyStart?: boolean;
				clearCompletionData?: boolean;
			} = {}
		) => {
			const {
				hideCompletionSheet = true,
				resetJourneyStart = true,
				clearCompletionData = true,
			} = options;

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

			if (clearCompletionData) {
				clearCompletionState();
			}
		},
		[clearCompletionState, isRecording, stopNavigation, stopRecording]
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
		if (!hasActiveJourney) {
			return;
		}
		try {
			await discardJourney();
			toastUtils.info('Voyage supprimé', 'Le voyage a été supprimé');
		} catch (error) {
			logger.journey.error(
				'Failed to discard journey from completion sheet',
				error
			);
			toastUtils.error('Erreur', 'Suppression du voyage impossible');
		}
	}, [discardJourney, endNavigationSession, hasActiveJourney]);

	const handleArrivalPromptFinish = useCallback(async () => {
		setShowArrivalPromptSheet(false);

		try {
			if (isRecording) {
				await stopRecording();
			}
			stopNavigation();

			if (navigation.route) {
				setCompletionRoute(navigation.route);
				setCompletionSpotsUsed(navigation.spotsOnRoute);
				setShowCompletionSheet(true);
			}
		} catch (error) {
			logger.navigation.error(
				'Failed to finish journey from arrival prompt',
				error
			);
		}
	}, [
		isRecording,
		navigation.route,
		navigation.spotsOnRoute,
		stopNavigation,
		stopRecording,
	]);

	const handleArrivalPromptContinue = useCallback(() => {
		setShowArrivalPromptSheet(false);
	}, []);

	const markJourneyStarted = useCallback(() => {
		setJourneyStartTime(new Date());
	}, []);

	// === NavigationSetup Flow State ===
	const [showNavigationSetupSheet, setShowNavigationSetupSheet] =
		useState(false);
	const [navigationSetupOrigin, setNavigationSetupOrigin] =
		useState<NamedLocation | null>(null);
	const [navigationSetupDestination, setNavigationSetupDestination] =
		useState<NamedLocation | null>(null);

	const clearNavigationSetupState = useCallback(() => {
		setShowNavigationSetupSheet(false);
		setNavigationSetupOrigin(null);
		setNavigationSetupDestination(null);
	}, []);

	const handleNavigationSetupFromSearch = useCallback(
		(destination: NamedLocation) => {
			setNavigationSetupOrigin(null);
			setNavigationSetupDestination(destination);
			setShowNavigationSetupSheet(true);
		},
		[]
	);

	const handleLongPressNavigationSetup = useCallback(
		(location: Location | null) => {
			if (!location) return;

			setNavigationSetupOrigin(null);
			setNavigationSetupDestination({
				location,
				name: 'Position sélectionnée',
			});
			setShowNavigationSetupSheet(true);
		},
		[]
	);

	const handleSpotNavigationSetup = useCallback(
		(spot: Spot) => {
			onDeselectSpot();
			setNavigationSetupOrigin({
				location: spot.coordinates,
				name: spot.roadName ?? '',
			});
			setShowNavigationSetupSheet(true);
		},
		[onDeselectSpot]
	);

	const startNavigationSession = useCallback(
		async (
			start: NamedLocation,
			destination: NamedLocation,
			options: { withRecording: boolean }
		) => {
			const { withRecording } = options;
			const result = await startNavigationWithRoute(
				start.location,
				destination.location,
				destination.name
			);

			if (!result.success) {
				toastUtils.error('Erreur', result.message ?? 'Navigation impossible');
				return;
			}

			setShowCompletionSheet(false);
			clearCompletionState();

			if (!withRecording) {
				setJourneyStartTime(null);
				toastUtils.info(
					'Navigation sans enregistrement',
					'Connectez-vous pour enregistrer le voyage'
				);
				return;
			}

			const journeyStarted = await startRecording();
			if (journeyStarted) {
				markJourneyStarted();
				logger.navigation.info('Journey recording started with custom route');
				return;
			}

			stopNavigation();
			toastUtils.error(
				'Erreur',
				"Impossible de démarrer l'enregistrement du voyage"
			);
		},
		[
			clearCompletionState,
			markJourneyStarted,
			startNavigationWithRoute,
			startRecording,
			stopNavigation,
		]
	);

	const handleNavigationSetupStart = useCallback(
		async (start: NamedLocation, destination: NamedLocation) => {
			clearNavigationSetupState();

			if (!isAuthenticated) {
				Alert.alert(
					'Créer un compte pour enregistrer le trajet',
					'Le voyage est enregistré uniquement pour les utilisateurs connectés.',
					[
						{
							text: "S'inscrire",
							onPress: () => {
								rootNavigation.navigate('SignUp');
							},
						},
						{
							text: 'Continuer sans enregistrement',
							style: 'cancel',
							onPress: () => {
								void startNavigationSession(start, destination, {
									withRecording: false,
								});
							},
						},
					]
				);
				return;
			}

			await startNavigationSession(start, destination, {
				withRecording: true,
			});
		},
		[
			clearNavigationSetupState,
			isAuthenticated,
			rootNavigation,
			startNavigationSession,
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
		completionRoute,
		completionSpotsUsed,
		journeyDurationMinutes,
		handleStopNavigation,
		handleSaveJourney,
		handleDiscardJourney,
		// Arrival prompt
		showArrivalPromptSheet,
		arrivalPromptDestinationName,
		handleArrivalPromptFinish,
		handleArrivalPromptContinue,
		// NavigationSetup flow
		showNavigationSetupSheet,
		navigationSetupOrigin,
		navigationSetupDestination,
		handleNavigationSetupFromSearch,
		handleLongPressNavigationSetup,
		handleSpotNavigationSetup,
		handleNavigationSetupStart,
		handleNavigationSetupClose: clearNavigationSetupState,
		// Driver direction
		isDriverDirectionSheetOpen,
		hasDriverComparison: navigation.driverRoute !== null,
		openDriverDirectionSheet,
		closeDriverDirectionSheet,
		handleDriverDirectionCompare,
		handleDriverDirectionClear,
	};
};
