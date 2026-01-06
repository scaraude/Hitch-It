import type React from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
	ActionButtons,
	Header,
	LoadingSpinner,
	MapViewComponent,
} from '../components';
import { COLORS } from '../constants';
import { useLocation } from '../hooks';
import { JourneyControls, NavigationBar } from '../journey/components';
import {
	CreateSpotButton,
	SpotDetailsSheet,
	SpotForm,
} from '../spot/components';
import { SpotProvider, useSpotContext } from '../spot/context';
import type { MapBounds, MapRegion } from '../types';
import { calculateZoomLevel, regionToBounds } from '../utils';

const FEATURE_JOURNEY_ENABLED = false;

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

	return (
		<SafeAreaView style={styles.container}>
			<Header title="Hitch It" />

			<View style={styles.mapContainer}>
				{locationLoading ? (
					<LoadingSpinner message="Getting your location..." />
				) : (
					<>
						<MapViewComponent
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
			</View>

			{FEATURE_JOURNEY_ENABLED && (
				<>
					{' '}
					<NavigationBar />
					<JourneyControls />
				</>
			)}

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

	return (
		<SpotProvider bounds={bounds} zoomLevel={zoomLevel}>
			<HomeScreenContent onRegionChange={handleRegionChange} />
		</SpotProvider>
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
