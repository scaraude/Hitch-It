import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { calculateZoomLevel, logger, regionToBounds } from '../utils';

interface HomeScreenContentProps {
	onRegionChange: (region: MapRegion) => void;
}

/**
 * Calculate map bounds that fit the entire route
 */
function calculateRouteBounds(
	polyline: Array<{ latitude: number; longitude: number }>
): MapRegion {
	if (polyline.length === 0) {
		return {
			latitude: 0,
			longitude: 0,
			latitudeDelta: 0.1,
			longitudeDelta: 0.1,
		};
	}

	let minLat = polyline[0].latitude;
	let maxLat = polyline[0].latitude;
	let minLng = polyline[0].longitude;
	let maxLng = polyline[0].longitude;

	for (const point of polyline) {
		minLat = Math.min(minLat, point.latitude);
		maxLat = Math.max(maxLat, point.latitude);
		minLng = Math.min(minLng, point.longitude);
		maxLng = Math.max(maxLng, point.longitude);
	}

	const latDelta = (maxLat - minLat) * 1.3; // Add 30% padding
	const lngDelta = (maxLng - minLng) * 1.3;

	return {
		latitude: (minLat + maxLat) / 2,
		longitude: (minLng + maxLng) / 2,
		latitudeDelta: Math.max(latDelta, 0.01),
		longitudeDelta: Math.max(lngDelta, 0.01),
	};
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

	const { navigation, setDestination, startNavigation, stopNavigation } =
		useNavigation();

	const { startRecording, stopRecording, isRecording } = useJourney();

	const [mapRegion, setMapRegion] = useState<MapRegion>(currentRegion);
	const [isNavigationLoading, setIsNavigationLoading] = useState(false);
	const [showCompletionSheet, setShowCompletionSheet] = useState(false);
	const [journeyStartTime, setJourneyStartTime] = useState<Date | null>(null);

	const mapViewRef = useRef<MapViewRef>(null);

	// Arrival detection
	const { hasArrived } = useArrivalDetection(navigation.route, userLocation);

	// Handle arrival
	useEffect(() => {
		if (hasArrived && navigation.isActive) {
			setShowCompletionSheet(true);
		}
	}, [hasArrived, navigation.isActive]);

	const handleRegionChange = (region: MapRegion) => {
		setMapRegion(region);
		onRegionChange(region);
	};

	const handleMarkerPress = (markerId: string) => {
		selectSpot(markerId);
	};

	const onConfirmSpotPlacement = () => {
		confirmSpotPlacement(mapRegion);
	};

	const handleLocationSelected = (location: Location, name: string) => {
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
	};

	const handleStartNavigation = async () => {
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
	};

	// Fit map to route after navigation starts
	useEffect(() => {
		if (navigation.isActive && navigation.route) {
			const routeBounds = calculateRouteBounds(navigation.route.polyline);
			mapViewRef.current?.animateToRegion(routeBounds, 1000);
		}
	}, [navigation.isActive, navigation.route]);

	const handleStopNavigation = async () => {
		stopNavigation();

		if (isRecording) {
			await stopRecording();
			setJourneyStartTime(null);
		}

		logger.navigation.info('Navigation and journey recording stopped');
	};

	const handleSaveJourney = async () => {
		setShowCompletionSheet(false);
		stopNavigation();

		if (isRecording) {
			await stopRecording();
		}

		toastUtils.success('Voyage sauvegardé', 'Votre voyage a été enregistré');
		setJourneyStartTime(null);
	};

	const handleDiscardJourney = async () => {
		setShowCompletionSheet(false);
		stopNavigation();

		if (isRecording) {
			await stopRecording();
		}

		setJourneyStartTime(null);
	};

	// During navigation: show all spots on route (from navigation context, independent of zoom)
	// Outside navigation: show spots from viewport (respects zoom level)
	const visibleSpots = navigation.isActive
		? navigation.spotsOnRoute.map(({ spot }) => ({
				id: spot.id as string,
				coordinates: spot.coordinates,
				title: spot.roadName,
				description: `${spot.appreciation} - ${spot.direction}`,
			}))
		: spots;

	// Calculate journey duration
	const journeyDurationMinutes = journeyStartTime
		? Math.round((Date.now() - journeyStartTime.getTime()) / 60000)
		: 0;

	const showCreateSpotButton =
		!isPlacingSpot &&
		!isShowingForm &&
		!navigation.isActive &&
		!navigation.destinationMarker;

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
				<SpotDetailsSheet spot={selectedSpot} onClose={deselectSpot} />
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
});

export default HomeScreen;
