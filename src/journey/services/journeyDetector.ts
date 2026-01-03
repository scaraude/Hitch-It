import { logger } from '@/utils';
import type { Spot } from '../../spot/types';
import {
	DEFAULT_JOURNEY_CONFIG,
	type JourneyConfig,
	type JourneyState,
	JourneyStateStatus,
	type LocationUpdate,
	StepType,
} from '../types';

interface DetectionResult {
	newStatus: JourneyStateStatus;
	shouldCreateNewStep: boolean;
	stepType?: StepType;
	nearbySpot?: Spot;
}

export class JourneyDetector {
	private readonly config: JourneyConfig;
	private locationHistory: LocationUpdate[] = [];
	private stationaryStartTime: Date | null = null;
	private nearbySpots: Spot[] = [];

	constructor(config: JourneyConfig = DEFAULT_JOURNEY_CONFIG) {
		this.config = config;
	}

	/**
	 * Update the list of nearby spots for detection
	 */
	setNearbySpots(spots: Spot[]): void {
		logger.journey.debug('Setting nearby spots for detection', {
			count: spots.length,
		});
		this.nearbySpots = spots;
	}

	/**
	 * Process a new location update and determine journey state
	 */
	processLocation(
		location: LocationUpdate,
		currentState: JourneyState
	): DetectionResult {
		logger.journey.debug('Processing location update', {
			latitude: location.latitude,
			longitude: location.longitude,
			speed: location.speed,
			accuracy: location.accuracy,
			currentStatus: currentState.status,
		});

		this.locationHistory.push(location);
		this.keepRecentHistory();

		const isMoving = this.detectMovement(location);
		const nearbySpot = this.findNearbySpot(location);
		const isAtSpot = nearbySpot !== undefined;

		logger.journey.debug('Movement and spot detection', {
			isMoving,
			isAtSpot,
			nearbySpotId: nearbySpot?.id,
		});

		// Update stationary tracking
		if (!isMoving) {
			if (this.stationaryStartTime === null) {
				logger.journey.debug('User became stationary');
				this.stationaryStartTime = location.timestamp;
			}
		} else {
			this.stationaryStartTime = null;
		}

		const stationaryMinutes = this.getStationaryMinutes(location.timestamp);
		if (stationaryMinutes > 0) {
			logger.journey.debug('User stationary duration', {
				minutes: stationaryMinutes,
			});
		}

		const result = this.determineState(
			isMoving,
			isAtSpot,
			stationaryMinutes,
			currentState,
			nearbySpot
		);

		if (result.newStatus !== currentState.status) {
			logger.journey.info('Journey state transition', {
				from: currentState.status,
				to: result.newStatus,
				shouldCreateNewStep: result.shouldCreateNewStep,
				stepType: result.stepType,
			});
		}

		return result;
	}

	/**
	 * Detect if the user is moving based on speed and location history
	 */
	private detectMovement(location: LocationUpdate): boolean {
		// Check speed if available
		if (location.speed !== undefined) {
			if (this.locationHistory.length < 2) {
				return false;
			}

			const previousLocation =
				this.locationHistory[this.locationHistory.length - 2];
			const distance = this.calculateDistance(
				previousLocation.latitude,
				previousLocation.longitude,
				location.latitude,
				location.longitude
			);
			const accuracyBuffer =
				(location.accuracy ?? 0) + (previousLocation.accuracy ?? 0);
			const minMovementDistance = Math.max(10, accuracyBuffer);
			if (distance < minMovementDistance) {
				return false;
			}

			const speedKmh = location.speed * 3.6; // Convert m/s to km/h
			return speedKmh >= this.config.movingSpeedThresholdKmh;
		}

		// Fallback: calculate speed from location history
		if (this.locationHistory.length < 2) {
			return false;
		}

		const previousLocation =
			this.locationHistory[this.locationHistory.length - 2];
		const distance = this.calculateDistance(
			previousLocation.latitude,
			previousLocation.longitude,
			location.latitude,
			location.longitude
		);

		const timeDiff =
			(location.timestamp.getTime() - previousLocation.timestamp.getTime()) /
			1000; // seconds
		const speedKmh = (distance / timeDiff) * 3.6; // km/h

		return speedKmh >= this.config.movingSpeedThresholdKmh;
	}

