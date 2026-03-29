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
import { useAuth } from '../../auth';
import { logger } from '../../utils';
import {
	deleteJourney,
	saveJourney,
	saveJourneyPoints,
} from '../services/journeyRepository';
import { locationTrackingService } from '../services/locationTrackingService';
import {
	type Journey,
	type JourneyId,
	type JourneyPoint,
	type JourneyPointId,
	type JourneyRoutePoint,
	JourneyStatus,
	type LocationUpdate,
	type UserId,
} from '../types';

const toRoutePoint = (location: LocationUpdate): JourneyRoutePoint => ({
	latitude: location.latitude,
	longitude: location.longitude,
});

interface JourneyContextValue {
	// State
	activeJourney: Journey | null;
	isRecording: boolean;
	currentLocation: LocationUpdate | null;
	stopsCount: number;

	// Core actions
	startRecording: () => Promise<boolean>;
	stopRecording: () => Promise<void>;
	discardJourney: () => Promise<void>;
	pauseRecording: () => Promise<void>;
	resumeRecording: () => Promise<void>;

	// During recording
	markStop: () => void;
}

const JourneyContext = createContext<JourneyContextValue | undefined>(
	undefined
);

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user, isAuthenticated } = useAuth();
	const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(
		null
	);

	// Refs for callback access and in-memory journey cache
	const activeJourneyRef = useRef<Journey | null>(null);
	const routePolylineRef = useRef<JourneyRoutePoint[]>([]);
	const hasPersistedJourneyRef = useRef(false);

	const setJourney = useCallback((journey: Journey | null) => {
		activeJourneyRef.current = journey;
		setActiveJourney(journey);
	}, []);

	// Calculate stops count from journey
	const stopsCount = activeJourney?.points.length ?? 0;

	const updateJourneyStatus = useCallback(
		(
			status: JourneyStatus,
			options: { endedAt?: Date } = {}
		): Journey | null => {
			if (!activeJourneyRef.current) return null;

			const updatedJourney: Journey = {
				...activeJourneyRef.current,
				status,
				...(options.endedAt ? { endedAt: options.endedAt } : {}),
			};

			setJourney(updatedJourney);

			return updatedJourney;
		},
		[setJourney]
	);

	const resetJourneyState = useCallback(() => {
		routePolylineRef.current = [];
		hasPersistedJourneyRef.current = false;
		setJourney(null);
		setIsRecording(false);
		setCurrentLocation(null);
	}, [setJourney]);

	// Handle location updates
	const handleLocationUpdate = useCallback((location: LocationUpdate) => {
		setCurrentLocation(location);

		const journey = activeJourneyRef.current;
		if (!journey || journey.status !== JourneyStatus.Recording) return;

		routePolylineRef.current.push(toRoutePoint(location));
	}, []);

	const handleLocationError = useCallback((error: Error) => {
		logger.journey.error('Location tracking error', error);
	}, []);

	// Rebind callbacks if tracking is active in this runtime.
	const restoreActiveJourney = useCallback(async () => {
		const isTrackingActive =
			await locationTrackingService.isCurrentlyTracking();

		if (!isTrackingActive) return;

		const journey = activeJourneyRef.current;
		if (!journey) {
			logger.journey.warn(
				'Background tracking active without cached journey, stopping tracking'
			);
			await locationTrackingService.stopTracking();
			return;
		}

		logger.journey.info('Rebinding tracking callbacks for cached journey', {
			id: journey.id,
		});

		try {
			await locationTrackingService.startTracking({
				onLocationUpdate: handleLocationUpdate,
				onError: handleLocationError,
			});
			setIsRecording(journey.status === JourneyStatus.Recording);
		} catch (error) {
			logger.journey.error('Failed to rebind tracking callbacks', error);
			await locationTrackingService.stopTracking();
		}
	}, [handleLocationError, handleLocationUpdate]);

	useEffect(() => {
		restoreActiveJourney();
	}, [restoreActiveJourney]);

	// Sync on app resume
	useEffect(() => {
		const handleAppStateChange = (state: AppStateStatus) => {
			if (state === 'active') {
				restoreActiveJourney();
			}
		};

		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange
		);
		return () => subscription.remove();
	}, [restoreActiveJourney]);

	// Start recording a new journey
	const startRecording = useCallback(async (): Promise<boolean> => {
		if (!isAuthenticated || !user) {
			logger.journey.warn(
				'Journey recording requires an authenticated user session'
			);
			return false;
		}

		if (await locationTrackingService.isCurrentlyTracking()) {
			logger.journey.warn('Already recording a journey');
			return false;
		}

		logger.journey.info('Starting journey recording');

		const started = await locationTrackingService.startTracking({
			onLocationUpdate: handleLocationUpdate,
			onError: handleLocationError,
		});

		if (!started) {
			logger.journey.error('Failed to start location tracking');
			return false;
		}

		const initialRoutePolyline = currentLocation
			? [toRoutePoint(currentLocation)]
			: [];

		const journey: Journey = {
			id: Crypto.randomUUID() as JourneyId,
			userId: user.id as UserId,
			status: JourneyStatus.Recording,
			startedAt: new Date(),
			points: [],
			routePolyline: initialRoutePolyline,
		};

		routePolylineRef.current = [...initialRoutePolyline];
		hasPersistedJourneyRef.current = false;
		setJourney(journey);
		setIsRecording(true);

		logger.journey.info('Journey recording started', { id: journey.id });
		return true;
	}, [
		currentLocation,
		handleLocationError,
		handleLocationUpdate,
		isAuthenticated,
		setJourney,
		user,
	]);

	// Stop recording
	const stopRecording = useCallback(async () => {
		const journey = activeJourneyRef.current;
		if (!journey) {
			logger.journey.warn('Cannot stop recording: no active journey');
			await locationTrackingService.stopTracking();
			setIsRecording(false);
			return;
		}

		logger.journey.info('Stopping journey recording');

		await locationTrackingService.stopTracking();

		const completedJourney: Journey = {
			...journey,
			status: JourneyStatus.Completed,
			endedAt: new Date(),
			routePolyline:
				routePolylineRef.current.length > 0
					? [...routePolylineRef.current]
					: undefined,
		};

		setJourney(completedJourney);

		try {
			await saveJourney(completedJourney);
			hasPersistedJourneyRef.current = true;

			if (completedJourney.points.length > 0) {
				await saveJourneyPoints(completedJourney.points);
			}
		} catch (error) {
			logger.journey.error('Failed to persist completed journey', error, {
				journeyId: completedJourney.id,
			});
		}

		setIsRecording(false);
		logger.journey.info('Journey recording stopped');
	}, [setJourney]);

	const discardJourney = useCallback(async () => {
		const journeyToDiscard = activeJourneyRef.current;

		try {
			const isTrackingActive =
				await locationTrackingService.isCurrentlyTracking();
			if (isTrackingActive) {
				await locationTrackingService.stopTracking();
			}
		} catch (error) {
			logger.journey.error('Failed to stop tracking during discard', error);
		}

		if (journeyToDiscard && hasPersistedJourneyRef.current) {
			try {
				await deleteJourney(journeyToDiscard.id);
			} catch (error) {
				logger.journey.error('Failed to delete discarded journey', error, {
					id: journeyToDiscard.id,
				});
				throw error;
			}
		}

		resetJourneyState();
		logger.journey.info('Journey discarded successfully', {
			journeyId: journeyToDiscard?.id,
		});
	}, [resetJourneyState]);

	// Pause recording
	const pauseRecording = useCallback(async () => {
		logger.journey.info('Pausing journey recording');

		await locationTrackingService.stopTracking();

		updateJourneyStatus(JourneyStatus.Paused);

		setIsRecording(false);
	}, [updateJourneyStatus]);

	// Resume recording
	const resumeRecording = useCallback(async () => {
		if (!activeJourneyRef.current) {
			logger.journey.warn('No journey to resume');
			return;
		}

		logger.journey.info('Resuming journey recording');

		const started = await locationTrackingService.startTracking({
			onLocationUpdate: handleLocationUpdate,
			onError: handleLocationError,
		});

		if (!started) {
			logger.journey.error('Failed to resume location tracking');
			return;
		}

		updateJourneyStatus(JourneyStatus.Recording);
		setIsRecording(true);
	}, [handleLocationUpdate, handleLocationError, updateJourneyStatus]);

	// Mark current location as a stop
	const markStop = useCallback(() => {
		const journey = activeJourneyRef.current;
		const location = currentLocation;

		if (!journey || journey.status !== JourneyStatus.Recording || !location) {
			logger.journey.warn(
				'Cannot mark stop: journey must be recording with a known location'
			);
			return;
		}

		logger.journey.info('Marking stop at current location');

		const stopPoint: JourneyPoint = {
			id: Crypto.randomUUID() as JourneyPointId,
			journeyId: journey.id,
			latitude: location.latitude,
			longitude: location.longitude,
			timestamp: new Date(),
		};

		// Add to journey state
		const updatedJourney: Journey = {
			...journey,
			points: [...journey.points, stopPoint],
		};

		setJourney(updatedJourney);
		routePolylineRef.current.push(toRoutePoint(location));

		logger.journey.info('Stop marked', { id: stopPoint.id });
	}, [currentLocation, setJourney]);

	const value: JourneyContextValue = {
		activeJourney,
		isRecording,
		currentLocation,
		stopsCount,
		startRecording,
		stopRecording,
		discardJourney,
		pauseRecording,
		resumeRecording,
		markStop,
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
