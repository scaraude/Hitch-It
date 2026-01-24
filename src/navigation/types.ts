import type { Spot } from '../spot/types';

/**
 * Root navigation stack parameter list
 * Defines the screens and their params for type-safe navigation
 */
export type RootStackParamList = {
	Home: undefined;
	// Future screens can be added here:
	// SpotDetails: { spotId: SpotId };
	// Profile: { userId: string };
	// Settings: undefined;
};

/**
 * Type helpers for navigation props
 */
declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}

// ============================================
// Navigation Feature Types (Route Guidance)
// ============================================

/** Branded type for route IDs */
export type RouteId = string & { readonly brand: unique symbol };

export interface RoutePoint {
	latitude: number;
	longitude: number;
}

export interface NavigationRoute {
	id: RouteId;
	origin: RoutePoint;
	destination: RoutePoint;
	destinationName: string;
	polyline: RoutePoint[];
	distanceKm: number;
	durationMinutes: number;
	createdAt: Date;
}

export interface SpotOnRoute {
	spot: Spot;
	distanceFromRouteMeters: number;
	closestRoutePointIndex: number;
}

export interface DestinationMarker {
	location: RoutePoint;
	name: string;
}

export interface NavigationState {
	isActive: boolean;
	route: NavigationRoute | null;
	spotsOnRoute: SpotOnRoute[];
	destinationMarker: DestinationMarker | null;
}

export const INITIAL_NAVIGATION_STATE: NavigationState = {
	isActive: false,
	route: null,
	spotsOnRoute: [],
	destinationMarker: null,
};