	/**
	 * Find a spot near the current location
	 */
	private findNearbySpot(location: LocationUpdate): Spot | undefined {
		return this.nearbySpots.find(spot => {
			const distance = this.calculateDistance(
				location.latitude,
				location.longitude,
				spot.coordinates.latitude,
				spot.coordinates.longitude
			);
			return distance <= this.config.spotProximityMeters;
		});
	}

	/**
	 * Calculate distance between two coordinates in meters
	 * Using Haversine formula
	 */
	private calculateDistance(
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number
	): number {
		const R = 6371e3; // Earth's radius in meters
		const φ1 = (lat1 * Math.PI) / 180;
		const φ2 = (lat2 * Math.PI) / 180;
		const Δφ = ((lat2 - lat1) * Math.PI) / 180;
		const Δλ = ((lon2 - lon1) * Math.PI) / 180;

		const a =
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}

	/**
	 * Get how many minutes the user has been stationary
	 */
	private getStationaryMinutes(currentTime: Date): number {
		if (this.stationaryStartTime === null) {
			return 0;
		}
		return (
			(currentTime.getTime() - this.stationaryStartTime.getTime()) / 1000 / 60
		);
	}

	/**
	 * Keep only recent location history to avoid memory issues
	 */
	private keepRecentHistory(): void {
		const MAX_HISTORY_SIZE = 100;
		if (this.locationHistory.length > MAX_HISTORY_SIZE) {
			this.locationHistory = this.locationHistory.slice(-MAX_HISTORY_SIZE);
		}
	}

	/**
	 * Determine the current journey state based on movement and location
	 */
	private determineState(
		isMoving: boolean,
		isAtSpot: boolean,
		stationaryMinutes: number,
		currentState: JourneyState,
		nearbySpot?: Spot
	): DetectionResult {
		// Moving = in vehicle
		if (isMoving) {
			if (currentState.status !== JourneyStateStatus.InVehicle) {
				return {
					newStatus: JourneyStateStatus.InVehicle,
					shouldCreateNewStep: true,
					stepType: StepType.InVehicle,
				};
			}
			return {
				newStatus: JourneyStateStatus.InVehicle,
				shouldCreateNewStep: false,
			};
		}

		// Stationary at a spot = waiting
		if (isAtSpot && stationaryMinutes >= this.config.waitingThresholdMinutes) {
			if (currentState.status !== JourneyStateStatus.Waiting) {
				return {
					newStatus: JourneyStateStatus.Waiting,
					shouldCreateNewStep: true,
					stepType: StepType.Waiting,
					nearbySpot,
				};
			}
			return {
				newStatus: JourneyStateStatus.Waiting,
				shouldCreateNewStep: false,
				nearbySpot,
			};
		}

		// Stationary elsewhere for a while = break
		if (!isAtSpot && stationaryMinutes >= this.config.breakThresholdMinutes) {
			if (currentState.status !== JourneyStateStatus.Break) {
				return {
					newStatus: JourneyStateStatus.Break,
					shouldCreateNewStep: true,
					stepType: StepType.Break,
				};
			}
			return {
				newStatus: JourneyStateStatus.Break,
				shouldCreateNewStep: false,
			};
		}

		// Brief stop or just started - keep current state
		return {
			newStatus: currentState.status,
			shouldCreateNewStep: false,
		};
	}

	/**
	 * Reset the detector state
	 */
	reset(): void {
		this.locationHistory = [];
		this.stationaryStartTime = null;
	}

	/**
	 * Get current location history
	 */
	getLocationHistory(): LocationUpdate[] {
		return [...this.locationHistory];
	}
}

export const createJourneyDetector = (
	config?: JourneyConfig
): JourneyDetector => {
	return new JourneyDetector(config);
};
