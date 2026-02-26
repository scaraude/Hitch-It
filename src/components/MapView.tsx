import type { ReactNode } from 'react';
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
import type { Location, MapRegion } from '../types';

export interface MapViewRef {
	animateToRegion(region: MapRegion, duration?: number): void;
	getCurrentRegion(): MapRegion | undefined;
	animateToBearing(bearing: number, duration?: number): void;
}

interface MapViewComponentProps {
	initialRegion?: MapRegion;
	markers?: SpotMarkerData[];
	onRegionChange?: (region: Region) => void;
	onHeadingChange?: (heading: number) => void;
	onMarkerPress?: (markerId: string) => void;
	onLongPress?: (location: Location) => void;
	onPress?: (location: Location) => void;
	showUserLocation?: boolean;
	followUserLocation?: boolean;
	children?: ReactNode;
}

const MapViewComponent = forwardRef<MapViewRef, MapViewComponentProps>(
	(
		{
			initialRegion = MAP_CONFIG.defaultRegion,
			markers = [],
			onRegionChange,
			onHeadingChange,
			onMarkerPress,
			onLongPress,
			onPress,
			showUserLocation = true,
			followUserLocation = false,
			children,
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
			animateToBearing: (bearing: number, duration = 300) => {
				mapRef.current?.animateCamera({ heading: bearing }, { duration });
			},
		}));

		const handleRegionChangeComplete = useCallback(
			(newRegion: Region) => {
				setCurrentRegion(newRegion);
				onRegionChange?.(newRegion);

				// Get camera to report heading
				mapRef.current?.getCamera().then(camera => {
					if (camera.heading !== undefined) {
						onHeadingChange?.(camera.heading);
					}
				});
			},
			[onRegionChange, onHeadingChange]
		);

		const handleMarkerPress = useCallback(
			(markerId: string) => {
				onMarkerPress?.(markerId);
			},
			[onMarkerPress]
		);

		const handleLongPress = useCallback(
			(e: { nativeEvent: { coordinate: Location } }) => {
				onLongPress?.(e.nativeEvent.coordinate);
			},
			[onLongPress]
		);

		const handlePress = useCallback(
			(e: { nativeEvent: { coordinate: Location } }) => {
				onPress?.(e.nativeEvent.coordinate);
			},
			[onPress]
		);

		return (
			<MapView
				ref={mapRef}
				style={styles.map}
				initialRegion={initialRegion}
				onRegionChangeComplete={handleRegionChangeComplete}
				showsUserLocation={showUserLocation}
				followsUserLocation={followUserLocation}
				showsMyLocationButton={false}
				showsCompass={false}
				showsScale={true}
				mapType="standard"
				moveOnMarkerPress={false}
				pitchEnabled={true}
				rotateEnabled={true}
				scrollEnabled={true}
				zoomEnabled={true}
				testID="map-view"
				onLongPress={handleLongPress}
				onPress={handlePress}
			>
				{markers.map(marker => (
					<Marker
						key={marker.id}
						coordinate={marker.coordinates}
						pinColor={marker.color || MAP_CONFIG.defaultMarkerColor}
						tracksViewChanges={false}
						onPress={() => handleMarkerPress(marker.id)}
					/>
				))}
				{children}
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
