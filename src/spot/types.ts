// Branded UUID type
export type SpotId = string & { readonly brand: unique symbol };

export enum Direction {
	North = 'North',
	NorthEast = 'North-East',
	East = 'East',
	SouthEast = 'South-East',
	South = 'South',
	SouthWest = 'South-West',
	West = 'West',
	NorthWest = 'North-West',
}

export interface Location {
	latitude: number;
	longitude: number;
}

export interface SpotMarkerData {
	id: string;
	coordinates: Location;
	title: string;
	description?: string;
	color?: string;
}

export interface Spot {
	id: SpotId;
	roadName: string;
	direction: Direction;
	destinations: string[];
	coordinates: Location;
	createdAt: Date;
	updatedAt: Date;
	createdBy: string;
}
