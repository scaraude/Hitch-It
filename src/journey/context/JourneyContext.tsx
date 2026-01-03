import type React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import type { Spot } from '../../spot/types';
import { logger } from '../../utils';
import { JourneyDetector } from '../services/journeyDetector';
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

	const handleLocationUpdate = useCallback(
		(location: LocationUpdate) => {
			setCurrentLocation(location);

			if (!currentJourney) {
				return;
			}

			// Process location with journey detector
			const detectionResult = journeyDetector.processLocation(
				location,
				journeyState
			);

			// Update journey state if changed
			if (detectionResult.newStatus !== journeyState.status) {
				logger.journey.info('Journey state changed', {
					previousStatus: journeyState.status,
					newStatus: detectionResult.newStatus,
				});

				const newState: JourneyState = {
					...journeyState,
					status: detectionResult.newStatus,
				};

				// Create new step if needed
				if (detectionResult.shouldCreateNewStep && detectionResult.stepType) {
					logger.journey.info('Creating new travel step', {
						stepType: detectionResult.stepType,
						nearbySpotId: detectionResult.nearbySpot?.id,
						vehicleChanges: journeyState.detectedVehicleChanges + 1,
					});

					const newStep: TravelStep = {
						id: crypto.randomUUID() as TravelStepId,
						travelId: currentJourney.id,
						type: detectionResult.stepType,
						spotId: detectionResult.nearbySpot?.id,
						startTime: new Date(),
						endTime: undefined,
						notes: undefined,
					};

					// End the current step
					if (journeyState.currentStep) {
						logger.journey.debug('Ending previous step', {
							stepId: journeyState.currentStep.id,
						});
						journeyState.currentStep.endTime = new Date();
					}

					newState.currentStep = newStep;
					newState.detectedVehicleChanges += 1;

					// Add step to journey
					setCurrentJourney(prev => {
						if (!prev) return null;
						return {
							...prev,
							steps: [...prev.steps, newStep],
						};
					});
				}

				setJourneyState(newState);
			}
		},
		[currentJourney, journeyState, journeyDetector]
	);

	const handleLocationError = useCallback((error: Error) => {
		logger.journey.error('Location tracking error in journey', error);
		// TODO: Show error to user
	}, []);

	const startJourney = useCallback(
		async (
			origin: string,
			destination: string,
			userId: UserId
		): Promise<boolean> => {
			if (isTracking) {
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
				return false;
			}

			// Create new journey
			const newJourney: Travel = {
				id: crypto.randomUUID() as TravelId,
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
			setJourneyState(initialState);
			setIsTracking(true);
			journeyDetector.reset();

			return true;
		},
		[isTracking, handleLocationUpdate, handleLocationError, journeyDetector]
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
			setCurrentJourney(prev => {
				if (!prev) return null;
				return {
					...prev,
					endDate: new Date(),
					status: TravelStatus.Completed,
				};
			});
		}

		setIsTracking(false);
		journeyDetector.reset();
		logger.journey.info('Journey stopped successfully');
	}, [currentJourney, journeyState, journeyDetector]);

	const pauseJourney = useCallback(async () => {
		logger.journey.info('Pausing journey', { journeyId: currentJourney?.id });
		await locationTrackingService.stopTracking();
		setIsTracking(false);
		logger.journey.info('Journey paused successfully');
	}, [currentJourney]);

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
			setIsTracking(true);
			logger.journey.info('Journey resumed successfully');
		} else {
			logger.journey.error(
				'Failed to resume journey: Location tracking could not be started'
			);
		}
	}, [currentJourney, handleLocationUpdate, handleLocationError]);

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
				id: crypto.randomUUID() as TravelStepId,
				travelId: currentJourney.id,
				type: stepData.type ?? StepType.Waiting,
				spotId: stepData.spotId,
				startTime: stepData.startTime ?? new Date(),
				endTime: stepData.endTime,
				notes: stepData.notes,
			};

			setCurrentJourney(prev => {
				if (!prev) return null;
				return {
					...prev,
					steps: [...prev.steps, newStep],
				};
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
