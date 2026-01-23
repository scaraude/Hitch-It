import type React from 'react';
import { useRef, useState } from 'react';
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
import { COLORS, SPACING } from '../constants';
import { useLocation } from '../hooks';
import {
	ActiveJourneyIndicator,
	JourneyRecordingButton,
	MarkStopButton,
} from '../journey/components';
import { JourneyProvider } from '../journey/context';
import {
	CreateSpotButton,
	SpotDetailsSheet,
	SpotForm,
} from '../spot/components';
import { SpotProvider, useSpotContext } from '../spot/context';
import type { Location, MapBounds, MapRegion } from '../types';
import { calculateZoomLevel, logger, regionToBounds } from '../utils';

const FEATURE_JOURNEY_ENABLED = true;

interface HomeScreenContentProps {
	onRegionChange: (region: MapRegion) => void;
}

const HomeScreenContent: React.FC<HomeScreenContentProps> = ({
	onRegionChange,
}) => {
	const { currentRegion, locationLoading } = useLocation();
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
	const [mapRegion, setMapRegion] = useState<MapRegion>(currentRegion);
	const mapViewRef = useRef<MapViewRef>(null);

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
		const region: MapRegion = {
			latitude: location.latitude,
			longitude: location.longitude,
			latitudeDelta: 0.05,
			longitudeDelta: 0.05,
		};

		mapViewRef.current?.animateToRegion(region, 1000);
		logger.navigation.info(`Map navigated to ${name}`);
	};

	return (
		<SafeAreaView style={styles.container}>
			<Header title="Hitch It" />

			<View style={styles.mapContainer}>
				{locationLoading ? (
					<LoadingSpinner message="Getting your location..." />
				) : (
					<>
						<MapViewComponent
							ref={mapViewRef}
							initialRegion={currentRegion}
							markers={spots}
							onRegionChange={handleRegionChange}
							onMarkerPress={handleMarkerPress}
						/>
						{isPlacingSpot && (
							<View style={styles.centerMarker}>
								<View style={styles.markerPin} />
							</View>
						)}
					</>
				)}

				<MapSearchBar onLocationSelected={handleLocationSelected} />

				{FEATURE_JOURNEY_ENABLED && (
					<View style={styles.journeyOverlay}>
						<View style={styles.journeyTopRow}>
							<ActiveJourneyIndicator />
							<MarkStopButton />
						</View>
						<View style={styles.journeyBottomRow}>
							<JourneyRecordingButton />
						</View>
					</View>
				)}
			</View>

			{isPlacingSpot ? (
				<ActionButtons
					onConfirm={onConfirmSpotPlacement}
					onCancel={cancelSpotPlacement}
				/>
			) : !isShowingForm ? (
				<CreateSpotButton onPress={startPlacingSpot} />
			) : null}

			{isShowingForm && (
				<SpotForm onSubmit={submitSpotForm} onCancel={cancelSpotForm} />
			)}

			{selectedSpot && !isShowingForm && (
				<SpotDetailsSheet spot={selectedSpot} onClose={deselectSpot} />
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

	if (FEATURE_JOURNEY_ENABLED) {
		return <JourneyProvider>{content}</JourneyProvider>;
	}

	return content;
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
	journeyOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		pointerEvents: 'box-none',
		zIndex: 500,
	},
	journeyTopRow: {
		position: 'absolute',
		top: SPACING.md,
		left: SPACING.md,
		right: SPACING.md,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		pointerEvents: 'box-none',
	},
	journeyBottomRow: {
		position: 'absolute',
		bottom: SPACING.xxl,
		left: 0,
		right: 0,
		alignItems: 'center',
		pointerEvents: 'box-none',
	},
});

export default HomeScreen;
