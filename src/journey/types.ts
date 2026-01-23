import type { SpotId } from '../spot/types';

// Re-export SpotId for convenience
export type { SpotId } from '../spot/types';

// Branded types for journey domain
export type JourneyId = string & { readonly brand: unique symbol };
export type JourneyPointId = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };

/**
 * Journey status - simple state machine
 */
export enum JourneyStatus {
	Recording = 'Recording',
	Paused = 'Paused',
	Completed = 'Completed',
}

/**
 * Point type - what kind of recorded point
 */
export enum JourneyPointType {
	Location = 'Location', // Regular GPS point (auto-recorded)
	Stop = 'Stop', // User manually marked a stop
}

/**
 * A recorded point in the journey
 * Can be a regular location update or a user-marked stop
 */
export interface JourneyPoint {
	id: JourneyPointId;
	journeyId: JourneyId;
	type: JourneyPointType;
	latitude: number;
	longitude: number;
	timestamp: Date;

	// Only for Stop type - enrichment (added post-trip in F12)
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

	// Enrichment (added post-trip in F12)
	title?: string;
	notes?: string;

	// Computed from points
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
