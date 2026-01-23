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
import { logger } from '../../utils';
import {
	getActiveJourney,
	saveJourney,
	saveJourneyPoint,
	saveJourneyPoints,
} from '../services/journeyRepository';
import { locationTrackingService } from '../services/locationTrackingService';
import {
	type Journey,
	type JourneyId,
	type JourneyPoint,
	type JourneyPointId,
	JourneyPointType,
	JourneyStatus,
	type LocationUpdate,
	type UserId,
} from '../types';

// Buffer for batching location points before saving
const POINTS_BUFFER_SIZE = 10;

interface JourneyContextValue {
	// State
	activeJourney: Journey | null;
	isRecording: boolean;
	currentLocation: LocationUpdate | null;
	stopsCount: number;

	// Core actions
	startRecording: () => Promise<boolean>;
	stopRecording: () => Promise<void>;
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
	const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(
		null
	);

	// Refs for callback access
	const activeJourneyRef = useRef<Journey | null>(null);
	const pointsBufferRef = useRef<JourneyPoint[]>([]);

	// Keep ref in sync with state
	useEffect(() => {
		activeJourneyRef.current = activeJourney;
	}, [activeJourney]);

	// Calculate stops count from journey
	const stopsCount =
		activeJourney?.points.filter(p => p.type === JourneyPointType.Stop)
			.length ?? 0;

	// Flush points buffer to database
	const flushPointsBuffer = useCallback(async () => {
		const points = pointsBufferRef.current;
		if (points.length === 0) return;

		pointsBufferRef.current = [];
		try {
			await saveJourneyPoints(points);
		} catch (error) {
			logger.journey.error('Failed to flush points buffer', error);
			// Put points back in buffer on failure
			pointsBufferRef.current = [...points, ...pointsBufferRef.current];
		}
	}, []);

	// Handle location updates
	const handleLocationUpdate = useCallback(
		(location: LocationUpdate) => {
			setCurrentLocation(location);

			const journey = activeJourneyRef.current;
			if (!journey || journey.status !== JourneyStatus.Recording) return;

			// Create location point
			const point: JourneyPoint = {
				id: Crypto.randomUUID() as JourneyPointId,
				journeyId: journey.id,
				type: JourneyPointType.Location,
				latitude: location.latitude,
				longitude: location.longitude,
				timestamp: location.timestamp,
			};

			// Add to buffer
			pointsBufferRef.current.push(point);

			// Flush when buffer is full
			if (pointsBufferRef.current.length >= POINTS_BUFFER_SIZE) {
				flushPointsBuffer();
			}
		},
		[flushPointsBuffer]
	);

	const handleLocationError = useCallback((error: Error) => {
		logger.journey.error('Location tracking error', error);
	}, []);

	// Restore active journey on mount
	const restoreActiveJourney = useCallback(async () => {
		const isTrackingActive =
			await locationTrackingService.isCurrentlyTracking();

		if (!isTrackingActive) return;

		logger.journey.info('Background tracking active, restoring journey');

		try {
			// TODO: Replace with actual user ID when auth is implemented
			const userId = 'anonymous-user' as UserId;
			const journey = await getActiveJourney(userId);

			if (journey) {
				logger.journey.info('Journey restored', { id: journey.id });
				setActiveJourney(journey);
				activeJourneyRef.current = journey;
				setIsRecording(journey.status === JourneyStatus.Recording);
			} else {
				logger.journey.warn('No active journey found, stopping tracking');
				await locationTrackingService.stopTracking();
			}
		} catch (error) {
			logger.journey.error('Failed to restore journey', error);
			await locationTrackingService.stopTracking();
		}
	}, []);

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

		// TODO: Replace with actual user ID when auth is implemented
		const userId = 'anonymous-user' as UserId;

		const journey: Journey = {
			id: Crypto.randomUUID() as JourneyId,
			userId,
			status: JourneyStatus.Recording,
			startedAt: new Date(),
			points: [],
		};

		setActiveJourney(journey);
		activeJourneyRef.current = journey;
		setIsRecording(true);

		// Persist journey
		try {
			await saveJourney(journey);
		} catch (error) {
			logger.journey.error('Failed to save journey', error);
		}

		logger.journey.info('Journey recording started', { id: journey.id });
		return true;
	}, [handleLocationUpdate, handleLocationError]);

	// Stop recording
	const stopRecording = useCallback(async () => {
		logger.journey.info('Stopping journey recording');

		// Flush remaining points
		await flushPointsBuffer();

		await locationTrackingService.stopTracking();

		if (activeJourneyRef.current) {
			const completedJourney: Journey = {
				...activeJourneyRef.current,
				status: JourneyStatus.Completed,
				endedAt: new Date(),
			};

			setActiveJourney(completedJourney);
			activeJourneyRef.current = completedJourney;

			try {
				await saveJourney(completedJourney);
			} catch (error) {
				logger.journey.error('Failed to save completed journey', error);
			}
		}

		setIsRecording(false);
		logger.journey.info('Journey recording stopped');
	}, [flushPointsBuffer]);

	// Pause recording
	const pauseRecording = useCallback(async () => {
		logger.journey.info('Pausing journey recording');

		// Flush points before pausing
		await flushPointsBuffer();

		await locationTrackingService.stopTracking();

		if (activeJourneyRef.current) {
			const pausedJourney: Journey = {
				...activeJourneyRef.current,
				status: JourneyStatus.Paused,
			};

			setActiveJourney(pausedJourney);
			activeJourneyRef.current = pausedJourney;

			try {
				await saveJourney(pausedJourney);
			} catch (error) {
				logger.journey.error('Failed to save paused journey', error);
			}
		}

		setIsRecording(false);
	}, [flushPointsBuffer]);

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

		const resumedJourney: Journey = {
			...activeJourneyRef.current,
			status: JourneyStatus.Recording,
		};

		setActiveJourney(resumedJourney);
		activeJourneyRef.current = resumedJourney;
		setIsRecording(true);

		try {
			await saveJourney(resumedJourney);
		} catch (error) {
			logger.journey.error('Failed to save resumed journey', error);
		}
	}, [handleLocationUpdate, handleLocationError]);

	// Mark current location as a stop
	const markStop = useCallback(() => {
		const journey = activeJourneyRef.current;
		const location = currentLocation;

		if (!journey || !location) {
			logger.journey.warn('Cannot mark stop: no active journey or location');
			return;
		}

		logger.journey.info('Marking stop at current location');

		const stopPoint: JourneyPoint = {
			id: Crypto.randomUUID() as JourneyPointId,
			journeyId: journey.id,
			type: JourneyPointType.Stop,
			latitude: location.latitude,
			longitude: location.longitude,
			timestamp: new Date(),
		};

		// Add to journey state
		const updatedJourney: Journey = {
			...journey,
			points: [...journey.points, stopPoint],
		};

		setActiveJourney(updatedJourney);
		activeJourneyRef.current = updatedJourney;

		// Persist stop immediately (stops are important)
		saveJourneyPoint(stopPoint).catch(error => {
			logger.journey.error('Failed to save stop point', error);
		});

		logger.journey.info('Stop marked', { id: stopPoint.id });
	}, [currentLocation]);

	const value: JourneyContextValue = {
		activeJourney,
		isRecording,
		currentLocation,
		stopsCount,
		startRecording,
		stopRecording,
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
