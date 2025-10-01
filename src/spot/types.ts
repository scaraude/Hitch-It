// Branded UUID type
export type SpotId = string & { readonly brand: unique symbol };

export type Direction =
    | "North" | "North-East" | "East" | "South-East"
    | "South" | "South-West" | "West" | "North-West";

export type Appreciation = "perfect" | "good" | "bad";

export interface Location {
    latitude: number;
    longitude: number;
}

export interface SpotMarkerData {
    id: string;
    coordinate: Location;
    title: string;
    description?: string;
    color?: string;
}

export interface Spot {
    id: SpotId;
    appreciation: Appreciation;
    roadName: string;
    direction: Direction;
    destinations: string[];
    location: Location;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}