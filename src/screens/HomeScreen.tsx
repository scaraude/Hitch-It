import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	BackHandler,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Marker } from 'react-native-maps';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
	ActionButtons,
	AddressInput,
	Header,
	LoadingSpinner,
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
} from '../navigation/components';
import {
	NavigationProvider,
	useNavigation,
} from '../navigation/context/NavigationContext';
import { useArrivalDetection } from '../navigation/hooks';
import { SpotDetailsSheet, SpotForm } from '../spot/components';
import { SpotProvider, useSpotContext } from '../spot/context';
import type { Location, MapBounds, MapRegion } from '../types';
import {
	calculateZoomLevel,
	logger,
	polylineToRegion,
	regionToBounds,
} from '../utils';

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

	const { navigation, startNavigationWithRoute, stopNavigation } =
		useNavigation();

	const { startRecording, stopRecording, isRecording } = useJourney();
	const insets = useSafeAreaInsets();

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
		!showCompletionSheet &&
		!isSearchOpen;

	const shouldShowSearchPanel = isSearchOpen && canUseSearch;
	const shouldShowSearchEmbarquer =
		!!searchDestination && !navigation.isActive && !showEmbarquerSheet;

	useEffect(() => {
		if (!canUseSearch && isSearchOpen) {
			setIsSearchOpen(false);
		}
	}, [canUseSearch, isSearchOpen]);

	return (
		<SafeAreaView
			style={styles.container}
			edges={['top', 'left', 'right', 'bottom']}
		>
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

			<KeyboardAvoidingView
				style={styles.nonMapOverlay}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={insets.bottom}
				pointerEvents="box-none"
			>
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

				{/* Long press embarquer button */}
				{longPressMarker && !navigation.isActive && !isSearchOpen && (
					<Pressable
						style={({ pressed }) => [
							styles.longPressEmbarquerButton,
							{
								bottom: shouldShowBottomBar
									? 110 + insets.bottom
									: 24 + insets.bottom,
							},
							pressed && styles.longPressEmbarquerButtonPressed,
						]}
						onPress={handleLongPressEmbarquer}
					>
						<Text style={styles.longPressEmbarquerButtonText}>Embarquer</Text>
					</Pressable>
				)}

				<View style={styles.bottomOverlay} pointerEvents="box-none">
					{shouldShowSearchPanel && (
						<View style={styles.searchSheet}>
							<AddressInput
								placeholder="Rechercher une destination"
								value={searchText}
								onChangeText={handleSearchTextChange}
								onLocationSelected={handleSearchLocationSelected}
								icon="⌕"
								autoFocus
								showEmptyState
								hapticFeedback
								showTopSuggestionLabel
								suggestionsPlacement="above"
								containerStyle={styles.searchInputContainer}
								inputContainerStyle={styles.searchInputInner}
								suggestionsStyle="dropdown"
								testID="map-search-input"
							/>
							{shouldShowSearchEmbarquer ? (
								<Pressable
									style={({ pressed }) => [
										styles.searchEmbarquerButton,
										pressed && styles.searchEmbarquerButtonPressed,
									]}
									onPress={handleSearchEmbarquer}
								>
									<Text style={styles.searchEmbarquerButtonText}>
										Embarquer
									</Text>
								</Pressable>
							) : null}
						</View>
					)}

					{shouldShowBottomBar && (
						<View
							style={[
								styles.bottomNav,
								{ paddingBottom: Math.max(insets.bottom, 10) },
							]}
						>
							<View style={styles.bottomNavRow}>
								<Pressable
									style={({ pressed }) => [
										styles.bottomNavButton,
										pressed && styles.bottomNavButtonPressed,
									]}
									onPress={startPlacingSpot}
									accessibilityLabel="Ajouter un spot"
									accessibilityRole="button"
									testID="bottom-nav-add-spot"
								>
									<Text style={styles.bottomNavIcon}>＋</Text>
									<Text style={styles.bottomNavLabel}>Spot</Text>
								</Pressable>

								<Pressable
									style={({ pressed }) => [
										styles.bottomNavButton,
										styles.bottomNavSearchButton,
										pressed && styles.bottomNavButtonPressed,
									]}
									onPress={handleSearchToggle}
									accessibilityLabel="Rechercher une destination"
									accessibilityRole="button"
									testID="bottom-nav-search"
								>
									<Text style={styles.bottomNavSearchIcon}>⌕</Text>
									<Text style={styles.bottomNavSearchLabel}>Rechercher</Text>
								</Pressable>
							</View>
						</View>
					)}
				</View>

				{isPlacingSpot ? (
					<ActionButtons
						onConfirm={onConfirmSpotPlacement}
						onCancel={cancelSpotPlacement}
					/>
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
						initialDestination={embarquerDestination ?? undefined}
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
			</KeyboardAvoidingView>
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
	nonMapOverlay: {
		...StyleSheet.absoluteFillObject,
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
		left: 16,
		right: 16,
		backgroundColor: '#0F6A4E',
		paddingVertical: 14,
		borderRadius: 16,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 4,
	},
	longPressEmbarquerButtonPressed: {
		opacity: 0.8,
	},
	longPressEmbarquerButtonText: {
		color: '#F8F6F1',
		fontSize: 16,
		fontWeight: '700',
		letterSpacing: 0.3,
	},
	bottomOverlay: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		paddingHorizontal: 0,
		paddingBottom: 0,
	},
	searchSheet: {
		backgroundColor: '#F7EAD7',
		borderRadius: 20,
		padding: 12,
		borderWidth: 1,
		borderColor: '#E2CDB3',
		shadowColor: '#2D2216',
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.16,
		shadowRadius: 16,
		elevation: 5,
		marginBottom: 10,
		overflow: 'visible',
	},
	searchInputContainer: {
		marginBottom: 6,
	},
	searchInputInner: {
		backgroundColor: '#FDF4E9',
		borderWidth: 1,
		borderColor: '#E7D2B5',
		paddingVertical: 8,
	},
	searchEmbarquerButton: {
		alignSelf: 'flex-end',
		backgroundColor: '#CDAE7C',
		borderRadius: 14,
		paddingVertical: 8,
		paddingHorizontal: 14,
		alignItems: 'center',
		marginTop: 4,
	},
	searchEmbarquerButtonPressed: {
		opacity: 0.85,
	},
	searchEmbarquerButtonText: {
		color: '#2C1D0C',
		fontSize: 12,
		fontWeight: '700',
		letterSpacing: 0.4,
		textTransform: 'uppercase',
	},
	bottomNav: {
		backgroundColor: '#F3E3CD',
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
		paddingTop: 8,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: '#E2CBB0',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'flex-end',
		shadowColor: '#1F160D',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.08,
		shadowRadius: 10,
		elevation: 8,
		width: '100%',
	},
	bottomNavRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
	},
	bottomNavButton: {
		flex: 1,
		borderRadius: 16,
		paddingVertical: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#FAF2E6',
		borderWidth: 1,
		borderColor: '#E3CDB3',
		marginHorizontal: 6,
	},
	bottomNavSearchButton: {
		flex: 1,
		backgroundColor: '#EBCFA9',
		borderColor: '#D8B98D',
	},
	bottomNavButtonPressed: {
		transform: [{ translateY: 1 }],
	},
	bottomNavIcon: {
		fontSize: 22,
		color: '#2B1D0D',
	},
	bottomNavLabel: {
		marginTop: 6,
		fontSize: 11,
		color: '#2B1D0D',
		letterSpacing: 0.5,
		textTransform: 'uppercase',
		fontFamily: Platform.select({
			ios: 'Georgia',
			android: 'serif',
		}),
	},
	bottomNavSearchIcon: {
		fontSize: 20,
		color: '#2B1D0D',
	},
	bottomNavSearchLabel: {
		marginTop: 6,
		fontSize: 11,
		color: '#2B1D0D',
		letterSpacing: 0.5,
		textTransform: 'uppercase',
		fontFamily: Platform.select({
			ios: 'Georgia',
			android: 'serif',
		}),
	},
});

export default HomeScreen;
