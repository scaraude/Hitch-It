import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
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

const LOCATION_WATCH_TIME_INTERVAL_MS = 5000;
const LOCATION_WATCH_DISTANCE_INTERVAL_METERS = 25;

export const useLocation = (): UseLocationReturn => {
	const [userLocation, setUserLocation] = useState<LocationType | null>(null);
	const [currentRegion, setCurrentRegion] = useState<MapRegion>(
		MAP_CONFIG.defaultRegion
	);
	const [locationLoading, setLocationLoading] = useState(true);
	const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
		null
	);
	const hasCenteredOnUserRef = useRef(false);

	const stopLocationWatch = useCallback(() => {
		locationSubscriptionRef.current?.remove();
		locationSubscriptionRef.current = null;
	}, []);

	const applyLocationUpdate = useCallback(
		(location: Location.LocationObject) => {
			const userCoordinate: LocationType = {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			};

			logger.location.debug('User location updated', {
				latitude: userCoordinate.latitude,
				longitude: userCoordinate.longitude,
				accuracy: location.coords.accuracy,
			});

			setUserLocation(userCoordinate);

			if (!hasCenteredOnUserRef.current) {
				hasCenteredOnUserRef.current = true;
				setCurrentRegion({
					latitude: userCoordinate.latitude,
					longitude: userCoordinate.longitude,
					latitudeDelta: MAP_CONFIG.defaultRegion.latitudeDelta,
					longitudeDelta: MAP_CONFIG.defaultRegion.longitudeDelta,
				});
			}
		},
		[]
	);

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
			const location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced,
			});
			applyLocationUpdate(location);

			stopLocationWatch();
			locationSubscriptionRef.current = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.Balanced,
					timeInterval: LOCATION_WATCH_TIME_INTERVAL_MS,
					distanceInterval: LOCATION_WATCH_DISTANCE_INTERVAL_METERS,
				},
				applyLocationUpdate
			);
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
	}, [applyLocationUpdate, stopLocationWatch]);

	useEffect(() => {
		void getCurrentLocation();
		return () => {
			stopLocationWatch();
		};
	}, [getCurrentLocation, stopLocationWatch]);

	return {
		userLocation,
		currentRegion,
		locationLoading,
		getCurrentLocation,
	};
};
