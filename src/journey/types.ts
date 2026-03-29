import type { SpotId } from '../spot/types';

// Re-export SpotId for convenience
export type { SpotId } from '../spot/types';

// Branded types for journey domain
export type JourneyId = string & { readonly brand: unique symbol };
export type JourneyPointId = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };

export interface JourneyRoutePoint {
	latitude: number;
	longitude: number;
}

/**
 * Journey status - simple state machine
 */
export enum JourneyStatus {
	Recording = 'Recording',
	Paused = 'Paused',
	Completed = 'Completed',
}

/**
 * A stop recorded in the journey timeline.
 */
export interface JourneyPoint {
	id: JourneyPointId;
	journeyId: JourneyId;
	latitude: number;
	longitude: number;
	timestamp: Date;
	spotId?: SpotId;
	waitTimeMinutes?: number;
	notes?: string;
}

/**
 * The Journey entity - central domain object
 * Records a hitchhiker's trip path and stops
 * Foundation for: recording, sharing, group tracking
 */
export interface Journey {
	id: JourneyId;
	userId: UserId;
	status: JourneyStatus;
	startedAt: Date;
	endedAt?: Date;

	// Path data (loaded separately for performance)
	points: JourneyPoint[];
	routePolyline?: JourneyRoutePoint[];

	// Enrichment (added post-trip in F12)
	title?: string;
	notes?: string;

	// Computed from route polyline (preferred) or points
	totalDistanceKm?: number;

	// Future: sharing (F5, F6)
	isShared?: boolean;
	shareToken?: string;
}

/**
 * Location update from GPS service
 */
export interface LocationUpdate {
	latitude: number;
	longitude: number;
	timestamp: Date;
	speed?: number; // m/s
	accuracy?: number; // meters
}

/**
 * Data for enriching a stop point (F12 scope)
 */
export interface StopEnrichment {
	spotId?: SpotId;
	waitTimeMinutes?: number;
	notes?: string;
}
