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
		try {
			// Request foreground permissions first
			const foregroundStatus =
				await Location.requestForegroundPermissionsAsync();
			if (foregroundStatus.status !== 'granted') {
				return false;
			}

			// Request background permissions for journey tracking
			const backgroundStatus =
				await Location.requestBackgroundPermissionsAsync();
			if (backgroundStatus.status !== 'granted') {
				console.warn(
					'Background location permission not granted. Journey tracking will only work in foreground.'
				);
				// Still allow foreground tracking
				return true;
			}

			return true;
		} catch (error) {
			console.error('Error requesting location permissions:', error);
			return false;
		}
	}

	async startTracking(callbacks: LocationTrackingCallbacks): Promise<boolean> {
		if (this.isTracking) {
			console.warn('Location tracking is already active');
			return true;
		}

		const hasPermission = await this.requestPermissions();
		if (!hasPermission) {
			const error = new Error('Location permissions not granted');
			callbacks.onError?.(error);
			return false;
		}

		this.callbacks = callbacks;

		try {
			// Check if background location is available
			const hasBackgroundPermission = await Location.hasServicesEnabledAsync();
			const backgroundPermissionStatus =
				await Location.getBackgroundPermissionsAsync();

			if (
				hasBackgroundPermission &&
				backgroundPermissionStatus.status === 'granted'
			) {
				// Use background location tracking
				await this.startBackgroundTracking();
			} else {
				// Fallback to foreground-only tracking
				await this.startForegroundTracking();
			}

			this.isTracking = true;
			return true;
		} catch (error) {
			console.error('Error starting location tracking:', error);
			callbacks.onError?.(error as Error);
			return false;
		}
	}

	private async startBackgroundTracking(): Promise<void> {
		// Define the background task
		TaskManager.defineTask(
			LOCATION_TASK_NAME,
			async ({
				data,
				error,
			}: TaskManager.TaskManagerTaskBody<LocationTaskData>) => {
				if (error) {
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
						this.callbacks.onLocationUpdate?.(locationUpdate);
					}
				}
			}
		);

		// Start background location updates
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
	}

	private async startForegroundTracking(): Promise<void> {
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
				this.callbacks.onLocationUpdate?.(locationUpdate);
			}
		);
	}

	async stopTracking(): Promise<void> {
		if (!this.isTracking) {
			return;
		}

		try {
			// Stop background tracking if active
			const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME);
			if (isTaskDefined) {
				const isTaskRegistered =
					await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
				if (isTaskRegistered) {
					await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
				}
			}

			// Stop foreground tracking if active
			if (this.foregroundSubscription) {
				this.foregroundSubscription.remove();
				this.foregroundSubscription = null;
			}

			this.isTracking = false;
			this.callbacks = {};
		} catch (error) {
			console.error('Error stopping location tracking:', error);
			throw error;
		}
	}

	async getCurrentLocation(): Promise<LocationUpdate | null> {
		try {
			const location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced,
			});

			return {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				timestamp: new Date(location.timestamp),
				speed: location.coords.speed ?? undefined,
				accuracy: location.coords.accuracy ?? undefined,
			};
		} catch (error) {
			console.error('Error getting current location:', error);
			return null;
		}
	}

	isCurrentlyTracking(): boolean {
		return this.isTracking;
	}
}

export const locationTrackingService = new LocationTrackingService();
