import * as Crypto from 'expo-crypto';
import type React from 'react';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { Spot } from '../../spot/types';
import { logger } from '../../utils';
import { JourneyDetector } from '../services/journeyDetector';
import {
	getActiveTravel,
	saveTravelStep,
	saveTravelWithSteps,
} from '../services/journeyRepository';
import { locationTrackingService } from '../services/locationTrackingService';
import {
	type JourneyState,
	JourneyStateStatus,
	type LocationUpdate,
	StepType,
	type Travel,
	type TravelId,
	TravelStatus,
	type TravelStep,
	type TravelStepId,
	type UserId,
} from '../types';

interface JourneyContextValue {
	// State
	isTracking: boolean;
	currentJourney: Travel | null;
	journeyState: JourneyState;
	currentLocation: LocationUpdate | null;

	// Actions
	startJourney: (
		origin: string,
		destination: string,
		userId: UserId
	) => Promise<boolean>;
	stopJourney: () => Promise<void>;
	pauseJourney: () => Promise<void>;
	resumeJourney: () => Promise<void>;
	addManualStep: (step: Partial<TravelStep>) => void;
	updateNearbySpots: (spots: Spot[]) => void;
}

const JourneyContext = createContext<JourneyContextValue | undefined>(
	undefined
);

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isTracking, setIsTracking] = useState(false);
	const [currentJourney, setCurrentJourney] = useState<Travel | null>(null);
	const [journeyState, setJourneyState] = useState<JourneyState>({
		status: JourneyStateStatus.Idle,
		currentStep: null,
		detectedVehicleChanges: 0,
		startTime: new Date(),
	});
	const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(
		null
	);
	const [journeyDetector] = useState(() => new JourneyDetector());
	const currentJourneyRef = useRef<Travel | null>(null);
	const journeyStateRef = useRef<JourneyState>({
		status: JourneyStateStatus.Idle,
		currentStep: null,
		detectedVehicleChanges: 0,
		startTime: new Date(),
	});

	useEffect(() => {
		currentJourneyRef.current = currentJourney;
	}, [currentJourney]);

	useEffect(() => {
		journeyStateRef.current = journeyState;
	}, [journeyState]);

	const restoreActiveJourney = useCallback(async () => {
		const isTrackingActive =
			await locationTrackingService.isCurrentlyTracking();
		logger.journey.info('Checking for active journey', {
			isTrackingActive,
		});

		if (isTrackingActive) {
			logger.journey.info(
				'Background tracking is active, attempting to restore active journey'
			);

			try {
				const userId = 'anonymous-user';
				const activeTravel = await getActiveTravel(userId);

				if (activeTravel) {
					logger.journey.info('Active journey restored from database', {
						journeyId: activeTravel.id,
						stepsCount: activeTravel.steps.length,
					});
					setCurrentJourney(activeTravel);
					currentJourneyRef.current = activeTravel;

					// Restore journey state
					const lastStep = activeTravel.steps[activeTravel.steps.length - 1];
					const restoredState: JourneyState = {
						status: JourneyStateStatus.Idle,
						currentStep: lastStep ?? null,
						detectedVehicleChanges: activeTravel.steps.length,
						startTime: activeTravel.startDate,
					};
					setJourneyState(restoredState);
					journeyStateRef.current = restoredState;

					// Sync tracking state
					setIsTracking(true);
				} else {
					logger.journey.warn(
						'Background tracking is active but no active journey found in database, stopping tracking'
					);
					await locationTrackingService.stopTracking();
					setIsTracking(false);
				}
			} catch (error) {
				logger.journey.error('Failed to restore active journey', error);
				// Stop orphaned tracking on error
				await locationTrackingService.stopTracking();
				setIsTracking(false);
			}
		}
	}, []);

	// Restore active journey on mount if background tracking is running
	useEffect(() => {
		restoreActiveJourney();
	}, [restoreActiveJourney]);

	// Listen for app state changes to sync journey state when returning from permission dialogs
	useEffect(() => {
		const handleAppStateChange = (nextAppState: AppStateStatus) => {
			if (nextAppState === 'active') {
				logger.journey.debug('App became active, syncing journey state');
				restoreActiveJourney();
			}
		};

		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange
		);

		return () => {
			subscription.remove();
		};
	}, [restoreActiveJourney]);

	const handleLocationUpdate = useCallback(
		(location: LocationUpdate) => {
			setCurrentLocation(location);

			const activeJourney = currentJourneyRef.current;
			if (!activeJourney) {
				return;
			}

			const currentState = journeyStateRef.current;

			// Process location with journey detector
			const detectionResult = journeyDetector.processLocation(
				location,
				currentState
			);

			// Update journey state if changed
			if (detectionResult.newStatus !== currentState.status) {
				logger.journey.info('Journey state changed', {
					previousStatus: currentState.status,
					newStatus: detectionResult.newStatus,
				});

				const newState: JourneyState = {
					...currentState,
					status: detectionResult.newStatus,
				};

				// Create new step if needed
				if (detectionResult.shouldCreateNewStep && detectionResult.stepType) {
					logger.journey.info('Creating new travel step', {
						stepType: detectionResult.stepType,
						nearbySpotId: detectionResult.nearbySpot?.id,
						vehicleChanges: currentState.detectedVehicleChanges + 1,
					});

					const newStep: TravelStep = {
						id: Crypto.randomUUID() as TravelStepId,
						travelId: activeJourney.id,
						type: detectionResult.stepType,
						spotId: detectionResult.nearbySpot?.id,
						startTime: new Date(),
						endTime: undefined,
						notes: undefined,
					};

					// End the current step
					if (currentState.currentStep) {
						logger.journey.debug('Ending previous step', {
							stepId: currentState.currentStep.id,
						});
						currentState.currentStep.endTime = new Date();
					}

					newState.currentStep = newStep;
					newState.detectedVehicleChanges += 1;

					// Add step to journey
					setCurrentJourney(prev => {
						if (!prev) return null;
						const updatedJourney = {
							...prev,
							steps: [...prev.steps, newStep],
						};
						currentJourneyRef.current = updatedJourney;
						return updatedJourney;
					});

					// Persist the new step to database
					saveTravelStep(newStep).catch(error => {
						logger.journey.error('Failed to persist travel step', error);
					});
				}

				journeyStateRef.current = newState;
				setJourneyState(newState);
			}
		},
		[journeyDetector]
	);

	const handleLocationError = useCallback((error: Error) => {
		logger.journey.error('Location tracking error in journey', error);
		// TODO: Show error to user
	}, []);

	const syncTrackingState = useCallback(async () => {
		const tracking = await locationTrackingService.isCurrentlyTracking();
		setIsTracking(tracking);
	}, []);

	const startJourney = useCallback(
		async (
			origin: string,
			destination: string,
			userId: UserId
		): Promise<boolean> => {
			try {
				if (await locationTrackingService.isCurrentlyTracking()) {
					logger.journey.warn(
						'Cannot start journey: Journey already in progress'
					);
					return false;
				}

				logger.journey.info('Starting new journey', {
					origin,
					destination,
					userId,
				});

				// Start location tracking
				const started = await locationTrackingService.startTracking({
					onLocationUpdate: handleLocationUpdate,
					onError: handleLocationError,
				});

				if (!started) {
					logger.journey.error(
						'Failed to start journey: Location tracking could not be started'
					);
					syncTrackingState();
					return false;
				}

				// Create new journey
				const newJourney: Travel = {
					id: Crypto.randomUUID() as TravelId,
					userId: userId,
					startDate: new Date(),
					endDate: undefined,
					origin,
					destination,
					status: TravelStatus.InProgress,
					steps: [],
					totalDistance: 0,
					totalWaitTime: 0,
				};

				logger.journey.info('Journey created successfully', {
					journeyId: newJourney.id,
				});

				const initialState: JourneyState = {
					status: JourneyStateStatus.Idle,
					currentStep: null,
					detectedVehicleChanges: 0,
					startTime: new Date(),
				};

				setCurrentJourney(newJourney);
				currentJourneyRef.current = newJourney;
				setJourneyState(initialState);
				journeyStateRef.current = initialState;
				syncTrackingState();
				journeyDetector.reset();

				// Persist journey to database
				saveTravelWithSteps(newJourney).catch(error => {
					logger.journey.error('Failed to persist journey', error);
				});

				return true;
			} catch (error) {
				logger.journey.error('Error starting journey', error);
				return false;
			}
		},
		[handleLocationUpdate, handleLocationError, journeyDetector, syncTrackingState]
	);

	const stopJourney = useCallback(async () => {
		logger.journey.info('Stopping journey', { journeyId: currentJourney?.id });

		await locationTrackingService.stopTracking();

		// End current step if exists
		if (journeyState.currentStep) {
			logger.journey.debug('Ending current step', {
				stepId: journeyState.currentStep.id,
			});
			journeyState.currentStep.endTime = new Date();
		}

		// Mark journey as completed
		if (currentJourney) {
			logger.journey.info('Marking journey as completed', {
				journeyId: currentJourney.id,
				stepsCount: currentJourney.steps.length,
				totalDistance: currentJourney.totalDistance,
			});

			const completedJourney: Travel = {
				...currentJourney,
				endDate: new Date(),
				status: TravelStatus.Completed,
			};

			setCurrentJourney(completedJourney);
			currentJourneyRef.current = completedJourney;

			// Persist completed journey to database
			saveTravelWithSteps(completedJourney).catch(error => {
				logger.journey.error('Failed to persist completed journey', error);
			});
		}

		syncTrackingState();
		journeyDetector.reset();
		logger.journey.info('Journey stopped successfully');
	}, [currentJourney, journeyState, journeyDetector, syncTrackingState]);

	const pauseJourney = useCallback(async () => {
		logger.journey.info('Pausing journey', { journeyId: currentJourney?.id });
		await locationTrackingService.stopTracking();
		syncTrackingState();
		logger.journey.info('Journey paused successfully');
	}, [currentJourney, syncTrackingState]);

	const resumeJourney = useCallback(async () => {
		if (!currentJourney) {
			logger.journey.warn('Cannot resume journey: No journey in progress');
			return;
		}

		logger.journey.info('Resuming journey', { journeyId: currentJourney.id });
		const started = await locationTrackingService.startTracking({
			onLocationUpdate: handleLocationUpdate,
			onError: handleLocationError,
		});

		if (started) {
			syncTrackingState();
			logger.journey.info('Journey resumed successfully');
		} else {
			logger.journey.error(
				'Failed to resume journey: Location tracking could not be started'
			);
			syncTrackingState();
		}
	}, [currentJourney, handleLocationUpdate, handleLocationError, syncTrackingState]);

	const addManualStep = useCallback(
		(stepData: Partial<TravelStep>) => {
			if (!currentJourney) {
				logger.journey.warn('Cannot add manual step: No journey in progress');
				return;
			}

			logger.journey.info('Adding manual step', {
				journeyId: currentJourney.id,
				stepType: stepData.type,
			});

			const newStep: TravelStep = {
				id: Crypto.randomUUID() as TravelStepId,
				travelId: currentJourney.id,
				type: stepData.type ?? StepType.Waiting,
				spotId: stepData.spotId,
				startTime: stepData.startTime ?? new Date(),
				endTime: stepData.endTime,
				notes: stepData.notes,
			};

			setCurrentJourney(prev => {
				if (!prev) return null;
				const updatedJourney = {
					...prev,
					steps: [...prev.steps, newStep],
				};
				currentJourneyRef.current = updatedJourney;
				return updatedJourney;
			});

			// Persist manual step to database
			saveTravelStep(newStep).catch(error => {
				logger.journey.error('Failed to persist manual step', error);
			});

			logger.journey.info('Manual step added successfully', {
				stepId: newStep.id,
			});
		},
		[currentJourney]
	);

	const updateNearbySpots = useCallback(
		(spots: Spot[]) => {
			logger.journey.debug('Updating nearby spots', { count: spots.length });
			journeyDetector.setNearbySpots(spots);
		},
		[journeyDetector]
	);

	const value: JourneyContextValue = {
		isTracking,
		currentJourney,
		journeyState,
		currentLocation,
		startJourney,
		stopJourney,
		pauseJourney,
		resumeJourney,
		addManualStep,
		updateNearbySpots,
	};

	return (
		<JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
	);
};

export const useJourney = (): JourneyContextValue => {
	const context = useContext(JourneyContext);
	if (!context) {
		throw new Error('useJourney must be used within a JourneyProvider');
	}
	return context;
};
