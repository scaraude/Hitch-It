import type { SpotId } from '../spot/types';

// Re-export SpotId for convenience
export type { SpotId } from '../spot/types';

// Branded types for journey domain
export type JourneyId = string & { readonly brand: unique symbol };
export type JourneyStopId = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };

// Live recording cache (SQLite-backed). Distinct from JourneyId because a cache
// row exists before — and may outlive — its corresponding persisted journey.
export type CachedJourneyId = string & { readonly brand: unique symbol };

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
 * A stop on the journey: a ride change. Distinct from the GPS trace,
 * which lives in journey.routePolyline.
 */
export interface JourneyStop {
	id: JourneyStopId;
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
	stops: JourneyStop[];
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

// =============================================================================
// Live recording cache (TCK-20)
// =============================================================================

export type CachedJourneyStatus =
	| 'recording'
	| 'paused'
	| 'stopped'
	| 'finalized';

/**
 * A single GPS point captured during live recording, stored in SQLite.
 * `seq` is monotonically increasing within a cache (insertion order preserved).
 */
export interface CachedJourneyPoint {
	cacheId: CachedJourneyId;
	seq: number;
	latitude: number;
	longitude: number;
	timestamp: Date;
	speed?: number;
	accuracy?: number;
}

/**
 * Navigation session associated with a cached journey, persisted so the user
 * can resume after an app crash (origin/destination kept; route is
 * recalculated from the current GPS position on restore).
 */
export interface CachedNavigationSession {
	cachedJourneyId: CachedJourneyId;
	originLatitude: number;
	originLongitude: number;
	originName?: string;
	destinationLatitude: number;
	destinationLongitude: number;
	destinationName?: string;
	createdAt: Date;
}
