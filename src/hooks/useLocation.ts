import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { MAP_CONFIG } from '../constants';
import type { Location as LocationType, MapRegion } from '../types';
import { logger } from '../utils';

interface UseLocationReturn {
	userLocation: LocationType | null;
	currentRegion: MapRegion;
	locationLoading: boolean;
	getCurrentLocation: () => Promise<void>;
}

export const useLocation = (): UseLocationReturn => {
	const [userLocation, setUserLocation] = useState<LocationType | null>(null);
	const [currentRegion, setCurrentRegion] = useState<MapRegion>(
		MAP_CONFIG.defaultRegion
	);
	const [locationLoading, setLocationLoading] = useState(true);

	const getCurrentLocation = useCallback(async () => {
		logger.location.info('Getting current location from useLocation hook');
		try {
			setLocationLoading(true);
			const { status } = await Location.requestForegroundPermissionsAsync();

			if (status !== 'granted') {
				logger.location.warn('Location permission denied by user', { status });
				Alert.alert(
					'Permission Denied',
					'Location permission is required to show your current location on the map.',
					[{ text: 'OK', onPress: () => setLocationLoading(false) }]
				);
				return;
			}

			logger.location.info('Location permission granted, fetching position');
			const location = await Location.getCurrentPositionAsync({});
			const userCoordinate: LocationType = {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			};

			logger.location.info('User location retrieved', {
				latitude: userCoordinate.latitude,
				longitude: userCoordinate.longitude,
				accuracy: location.coords.accuracy,
			});

			setUserLocation(userCoordinate);
			const newRegion = {
				latitude: userCoordinate.latitude,
				longitude: userCoordinate.longitude,
				latitudeDelta: MAP_CONFIG.defaultRegion.latitudeDelta,
				longitudeDelta: MAP_CONFIG.defaultRegion.longitudeDelta,
			};
			setCurrentRegion(newRegion);
		} catch (error) {
			logger.location.error(
				'Error getting location from useLocation hook',
				error
			);
			Alert.alert(
				'Location Error',
				'Unable to get your current location. Using default location.',
				[{ text: 'OK', onPress: () => setLocationLoading(false) }]
			);
		} finally {
			setLocationLoading(false);
		}
	}, []);

	useEffect(() => {
		getCurrentLocation();
	}, [getCurrentLocation]);

	return {
		userLocation,
		currentRegion,
		locationLoading,
		getCurrentLocation,
	};
};
