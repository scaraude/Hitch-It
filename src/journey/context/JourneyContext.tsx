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
	type CachedJourneyState,
	finalize,
	pause as pauseState,
	resume as resumeState,
	stop as stopState,
} from '../services/journeyCache/cachedJourneyState';
import {
	appendLocationPoints,
	createCachedJourney,
	deleteCachedJourney,
	getActiveCachedJourney,
	getCachedJourneyPoints,
	saveState,
} from '../services/journeyCache/journeyCacheRepository';
import { saveJourney, saveJourneyPoints } from '../services/journeyRepository';
import { locationTrackingService } from '../services/locationTrackingService';
import {
	type CachedJourneyId,
	type Journey,
	type JourneyId,
	type JourneyPoint,
	type JourneyRoutePoint,
	JourneyStatus,
	type LocationUpdate,
	type UserId
} from '../types';

const cachedIdAsJourneyId = (id: CachedJourneyId): JourneyId =>
	id as unknown as JourneyId;

const toRoutePoint = (location: LocationUpdate): JourneyRoutePoint => ({
	latitude: location.latitude,
	longitude: location.longitude,
});

const cacheStatusToJourneyStatus = (
	status: CachedJourneyState['status']
): JourneyStatus => {
	switch (status) {
		case 'recording':
			return JourneyStatus.Recording;
		case 'paused':
			return JourneyStatus.Paused;
		case 'stopped':
		case 'finalized':
			return JourneyStatus.Completed;
	}
};

