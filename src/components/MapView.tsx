import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { MAP_CONFIG } from '../constants';
import type { SpotMarkerData } from '../spot/types';
import type { MapRegion } from '../types';

export interface MapViewRef {
	animateToRegion(region: MapRegion, duration?: number): void;
	getCurrentRegion(): MapRegion | undefined;
}

interface MapViewComponentProps {
	initialRegion?: MapRegion;
	markers?: SpotMarkerData[];
	onRegionChange?: (region: Region) => void;
	onMarkerPress?: (markerId: string) => void;
	showUserLocation?: boolean;
	followUserLocation?: boolean;
}

const MapViewComponent = forwardRef<MapViewRef, MapViewComponentProps>(
	(
		{
			initialRegion = MAP_CONFIG.defaultRegion,
			markers = [],
			onRegionChange,
			onMarkerPress,
			showUserLocation = true,
			followUserLocation = false,
		},
		ref
	) => {
		const mapRef = useRef<MapView>(null);
		const [currentRegion, setCurrentRegion] = useState<MapRegion | undefined>(
			initialRegion
		);

		useImperativeHandle(ref, () => ({
			animateToRegion: (region: MapRegion, duration = 1000) => {
				mapRef.current?.animateToRegion(region, duration);
				setCurrentRegion(region);
			},
			getCurrentRegion: () => currentRegion,
		}));

		const handleRegionChangeComplete = useCallback(
			(newRegion: Region) => {
				setCurrentRegion(newRegion);
				onRegionChange?.(newRegion);
			},
			[onRegionChange]
		);

		const handleMarkerPress = useCallback(
			(markerId: string) => {
				onMarkerPress?.(markerId);
			},
			[onMarkerPress]
		);

		return (
			<MapView
				ref={mapRef}
				style={styles.map}
				initialRegion={initialRegion}
				onRegionChangeComplete={handleRegionChangeComplete}
				showsUserLocation={showUserLocation}
				followsUserLocation={followUserLocation}
				showsMyLocationButton={true}
				showsCompass={true}
				showsScale={true}
				mapType="standard"
				moveOnMarkerPress={false}
				pitchEnabled={true}
				rotateEnabled={true}
				scrollEnabled={true}
				zoomEnabled={true}
				testID="map-view"
			>
				{markers.map(marker => (
					<Marker
						key={marker.id}
						coordinate={marker.coordinates}
						title={marker.title}
						description={marker.description}
						pinColor={marker.color || MAP_CONFIG.defaultMarkerColor}
						tracksViewChanges={false}
						onPress={() => handleMarkerPress(marker.id)}
					/>
				))}
			</MapView>
		);
	}
);

const styles = StyleSheet.create({
	map: {
		flex: 1,
	},
});

export default MapViewComponent;
