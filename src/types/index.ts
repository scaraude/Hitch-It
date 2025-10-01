export interface Location {
    latitude: number;
    longitude: number;
}

export interface MapRegion {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export interface UserLocation {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    heading?: number;
    speed?: number;
}

export type RootStackParamList = {
    Home: undefined;
    Map: undefined;
    Profile: undefined;
};
