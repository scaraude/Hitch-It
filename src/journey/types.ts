import type { SpotId } from '../spot/types';

// Re-export SpotId for convenience
export type { SpotId } from '../spot/types';

// Branded types for journey domain
export type TravelId = string & { readonly brand: unique symbol };
export type TravelStepId = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };

export enum StepType {
	Waiting = 'Waiting',
	InVehicle = 'InVehicle',
	Walking = 'Walking',
	Break = 'Break',
}

export enum TravelStatus {
	InProgress = 'InProgress',
	Completed = 'Completed',
	Abandoned = 'Abandoned',
}

export enum JourneyStateStatus {
	Idle = 'Idle',
	Waiting = 'Waiting',
	InVehicle = 'InVehicle',
	Break = 'Break',
}

export interface TravelStep {
	id: TravelStepId;
	travelId: TravelId;
	type: StepType;
	spotId?: SpotId;
	startTime: Date;
	endTime?: Date;
	notes?: string;
}

export interface Travel {
	id: TravelId;
	userId: UserId;
	startDate: Date;
	endDate?: Date;
	origin: string;
	destination: string;
	status: TravelStatus;
	steps: TravelStep[];
	totalDistance: number;
	totalWaitTime: number;
}

export interface JourneyState {
	status: JourneyStateStatus;
	currentStep: TravelStep | null;
	detectedVehicleChanges: number;
	startTime: Date;
}

export interface LocationUpdate {
	latitude: number;
	longitude: number;
	timestamp: Date;
	speed?: number; // m/s
	accuracy?: number;
}

export interface JourneyConfig {
	waitingThresholdMinutes: number;
	breakThresholdMinutes: number;
	movingSpeedThresholdKmh: number;
	spotProximityMeters: number;
}

export const DEFAULT_JOURNEY_CONFIG: JourneyConfig = {
	waitingThresholdMinutes: 3,
	breakThresholdMinutes: 10,
	movingSpeedThresholdKmh: 15,
	spotProximityMeters: 100,
};
