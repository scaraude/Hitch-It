import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { MAP_CONFIG } from '../constants';
import { Location as LocationType, MapRegion } from '../types';

interface UseLocationReturn {
    userLocation: LocationType | null;
    currentRegion: MapRegion;
    locationLoading: boolean;
    getCurrentLocation: () => Promise<void>;
}

export const useLocation = (): UseLocationReturn => {
    const [userLocation, setUserLocation] = useState<LocationType | null>(null);
    const [currentRegion, setCurrentRegion] = useState<MapRegion>(MAP_CONFIG.defaultRegion);
    const [locationLoading, setLocationLoading] = useState(true);

    const getCurrentLocation = async () => {
        try {
            setLocationLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required to show your current location on the map.',
                    [{ text: 'OK', onPress: () => setLocationLoading(false) }]
                );
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const userCoordinate: LocationType = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            setUserLocation(userCoordinate);
            const newRegion = {
                latitude: userCoordinate.latitude,
                longitude: userCoordinate.longitude,
                latitudeDelta: MAP_CONFIG.defaultRegion.latitudeDelta,
                longitudeDelta: MAP_CONFIG.defaultRegion.longitudeDelta,
            };
            setCurrentRegion(newRegion);
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert(
                'Location Error',
                'Unable to get your current location. Using default location.',
                [{ text: 'OK', onPress: () => setLocationLoading(false) }]
            );
        } finally {
            setLocationLoading(false);
        }
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    return {
        userLocation,
        currentRegion,
        locationLoading,
        getCurrentLocation,
    };
};