import { useFocusEffect } from '@react-navigation/native';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Keyboard, Platform, View } from 'react-native';
import { Marker } from 'react-native-maps';
import {
	LoadingSpinner,
	MapViewComponent,
	type MapViewRef,
} from '../components';
import { toastUtils } from '../components/ui';
import { COLORS } from '../constants';
import { useLocation } from '../hooks';
import { JourneyProvider, useJourney } from '../journey/context';
import { DestinationMarker, RoutePolyline } from '../navigation/components';
import {
	NavigationProvider,
	useNavigation,
} from '../navigation/context/NavigationContext';
import { useArrivalDetection } from '../navigation/hooks';
import { SpotProvider, useSpotContext } from '../spot/context';
import type { Location, MapBounds, MapRegion } from '../types';
import {
	calculateZoomLevel,
	logger,
	polylineToRegion,
	regionToBounds,
} from '../utils';
import { HomeFixedOverlay } from './home/components/HomeFixedOverlay';
import { HomeSheetsOverlay } from './home/components/HomeSheetsOverlay';
import { homeScreenStyles as styles } from './home/homeScreenStyles';

interface HomeScreenContentProps {
	onRegionChange: (region: MapRegion) => void;
}

const HomeScreenContent: React.FC<HomeScreenContentProps> = ({
	onRegionChange,
}) => {
	const { userLocation, currentRegion, locationLoading } = useLocation();
	const {
		spots,
		selectedSpot,
		isPlacingSpot,
		isShowingForm,
		startPlacingSpot,
		confirmSpotPlacement,
		cancelSpotPlacement,
		submitSpotForm,
		cancelSpotForm,
		selectSpot,
		selectSpotEntity,
		deselectSpot,
	} = useSpotContext();

	const { navigation, startNavigationWithRoute, stopNavigation } =
		useNavigation();

	const { startRecording, stopRecording, isRecording } = useJourney();

	const [mapRegion, setMapRegion] = useState<MapRegion>(currentRegion);
	const [showCompletionSheet, setShowCompletionSheet] = useState(false);
	const [journeyStartTime, setJourneyStartTime] = useState<Date | null>(null);
	const [longPressMarker, setLongPressMarker] = useState<Location | null>(null);
	const [showEmbarquerSheet, setShowEmbarquerSheet] = useState(false);
	const [embarquerOrigin, setEmbarquerOrigin] = useState<{
		location: Location;
		name: string;
	} | null>(null);
	const [embarquerDestination, setEmbarquerDestination] = useState<{
		location: Location;
		name: string;
	} | null>(null);
	const [searchText, setSearchText] = useState('');
	const [searchDestination, setSearchDestination] = useState<{
		location: Location;
		name: string;
	} | null>(null);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [mapHeading, setMapHeading] = useState(0);
	const [isFollowingUser, setIsFollowingUser] = useState(false);

	const mapViewRef = useRef<MapViewRef>(null);
	const followUserTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);

	// Arrival detection
	const { hasArrived } = useArrivalDetection(navigation.route, userLocation);

	// Handle arrival
	useEffect(() => {
		if (hasArrived && navigation.isActive) {
			setShowCompletionSheet(true);
		}
	}, [hasArrived, navigation.isActive]);

	const handleRegionChange = useCallback(
		(region: MapRegion) => {
			setMapRegion(region);
			onRegionChange(region);
			// Clear long press marker when user moves the map
			if (longPressMarker) {
				setLongPressMarker(null);
			}
		},
		[longPressMarker, onRegionChange]
	);

	const handleMarkerPress = useCallback(
		(markerId: string) => {
			// Clear long press marker when tapping a spot
			setLongPressMarker(null);

			if (navigation.isActive) {
				const routeSpot = navigation.spotsOnRoute.find(
					({ spot }) => spot.id === markerId
				);
				if (routeSpot) {
					selectSpotEntity(routeSpot.spot);
					return;
				}
			}

			selectSpot(markerId);
		},
		[navigation.isActive, navigation.spotsOnRoute, selectSpot, selectSpotEntity]
	);

	const handleLongPress = useCallback(
		(location: Location) => {
			// Don't allow long press during navigation or spot placement
			if (navigation.isActive || isPlacingSpot || isShowingForm || isSearchOpen)
				return;
			setLongPressMarker(location);
		},
		[navigation.isActive, isPlacingSpot, isShowingForm, isSearchOpen]
	);

	const canUseSearch =
		!navigation.isActive &&
		!isPlacingSpot &&
		!isShowingForm &&
		!showEmbarquerSheet &&
		!selectedSpot &&
		!showCompletionSheet;

	const handleMapPress = useCallback(() => {
		if (searchDestination) {
			setSearchDestination(null);
		}
	}, [searchDestination]);

	const handleSearchToggle = useCallback(() => {
		if (!canUseSearch) return;
		setIsSearchOpen(prev => !prev);
		if (isSearchOpen) {
			Keyboard.dismiss();
		}
	}, [canUseSearch, isSearchOpen]);

	useFocusEffect(
		useCallback(() => {
			if (Platform.OS !== 'android') {
				return undefined;
			}

			const onBackPress = () => {
				if (!isSearchOpen) return false;
				setIsSearchOpen(false);
				Keyboard.dismiss();
				return true;
			};

			const subscription = BackHandler.addEventListener(
				'hardwareBackPress',
				onBackPress
			);
			return () => subscription.remove();
		}, [isSearchOpen])
	);

	const handleSearchTextChange = useCallback(
		(text: string) => {
			setSearchText(text);
			if (searchDestination && text !== searchDestination.name) {
				setSearchDestination(null);
			}
		},
		[searchDestination]
	);

	const handleSearchLocationSelected = useCallback(
		(location: Location, name: string) => {
			setSearchDestination({ location, name });
			setSearchText(name);

			const region: MapRegion = {
				latitude: location.latitude,
				longitude: location.longitude,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
			};

			mapViewRef.current?.animateToRegion(region, 1000);
			logger.navigation.info(`Search destination set: ${name}`);
		},
		[]
	);

	const handleSearchEmbarquer = useCallback(() => {
		if (!searchDestination) return;
		setEmbarquerDestination(searchDestination);
		setShowEmbarquerSheet(true);
		setIsSearchOpen(false);
		Keyboard.dismiss();
	}, [searchDestination]);

	const handleLongPressEmbarquer = useCallback(() => {
		if (!longPressMarker) return;
		setEmbarquerOrigin({
			location: longPressMarker,
			name: 'Position sélectionnée',
		});
		setShowEmbarquerSheet(true);
		setLongPressMarker(null);
	}, [longPressMarker]);

	const handleSpotEmbarquer = useCallback(
		(spot: NonNullable<typeof selectedSpot>) => {
			deselectSpot();
			setEmbarquerOrigin({
				location: spot.coordinates,
				name: spot.roadName,
			});
			setShowEmbarquerSheet(true);
		},
		[deselectSpot]
	);

	const handleEmbarquerStart = useCallback(
		async (
			start: { location: Location; name: string },
			destination: { location: Location; name: string }
		) => {
			setShowEmbarquerSheet(false);
			setEmbarquerOrigin(null);
			setEmbarquerDestination(null);

			const result = await startNavigationWithRoute(
				start.location,
				destination.location,
				destination.name
			);

			if (!result.success) {
				toastUtils.error('Erreur', result.message);
				return;
			}

			const journeyStarted = await startRecording();
			if (journeyStarted) {
				setJourneyStartTime(new Date());
				logger.navigation.info('Journey recording started with custom route');
			}
		},
		[startNavigationWithRoute, startRecording]
	);

	const handleEmbarquerClose = useCallback(() => {
		setShowEmbarquerSheet(false);
		setEmbarquerOrigin(null);
		setEmbarquerDestination(null);
	}, []);

	const onConfirmSpotPlacement = useCallback(() => {
		confirmSpotPlacement(mapRegion);
	}, [confirmSpotPlacement, mapRegion]);

	// Fit map to route after navigation starts
	useEffect(() => {
		if (navigation.isActive && navigation.route) {
			const routeBounds = polylineToRegion(navigation.route.polyline);
			mapViewRef.current?.animateToRegion(routeBounds, 1000);
		}
	}, [navigation.isActive, navigation.route]);

	const endNavigationSession = useCallback(
		async ({
			hideCompletionSheet = true,
			resetJourneyStart = true,
		}: {
			hideCompletionSheet?: boolean;
			resetJourneyStart?: boolean;
		} = {}) => {
			if (hideCompletionSheet) {
				setShowCompletionSheet(false);
			}

			stopNavigation();

			if (isRecording) {
				await stopRecording();
			}

			if (resetJourneyStart) {
				setJourneyStartTime(null);
			}
		},
		[isRecording, stopNavigation, stopRecording]
	);

	const handleStopNavigation = useCallback(async () => {
		await endNavigationSession({ hideCompletionSheet: false });
		logger.navigation.info('Navigation and journey recording stopped');
	}, [endNavigationSession]);

	const handleSaveJourney = useCallback(async () => {
		await endNavigationSession();
		toastUtils.success('Voyage sauvegardé', 'Votre voyage a été enregistré');
	}, [endNavigationSession]);

	const handleDiscardJourney = useCallback(async () => {
		await endNavigationSession();
	}, [endNavigationSession]);

	// During navigation: show all spots on route (from navigation context, independent of zoom)
	// Outside navigation: show spots from viewport (respects zoom level)
	const visibleSpots = useMemo(
		() =>
			navigation.isActive
				? navigation.spotsOnRoute.map(({ spot }) => ({
						id: spot.id as string,
						coordinates: spot.coordinates,
						title: spot.roadName,
						description: `${spot.appreciation} - ${spot.direction}`,
					}))
				: spots,
		[navigation.isActive, navigation.spotsOnRoute, spots]
	);

	// Calculate journey duration
	const journeyDurationMinutes = journeyStartTime
		? Math.round((Date.now() - journeyStartTime.getTime()) / 60000)
		: 0;

	const shouldShowBottomBar =
		!navigation.isActive &&
		!isPlacingSpot &&
		!isShowingForm &&
		!showEmbarquerSheet &&
		!selectedSpot &&
		!showCompletionSheet;

	const shouldShowSearchEmbarquer =
		!!searchDestination && !navigation.isActive && !showEmbarquerSheet;

	useEffect(() => {
		if (!canUseSearch && isSearchOpen) {
			setIsSearchOpen(false);
		}
	}, [canUseSearch, isSearchOpen]);

	type HomeTabId = 'home' | 'search' | 'add' | 'history' | 'profile';
	const handleTabPress = useCallback(
		(tabId: HomeTabId) => {
			switch (tabId) {
				case 'add':
					startPlacingSpot();
					break;
				case 'search':
					handleSearchToggle();
					break;
				case 'home':
				case 'history':
				case 'profile':
					// Mock tabs - not wired yet
					break;
			}
		},
		[startPlacingSpot, handleSearchToggle]
	);

	const handleHeadingChange = useCallback((heading: number) => {
		setMapHeading(heading);
	}, []);

	const handleResetHeading = useCallback(() => {
		mapViewRef.current?.animateToBearing(0);
		setMapHeading(0);
	}, []);

	const handleLocateUser = useCallback(() => {
		if (!userLocation) return;

		const region: MapRegion = {
			latitude: userLocation.latitude,
			longitude: userLocation.longitude,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01,
		};

		mapViewRef.current?.animateToRegion(region, 500);
		setIsFollowingUser(true);

		if (followUserTimeoutRef.current) {
			clearTimeout(followUserTimeoutRef.current);
		}

		// Reset following state after user moves the map
		followUserTimeoutRef.current = setTimeout(() => {
			setIsFollowingUser(false);
			followUserTimeoutRef.current = null;
		}, 3000);
	}, [userLocation]);

	useEffect(() => {
		return () => {
			if (followUserTimeoutRef.current) {
				clearTimeout(followUserTimeoutRef.current);
			}
		};
	}, []);

	return (
		<View style={styles.container}>
			<View style={styles.mapContainer}>
				{locationLoading ? (
					<LoadingSpinner message="Getting your location..." />
				) : (
					<>
						<MapViewComponent
							ref={mapViewRef}
							initialRegion={currentRegion}
							markers={visibleSpots}
							onRegionChange={handleRegionChange}
							onHeadingChange={handleHeadingChange}
							onMarkerPress={handleMarkerPress}
							onLongPress={handleLongPress}
							onPress={handleMapPress}
						>
							{/* Destination marker (before navigation starts) */}
							{navigation.destinationMarker && (
								<DestinationMarker
									location={navigation.destinationMarker.location}
									name={navigation.destinationMarker.name}
								/>
							)}

							{/* Search marker */}
							{searchDestination &&
								!navigation.isActive &&
								!showEmbarquerSheet && (
									<Marker
										coordinate={searchDestination.location}
										pinColor={COLORS.error}
										tracksViewChanges={false}
									/>
								)}

							{/* Route polyline (during navigation) */}
							{navigation.route && <RoutePolyline route={navigation.route} />}

							{/* Long press marker */}
							{longPressMarker && (
								<Marker coordinate={longPressMarker} tracksViewChanges={false}>
									<View style={styles.longPressPin} />
								</Marker>
							)}
						</MapViewComponent>

						{isPlacingSpot && (
							<View style={styles.centerMarker}>
								<View style={styles.markerPin} />
							</View>
						)}
					</>
				)}
			</View>

			<HomeFixedOverlay
				isNavigationActive={navigation.isActive}
				navigationRoute={navigation.route}
				canUseSearch={canUseSearch}
				isSearchOpen={isSearchOpen}
				searchText={searchText}
				shouldShowSearchEmbarquer={shouldShowSearchEmbarquer}
				isPlacingSpot={isPlacingSpot}
				isShowingForm={isShowingForm}
				mapHeading={mapHeading}
				isFollowingUser={isFollowingUser}
				shouldShowBottomBar={shouldShowBottomBar}
				longPressMarker={longPressMarker}
				onStopNavigation={handleStopNavigation}
				onSearchTextChange={handleSearchTextChange}
				onSearchLocationSelected={handleSearchLocationSelected}
				onSearchToggle={handleSearchToggle}
				onSearchEmbarquer={handleSearchEmbarquer}
				onResetHeading={handleResetHeading}
				onLocateUser={handleLocateUser}
				onLongPressEmbarquer={handleLongPressEmbarquer}
				onTabPress={handleTabPress}
			/>

			<HomeSheetsOverlay
				isPlacingSpot={isPlacingSpot}
				isShowingForm={isShowingForm}
				selectedSpot={selectedSpot}
				showEmbarquerSheet={showEmbarquerSheet}
				showCompletionSheet={showCompletionSheet}
				navigationRoute={navigation.route}
				navigationSpotsOnRoute={navigation.spotsOnRoute}
				journeyDurationMinutes={journeyDurationMinutes}
				embarquerOrigin={embarquerOrigin}
				embarquerDestination={embarquerDestination}
				onConfirmSpotPlacement={onConfirmSpotPlacement}
				onCancelSpotPlacement={cancelSpotPlacement}
				onSubmitSpotForm={submitSpotForm}
				onCancelSpotForm={cancelSpotForm}
				onCloseSpotDetails={deselectSpot}
				onSpotEmbarquer={handleSpotEmbarquer}
				onEmbarquerStart={handleEmbarquerStart}
				onEmbarquerClose={handleEmbarquerClose}
				onSaveJourney={handleSaveJourney}
				onDiscardJourney={handleDiscardJourney}
			/>
		</View>
	);
};

const HomeScreen: React.FC = () => {
	const [bounds, setBounds] = useState<MapBounds | null>(null);
	const [zoomLevel, setZoomLevel] = useState<number>(0);

	const handleRegionChange = (region: MapRegion) => {
		setBounds(regionToBounds(region));
		setZoomLevel(calculateZoomLevel(region));
	};

	const content = (
		<SpotProvider bounds={bounds} zoomLevel={zoomLevel}>
			<HomeScreenContent onRegionChange={handleRegionChange} />
		</SpotProvider>
	);

	// Wrap with both JourneyProvider and NavigationProvider
	return (
		<JourneyProvider>
			<NavigationProvider>{content}</NavigationProvider>
		</JourneyProvider>
	);
};

export default HomeScreen;
