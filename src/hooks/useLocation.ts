import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { MAP_CONFIG } from '../constants';
import { useTranslation } from '../i18n/useTranslation';
import type { Location as LocationType, MapRegion } from '../types';
import { logger } from '../utils';

const LOCATION_ACCURACY = Location.Accuracy.Balanced;
const LOCATION_TIME_INTERVAL_MS = 2000;
const LOCATION_DISTANCE_INTERVAL_METERS = 10;
const LAST_KNOWN_LOCATION_MAX_AGE_MS = 5 * 60 * 1000;

interface UseLocationReturn {
	userLocation: LocationType | null;
	currentRegion: MapRegion;
	locationLoading: boolean;
	getCurrentLocation: () => Promise<void>;
}

export const useLocation = (): UseLocationReturn => {
	const { t } = useTranslation();
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

	const startLocationWatcher = useCallback(async () => {
		stopLocationWatch();

		locationSubscriptionRef.current = await Location.watchPositionAsync(
			{
				accuracy: LOCATION_ACCURACY,
				timeInterval: LOCATION_TIME_INTERVAL_MS,
				distanceInterval: LOCATION_DISTANCE_INTERVAL_METERS,
			},
			applyLocationUpdate
		);
	}, [applyLocationUpdate, stopLocationWatch]);

	const fetchPreciseCurrentLocation = useCallback(async () => {
		try {
			const location = await Location.getCurrentPositionAsync({
				accuracy: LOCATION_ACCURACY,
			});
			applyLocationUpdate(location);
		} catch (error) {
			logger.location.warn('Unable to fetch precise current location', {
				error,
			});
		}
	}, [applyLocationUpdate]);

	const getCurrentLocation = useCallback(async () => {
		logger.location.info('Getting current location from useLocation hook');
		try {
			setLocationLoading(true);
			const existingPermission = await Location.getForegroundPermissionsAsync();
			const status =
				existingPermission.status === 'granted'
					? existingPermission.status
					: (await Location.requestForegroundPermissionsAsync()).status;

			if (status !== 'granted') {
				logger.location.warn('Location permission denied by user', { status });
				Alert.alert(
					t('map.permissionDenied'),
					t('map.permissionDeniedMessage'),
					[{ text: t('common.ok') }]
				);
				return;
			}

			logger.location.info(
				'Location permission granted, starting non-blocking location bootstrap'
			);
			await startLocationWatcher();

			const lastKnownLocation = await Location.getLastKnownPositionAsync({
				maxAge: LAST_KNOWN_LOCATION_MAX_AGE_MS,
			});
			if (lastKnownLocation) {
				applyLocationUpdate(lastKnownLocation);
			} else {
				logger.location.debug('No recent last known location available');
			}

			// Do not block UI on GPS lock; refresh precise position in background.
			void fetchPreciseCurrentLocation();
		} catch (error) {
			logger.location.error(
				'Error getting location from useLocation hook',
				error
			);
			Alert.alert(t('map.locationError'), t('map.locationErrorMessage'), [
				{ text: t('common.ok') },
			]);
		} finally {
			setLocationLoading(false);
		}
	}, [
		applyLocationUpdate,
		fetchPreciseCurrentLocation,
		startLocationWatcher,
		t,
	]);

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
