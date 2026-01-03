import { logger } from '@/utils';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import type { LocationUpdate } from '../types';

const LOCATION_TASK_NAME = 'BACKGROUND_LOCATION_TRACKING';

interface LocationTaskData {
	locations: Array<{
		coords: {
			latitude: number;
			longitude: number;
			speed: number | null;
			accuracy: number | null;
		};
		timestamp: number;
	}>;
}

export interface LocationTrackingCallbacks {
	onLocationUpdate?: (location: LocationUpdate) => void;
	onError?: (error: Error) => void;
}

class LocationTrackingService {
	private isTracking = false;
	private callbacks: LocationTrackingCallbacks = {};
	private foregroundSubscription: Location.LocationSubscription | null = null;

	async requestPermissions(): Promise<boolean> {
		logger.location.info('Requesting location permissions');
		try {
			// Request foreground permissions first
			const foregroundStatus =
				await Location.requestForegroundPermissionsAsync();
			if (foregroundStatus.status !== 'granted') {
				logger.location.warn('Foreground location permission denied', {
					status: foregroundStatus.status,
				});
				return false;
			}

			logger.location.info('Foreground location permission granted');

			// Request background permissions for journey tracking
			const backgroundStatus =
				await Location.requestBackgroundPermissionsAsync();
			if (backgroundStatus.status !== 'granted') {
				logger.location.warn(
					'Background location permission not granted. Journey tracking will only work in foreground.',
					{ status: backgroundStatus.status }
				);
				// Still allow foreground tracking
				return true;
			}

			logger.location.info('Background location permission granted');
			return true;
		} catch (error) {
			logger.location.error('Error requesting location permissions', error);
			return false;
		}
	}

	async startTracking(callbacks: LocationTrackingCallbacks): Promise<boolean> {
		// Check if background task is already running (e.g., after app restart)
		const alreadyTracking = await this.isCurrentlyTracking();
		if (alreadyTracking) {
			logger.location.warn('Location tracking is already active');
			// Update callbacks so new listeners can receive updates
			this.callbacks = callbacks;
			return true;
		}

		logger.location.info('Starting location tracking');
		const hasPermission = await this.requestPermissions();
		if (!hasPermission) {
			const error = new Error('Location permissions not granted');
			logger.location.error('Cannot start tracking: permissions not granted');
			callbacks.onError?.(error);
			return false;
		}

		this.callbacks = callbacks;

		try {
			// Check if background location is available
			const hasBackgroundPermission = await Location.hasServicesEnabledAsync();
			const backgroundPermissionStatus =
				await Location.getBackgroundPermissionsAsync();

			logger.location.debug('Checking location services', {
				hasBackgroundPermission,
				backgroundStatus: backgroundPermissionStatus.status,
			});

			if (
				hasBackgroundPermission &&
				backgroundPermissionStatus.status === 'granted'
			) {
				// Use background location tracking
				logger.location.info('Starting background location tracking');
				await this.startBackgroundTracking();
			} else {
				// Fallback to foreground-only tracking
				logger.location.info('Starting foreground-only location tracking');
				await this.startForegroundTracking();
			}

			this.isTracking = true;
			logger.location.info('Location tracking started successfully');
			return true;
		} catch (error) {
			logger.location.error('Error starting location tracking', error);
			callbacks.onError?.(error as Error);
			return false;
		}
	}

