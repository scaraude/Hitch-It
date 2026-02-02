import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
	ActionButtons,
	Header,
	LoadingSpinner,
	MapSearchBar,
	MapViewComponent,
	type MapViewRef,
} from '../components';
import { toastUtils } from '../components/ui';
import { COLORS } from '../constants';
import { useLocation } from '../hooks';
import { JourneyProvider, useJourney } from '../journey/context';
import {
	DestinationMarker,
	EmbarquerSheet,
	NavigationCompleteSheet,
	NavigationHeader,
	RoutePolyline,
	StartNavigationButton,
} from '../navigation/components';
import {
	NavigationProvider,
	useNavigation,
} from '../navigation/context/NavigationContext';
import { useArrivalDetection } from '../navigation/hooks';
import {
	CreateSpotButton,
	SpotDetailsSheet,
	SpotForm,
} from '../spot/components';
import { SpotProvider, useSpotContext } from '../spot/context';
import type { Location, MapBounds, MapRegion } from '../types';
import { calculateZoomLevel, logger, polylineToRegion, regionToBounds } from '../utils';

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
		deselectSpot,
	} = useSpotContext();

	const {
		navigation,
		setDestination,
		startNavigation,
		startNavigationWithRoute,
		stopNavigation,
	} = useNavigation();

	const { startRecording, stopRecording, isRecording } = useJourney();

	const [mapRegion, setMapRegion] = useState<MapRegion>(currentRegion);
	const [isNavigationLoading, setIsNavigationLoading] = useState(false);
	const [showCompletionSheet, setShowCompletionSheet] = useState(false);
	const [journeyStartTime, setJourneyStartTime] = useState<Date | null>(null);
	const [longPressMarker, setLongPressMarker] = useState<Location | null>(null);
	const [showEmbarquerSheet, setShowEmbarquerSheet] = useState(false);
	const [embarquerOrigin, setEmbarquerOrigin] = useState<{
		location: Location;
		name: string;
	} | null>(null);

	const mapViewRef = useRef<MapViewRef>(null);

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
			selectSpot(markerId);
		},
		[selectSpot]
	);

	const handleLongPress = useCallback(
		(location: Location) => {
			// Don't allow long press during navigation or spot placement
			if (navigation.isActive || isPlacingSpot || isShowingForm) return;
			setLongPressMarker(location);
		},
		[navigation.isActive, isPlacingSpot, isShowingForm]
	);

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
		(spot: typeof selectedSpot) => {
			if (!spot) return;
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
			setIsNavigationLoading(true);

			const result = await startNavigationWithRoute(
				start.location,
				destination.location,
				destination.name
			);

			if (!result.success) {
				setIsNavigationLoading(false);
				toastUtils.error('Erreur', result.message);
				return;
			}

			const journeyStarted = await startRecording();
			if (journeyStarted) {
				setJourneyStartTime(new Date());
				logger.navigation.info('Journey recording started with custom route');
			}

			setIsNavigationLoading(false);
		},
		[startNavigationWithRoute, startRecording]
	);

	const handleEmbarquerClose = useCallback(() => {
		setShowEmbarquerSheet(false);
		setEmbarquerOrigin(null);
	}, []);

	const onConfirmSpotPlacement = useCallback(() => {
		confirmSpotPlacement(mapRegion);
	}, [confirmSpotPlacement, mapRegion]);

	const handleLocationSelected = useCallback(
		(location: Location, name: string) => {
		// Set destination marker
			setDestination(location, name);

		// Animate map to show destination
			const region: MapRegion = {
				latitude: location.latitude,
				longitude: location.longitude,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
			};

			mapViewRef.current?.animateToRegion(region, 1000);
			logger.navigation.info(`Destination set: ${name}`);
		},
		[setDestination]
	);

	const handleStartNavigation = useCallback(async () => {
		if (!userLocation) {
			toastUtils.error(
				'Position inconnue',
				'Impossible de démarrer la navigation'
			);
			return;
		}

		setIsNavigationLoading(true);

		const result = await startNavigation(userLocation);

		if (!result.success) {
			setIsNavigationLoading(false);
			toastUtils.error('Erreur', result.message);
			return;
		}

		// Start journey recording in background
		const journeyStarted = await startRecording();
		if (journeyStarted) {
			setJourneyStartTime(new Date());
			logger.navigation.info('Journey recording started with navigation');
		}

		setIsNavigationLoading(false);
	}, [startNavigation, startRecording, userLocation]);

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
		}: { hideCompletionSheet?: boolean; resetJourneyStart?: boolean } = {}) => {
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

	const showCreateSpotButton =
		!isPlacingSpot &&
		!isShowingForm &&
		!navigation.isActive &&
		!navigation.destinationMarker &&
		!longPressMarker &&
		!showEmbarquerSheet;

	return (
		<SafeAreaView style={styles.container} edges={['left', 'right']}>
			{/* Navigation header (only when active) */}
			{navigation.isActive && navigation.route && (
				<NavigationHeader
					destinationName={navigation.route.destinationName}
					distanceKm={navigation.route.distanceKm}
					onStop={handleStopNavigation}
				/>
			)}

			{/* Regular header (only when not navigating) */}
			{!navigation.isActive && <Header title="Hitch It" />}

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
							onMarkerPress={handleMarkerPress}
							onLongPress={handleLongPress}
						>
							{/* Destination marker (before navigation starts) */}
							{navigation.destinationMarker && (
								<DestinationMarker
									location={navigation.destinationMarker.location}
									name={navigation.destinationMarker.name}
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

				{/* Search bar (hidden during navigation) */}
				{!navigation.isActive && (
					<MapSearchBar onLocationSelected={handleLocationSelected} />
				)}

				{/* Start navigation button (when destination is set) */}
				{navigation.destinationMarker && !navigation.isActive && (
					<StartNavigationButton
						onPress={handleStartNavigation}
						isLoading={isNavigationLoading}
					/>
				)}

				{/* Long press embarquer button */}
				{longPressMarker && !navigation.isActive && (
					<Pressable
						style={({ pressed }) => [
							styles.longPressEmbarquerButton,
							pressed && styles.longPressEmbarquerButtonPressed,
						]}
						onPress={handleLongPressEmbarquer}
					>
						<Text style={styles.longPressEmbarquerButtonText}>Embarquer</Text>
					</Pressable>
				)}
			</View>

			{isPlacingSpot ? (
				<ActionButtons
					onConfirm={onConfirmSpotPlacement}
					onCancel={cancelSpotPlacement}
				/>
			) : showCreateSpotButton ? (
				<CreateSpotButton onPress={startPlacingSpot} />
			) : null}

			{isShowingForm && (
				<SpotForm onSubmit={submitSpotForm} onCancel={cancelSpotForm} />
			)}

			{selectedSpot && !isShowingForm && (
				<SpotDetailsSheet
					spot={selectedSpot}
					onClose={deselectSpot}
					onEmbarquer={handleSpotEmbarquer}
				/>
			)}

			{/* Embarquer sheet */}
			{showEmbarquerSheet && (
				<EmbarquerSheet
					initialStart={embarquerOrigin ?? undefined}
					onStart={handleEmbarquerStart}
					onClose={handleEmbarquerClose}
				/>
			)}

			{/* Navigation complete sheet */}
			{showCompletionSheet && navigation.route && (
				<NavigationCompleteSheet
					route={navigation.route}
					spotsUsed={navigation.spotsOnRoute}
					durationMinutes={journeyDurationMinutes}
					onSave={handleSaveJourney}
					onDiscard={handleDiscardJourney}
				/>
			)}

			<Toast />
		</SafeAreaView>
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	mapContainer: {
		flex: 1,
	},
	centerMarker: {
		position: 'absolute',
		left: '50%',
		top: '50%',
		marginLeft: -9,
		marginTop: -9,
		alignItems: 'center',
	},
	markerPin: {
		width: 18,
		height: 18,
		backgroundColor: COLORS.secondary,
		borderRadius: 12,
		borderWidth: 3,
		borderColor: COLORS.background,
	},
	longPressPin: {
		width: 24,
		height: 24,
		backgroundColor: COLORS.primary,
		borderRadius: 12,
		borderWidth: 3,
		borderColor: COLORS.background,
	},
	longPressEmbarquerButton: {
		position: 'absolute',
		bottom: 20,
		left: 16,
		right: 16,
		backgroundColor: COLORS.primary,
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
	},
	longPressEmbarquerButtonPressed: {
		opacity: 0.8,
	},
	longPressEmbarquerButtonText: {
		color: COLORS.background,
		fontSize: 18,
		fontWeight: '700',
	},
});

export default HomeScreen;