const buildJourneyView = (
	state: CachedJourneyState,
	stops: JourneyPoint[]
): Journey => ({
	id: cachedIdAsJourneyId(state.id),
	userId: state.userId,
	status: cacheStatusToJourneyStatus(state.status),
	startedAt: state.startedAt,
	endedAt:
		state.status === 'stopped' || state.status === 'finalized'
			? state.stoppedAt
			: undefined,
	points: stops,
	routePolyline: undefined,
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

	const cacheStateRef = useRef<CachedJourneyState | null>(null);
	const manualStopsRef = useRef<JourneyPoint[]>([]);

	const refreshActiveJourneyView = useCallback(() => {
		const cache = cacheStateRef.current;
		if (!cache) {
			setActiveJourney(null);
			return;
		}
		setActiveJourney(buildJourneyView(cache, manualStopsRef.current));
	}, []);

	const setCacheState = useCallback(
		(state: CachedJourneyState | null) => {
			cacheStateRef.current = state;
			refreshActiveJourneyView();
		},
		[refreshActiveJourneyView]
	);

	const stopsCount = activeJourney?.points.length ?? 0;

	const handleLocationUpdate = useCallback((location: LocationUpdate) => {
		setCurrentLocation(location);

		const cache = cacheStateRef.current;
		if (!cache || cache.status !== 'recording') return;

		appendLocationPoints(cache.id, [location]).catch(error => {
			logger.journey.error('Failed to append location point to cache', error, {
				cacheId: cache.id,
			});
		});
	}, []);

	const handleLocationError = useCallback((error: Error) => {
		logger.journey.error('Location tracking error', error);
	}, []);

	const restoreActiveJourney = useCallback(async () => {
		if (!user) return;

		const cache = await getActiveCachedJourney(user.id as UserId);

		if (!cache) {
			// No active cache — clean up any orphan background tracking.
			if (await locationTrackingService.isCurrentlyTracking()) {
				logger.journey.warn(
					'Background tracking active without cached journey, stopping'
				);
				await locationTrackingService.stopTracking();
			}
			setCacheState(null);
			setIsRecording(false);
			return;
		}

		logger.journey.info('Restoring cached journey', {
			id: cache.id,
			status: cache.status,
		});

		setCacheState(cache);

		if (cache.status === 'recording') {
			try {
				await locationTrackingService.startTracking({
					onLocationUpdate: handleLocationUpdate,
					onError: handleLocationError,
				});
				setIsRecording(true);
			} catch (error) {
				logger.journey.error('Failed to rebind tracking callbacks', error);
				await locationTrackingService.stopTracking();
				setIsRecording(false);
			}
		} else {
			setIsRecording(false);
		}
	}, [handleLocationError, handleLocationUpdate, setCacheState, user]);

	useEffect(() => {
		restoreActiveJourney();
	}, [restoreActiveJourney]);

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

	const resetState = useCallback(() => {
		manualStopsRef.current = [];
		setCacheState(null);
		setIsRecording(false);
		setCurrentLocation(null);
	}, [setCacheState]);

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

		const cache = await createCachedJourney({ userId: user.id as UserId });

		const started = await locationTrackingService.startTracking({
			onLocationUpdate: handleLocationUpdate,
			onError: handleLocationError,
		});

		if (!started) {
			logger.journey.error(
				'Failed to start location tracking, discarding cache'
			);
			await deleteCachedJourney(cache.id);
			return false;
		}

		manualStopsRef.current = [];
		setCacheState(cache);
		setIsRecording(true);

		if (currentLocation) {
			appendLocationPoints(cache.id, [currentLocation]).catch(error => {
				logger.journey.error(
					'Failed to seed cache with current location',
					error,
					{
						cacheId: cache.id,
					}
				);
			});
		}

		logger.journey.info('Journey recording started', { id: cache.id });
		return true;
	}, [
		currentLocation,
		handleLocationError,
		handleLocationUpdate,
		isAuthenticated,
		setCacheState,
		user,
	]);

	const stopRecording = useCallback(async () => {
		const cache = cacheStateRef.current;
		if (!cache) {
			logger.journey.warn('Cannot stop recording: no active journey');
			await locationTrackingService.stopTracking();
			setIsRecording(false);
			return;
		}

		if (cache.status === 'stopped' || cache.status === 'finalized') {
			logger.journey.warn('stopRecording called on already-stopped journey', {
				id: cache.id,
				status: cache.status,
			});
			return;
		}

		logger.journey.info('Stopping journey recording', { id: cache.id });

		await locationTrackingService.stopTracking();

		const stoppedAt = new Date();
		const stopped = stopState(cache, stoppedAt);
		await saveState(stopped);
		setCacheState(stopped);
		setIsRecording(false);

		// Transitional finalization: persist to Supabase right away so the
		// journey shows up in history. TCK-23 will replace this with the
		// retry-safe finalization service.
		try {
			const points = await getCachedJourneyPoints(cache.id);
			const routePolyline = points.map(toRoutePoint);

			const completedJourney: Journey = {
				id: cachedIdAsJourneyId(cache.id),
				userId: cache.userId,
				status: JourneyStatus.Completed,
				startedAt: cache.startedAt,
				endedAt: stoppedAt,
				points: manualStopsRef.current,
				routePolyline: routePolyline.length > 0 ? routePolyline : undefined,
			};

			await saveJourney(completedJourney);
			if (manualStopsRef.current.length > 0) {
				await saveJourneyPoints(manualStopsRef.current);
			}

			const finalized = finalize(stopped, new Date());
			await saveState(finalized);
			setCacheState(finalized);
		} catch (error) {
			logger.journey.error('Failed to persist completed journey', error, {
				journeyId: cache.id,
			});
		}

		logger.journey.info('Journey recording stopped');
	}, [setCacheState]);

	const discardJourney = useCallback(async () => {
		const cache = cacheStateRef.current;

		try {
			if (await locationTrackingService.isCurrentlyTracking()) {
				await locationTrackingService.stopTracking();
			}
		} catch (error) {
			logger.journey.error('Failed to stop tracking during discard', error);
		}

		if (cache) {
			try {
				await deleteCachedJourney(cache.id);
			} catch (error) {
				logger.journey.error(
					'Failed to delete cached journey on discard',
					error,
					{
						id: cache.id,
					}
				);
				throw error;
			}
		}

		resetState();
		logger.journey.info('Journey discarded successfully', {
			cacheId: cache?.id,
		});
	}, [resetState]);

	const pauseRecording = useCallback(async () => {
		const cache = cacheStateRef.current;
		if (!cache || cache.status !== 'recording') {
			logger.journey.warn('Cannot pause: no recording journey');
			return;
		}

		logger.journey.info('Pausing journey recording');

		await locationTrackingService.stopTracking();

		const paused = pauseState(cache);
		await saveState(paused);
		setCacheState(paused);
		setIsRecording(false);
	}, [setCacheState]);

	const resumeRecording = useCallback(async () => {
		const cache = cacheStateRef.current;
		if (!cache || cache.status !== 'paused') {
			logger.journey.warn('Cannot resume: no paused journey');
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

		const resumed = resumeState(cache);
		await saveState(resumed);
		setCacheState(resumed);
		setIsRecording(true);
	}, [handleLocationError, handleLocationUpdate, setCacheState]);

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