	private async startBackgroundTracking(): Promise<void> {
		logger.location.debug('Defining background location task');
		// Define the background task
		TaskManager.defineTask(
			LOCATION_TASK_NAME,
			async ({
				data,
				error,
			}: TaskManager.TaskManagerTaskBody<LocationTaskData>) => {
				if (error) {
					logger.location.error(
						'Background location task error',
						new Error(error.message)
					);
					this.callbacks.onError?.(new Error(error.message));
					return;
				}

				if (data) {
					const { locations } = data;
					if (locations && locations.length > 0) {
						const location = locations[0];
						const locationUpdate: LocationUpdate = {
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
							timestamp: new Date(location.timestamp),
							speed: location.coords.speed ?? undefined,
							accuracy: location.coords.accuracy ?? undefined,
						};
						logger.location.debug('Background location update received', {
							latitude: locationUpdate.latitude,
							longitude: locationUpdate.longitude,
							speed: locationUpdate.speed,
							accuracy: locationUpdate.accuracy,
						});
						this.callbacks.onLocationUpdate?.(locationUpdate);
					}
				}
			}
		);

		// Start background location updates
		logger.location.debug(
			'Starting background location updates with task manager'
		);
		await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
			accuracy: Location.Accuracy.Balanced,
			timeInterval: 5000, // 5 seconds - battery efficient
			distanceInterval: 50, // 50 meters - only update when significant movement
			foregroundService: {
				notificationTitle: 'Hitch-It Journey Tracking',
				notificationBody: 'Recording your hitchhiking journey',
			},
			pausesUpdatesAutomatically: true, // Pause when stationary
			activityType: Location.ActivityType.AutomotiveNavigation,
		});
		logger.location.info('Background location updates started');
	}

	private async startForegroundTracking(): Promise<void> {
		logger.location.debug('Starting foreground location tracking');
		this.foregroundSubscription = await Location.watchPositionAsync(
			{
				accuracy: Location.Accuracy.Balanced,
				timeInterval: 5000, // 5 seconds
				distanceInterval: 50, // 50 meters
			},
			location => {
				const locationUpdate: LocationUpdate = {
					latitude: location.coords.latitude,
					longitude: location.coords.longitude,
					timestamp: new Date(location.timestamp),
					speed: location.coords.speed ?? undefined,
					accuracy: location.coords.accuracy ?? undefined,
				};
				logger.location.debug('Foreground location update received', {
					latitude: locationUpdate.latitude,
					longitude: locationUpdate.longitude,
					speed: locationUpdate.speed,
					accuracy: locationUpdate.accuracy,
				});
				this.callbacks.onLocationUpdate?.(locationUpdate);
			}
		);
		logger.location.info('Foreground location tracking started');
	}

	async stopTracking(): Promise<void> {
		if (!this.isTracking) {
			logger.location.debug('Stop tracking called but tracking is not active');
			return;
		}

		logger.location.info('Stopping location tracking');
		try {
			// Stop background tracking if active
			const isTaskDefined = TaskManager.isTaskDefined(LOCATION_TASK_NAME);
			if (isTaskDefined) {
				const isTaskRegistered =
					await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
				if (isTaskRegistered) {
					logger.location.debug('Stopping background location task');
					await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
					logger.location.info('Background location tracking stopped');
				}
			}

			// Stop foreground tracking if active
			if (this.foregroundSubscription) {
				logger.location.debug('Stopping foreground location subscription');
				this.foregroundSubscription.remove();
				this.foregroundSubscription = null;
				logger.location.info('Foreground location tracking stopped');
			}

			this.isTracking = false;
			this.callbacks = {};
			logger.location.info('Location tracking stopped successfully');
		} catch (error) {
			logger.location.error('Error stopping location tracking', error);
			throw error;
		}
	}

	async getCurrentLocation(): Promise<LocationUpdate | null> {
		logger.location.debug('Getting current location');
		try {
			const location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced,
			});

			const locationUpdate = {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				timestamp: new Date(location.timestamp),
				speed: location.coords.speed ?? undefined,
				accuracy: location.coords.accuracy ?? undefined,
			};

			logger.location.info('Current location retrieved', {
				latitude: locationUpdate.latitude,
				longitude: locationUpdate.longitude,
				accuracy: locationUpdate.accuracy,
			});

			return locationUpdate;
		} catch (error) {
			logger.location.error('Error getting current location', error);
			return null;
		}
	}

	async isCurrentlyTracking(): Promise<boolean> {
		logger.location.debug('isCurrentlyTracking - Checking if location tracking is currently active');
		// Check in-memory flag first
		if (this.isTracking) {
			return true;
		}

		// Check if background task is actually registered (survives app restart)
		try {
			const isTaskDefined = TaskManager.isTaskDefined(LOCATION_TASK_NAME);
			if (isTaskDefined) {
				const isTaskRegistered =
					await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
				if (isTaskRegistered) {
					logger.location.info(
						'Background location task is registered, restoring tracking state'
					);
					this.isTracking = true;
					return true;
				}
			}
		} catch (error) {
			logger.location.error('Error checking background task status', error);
		}

		return false;
	}
}

export const locationTrackingService = new LocationTrackingService();
