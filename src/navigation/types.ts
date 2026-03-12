import type { JourneyId } from '../journey/types';
import type { Spot } from '../spot/types';
import {
	DEFAULT_NAVIGATION_MODE,
	type NavigationMode,
} from './navigationModePolicy';

/**
 * Root navigation stack parameter list
 * Defines the screens and their params for type-safe navigation
 */
export type RootStackParamList = {
	Home: undefined;
	Login: undefined;
	SignUp: undefined;
	Profile: undefined;
	ForgotPassword: { email?: string } | undefined;
	JourneyHistory: undefined;
	JourneyDetail: { journeyId: JourneyId };
	ManualJourneyEntry: undefined;
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
	activeMode: NavigationMode;
	isActive: boolean;
	route: NavigationRoute | null;
	spotsOnRoute: SpotOnRoute[];
	driverRoute: NavigationRoute | null;
	commonSpotsOnRoute: SpotOnRoute[];
	destinationMarker: DestinationMarker | null;
}

export const INITIAL_NAVIGATION_STATE: NavigationState = {
	activeMode: DEFAULT_NAVIGATION_MODE,
	isActive: false,
	route: null,
	spotsOnRoute: [],
	driverRoute: null,
	commonSpotsOnRoute: [],
	destinationMarker: null,
};
