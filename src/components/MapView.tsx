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
}

interface MapViewComponentProps {
	initialRegion?: MapRegion;
	markers?: SpotMarkerData[];
	onRegionChange?: (region: Region) => void;
	onMarkerPress?: (markerId: string) => void;
	onLongPress?: (location: Location) => void;
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
			onMarkerPress,
			onLongPress,
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

		const handleLongPress = useCallback(
			(e: { nativeEvent: { coordinate: Location } }) => {
				onLongPress?.(e.nativeEvent.coordinate);
			},
			[onLongPress]
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
				onLongPress={handleLongPress}
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
