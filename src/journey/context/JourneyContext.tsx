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
	type CachedJourneyState,
	pause as pauseState,
	resume as resumeState,
	stop as stopState,
} from '../services/journeyCache/cachedJourneyState';
import { cachedIdAsJourneyId } from '../services/journeyCache/ids';
import {
	appendLocationPoints,
	createCachedJourney,
	deleteCachedJourney,
	getActiveCachedJourney,
	getCachedJourneyPoints,
	saveState,
} from '../services/journeyCache/journeyCacheRepository';
import {
	finalizeCachedJourney,
	retryPendingFinalizations,
} from '../services/journeyFinalizationService';
import { saveJourneyPoints } from '../services/journeyRepository';
import { locationTrackingService } from '../services/locationTrackingService';
import {
	type CachedJourneyId,
	type Journey,
	type JourneyPoint,
	type JourneyPointId,
	JourneyPointType,
	type JourneyRoutePoint,
	JourneyStatus,
	type LocationUpdate,
	type UserId,
} from '../types';

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

	// IDs of stopped caches whose Supabase finalization is still pending
	// (network failure at stop time). Consumers can show a retry banner and
	// invoke `retryFinalization` to attempt persistence again.
	pendingFinalizationIds: CachedJourneyId[];

	// Core actions
	startRecording: () => Promise<boolean>;
	stopRecording: () => Promise<void>;
	retryFinalization: () => Promise<void>;
	discardJourney: () => Promise<void>;
	pauseRecording: () => Promise<void>;
	resumeRecording: () => Promise<void>;

	// Manual stop marking — kept for backwards compatibility while the UI
	// still exposes the button. The target UX has no manual stops.
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
	const [pendingFinalizationIds, setPendingFinalizationIds] = useState<
		CachedJourneyId[]
	>([]);

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

	// On boot, replay any cache row stuck in 'stopped' (the user previously
	// hit Stop but Supabase persistence failed — typically offline). Each
	// retry that still fails stays in pendingFinalizationIds so the UI can
	// surface a retry banner.
	useEffect(() => {
		if (!user) return;
		void (async () => {
			try {
				const stillPending = await retryPendingFinalizations(user.id as UserId);
				setPendingFinalizationIds(stillPending);
			} catch (error) {
				logger.journey.error(
					'Failed to retry pending finalizations at boot',
					error
				);
			}
		})();
	}, [user]);

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

		try {
			const points = await getCachedJourneyPoints(cache.id);
			await finalizeCachedJourney(cache.id, { state: stopped, points });

			// Manual stops still use the legacy journey_points table; the
			// inner saveJourneyPoints early-returns on empty.
			await saveJourneyPoints(manualStopsRef.current);

			setPendingFinalizationIds(prev => prev.filter(id => id !== cache.id));
		} catch (error) {
			logger.journey.error(
				'Finalization failed at stop time, cache preserved for retry',
				error,
				{ cacheId: cache.id }
			);
			setPendingFinalizationIds(prev =>
				prev.includes(cache.id) ? prev : [...prev, cache.id]
			);
		}

		logger.journey.info('Journey recording stopped');
	}, [setCacheState]);

	const retryFinalization = useCallback(async () => {
		if (!user) return;
		const stillPending = await retryPendingFinalizations(user.id as UserId);
		setPendingFinalizationIds(stillPending);
	}, [user]);

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

	const markStop = useCallback(() => {
		const cache = cacheStateRef.current;
		const location = currentLocation;

		if (!cache || cache.status !== 'recording' || !location) {
			logger.journey.warn(
				'Cannot mark stop: journey must be recording with a known location'
			);
			return;
		}

		logger.journey.info('Marking stop at current location');

		const stopPoint: JourneyPoint = {
			id: Crypto.randomUUID() as JourneyPointId,
			journeyId: cachedIdAsJourneyId(cache.id),
			type: JourneyPointType.Stop,
			latitude: location.latitude,
			longitude: location.longitude,
			timestamp: new Date(),
		};

		manualStopsRef.current = [...manualStopsRef.current, stopPoint];
		refreshActiveJourneyView();

		logger.journey.info('Stop marked', { id: stopPoint.id });
	}, [currentLocation, refreshActiveJourneyView]);

	const value: JourneyContextValue = {
		activeJourney,
		isRecording,
		currentLocation,
		stopsCount,
		pendingFinalizationIds,
		startRecording,
		stopRecording,
		retryFinalization,
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
