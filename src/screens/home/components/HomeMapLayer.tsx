import type React from 'react';
import type { RefObject } from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import {
	LoadingSpinner,
	MapViewComponent,
	type MapViewRef,
} from '../../../components';
import { COLORS } from '../../../constants';
import {
	DestinationMarker,
	RoutePolyline,
} from '../../../navigation/components';
import type { NavigationRoute } from '../../../navigation/types';
import type { SpotMarkerData } from '../../../spot/types';
import type { Location, MapRegion } from '../../../types';
import { homeScreenStyles as styles } from '../homeScreenStyles';
import type { NamedLocation } from '../types';

interface DestinationMarkerData {
	location: Location;
	name: string;
}

interface HomeMapLayerProps {
	locationLoading: boolean;
	currentRegion: MapRegion;
	mapViewRef: RefObject<MapViewRef | null>;
	visibleSpots: SpotMarkerData[];
	navigationRoute: NavigationRoute | null;
	driverRoute: NavigationRoute | null;
	navigationDestinationMarker: DestinationMarkerData | null;
	searchDestination: NamedLocation | null;
	longPressMarker: Location | null;
	isPlacingSpot: boolean;
	showEmbarquerSheet: boolean;
	isNavigationActive: boolean;
	onRegionChange: (region: MapRegion) => void;
	onHeadingChange: (heading: number) => void;
	onMarkerPress: (markerId: string) => void;
	onLongPress: (location: Location) => void;
	onMapPress: (location: Location) => void;
}

export const HomeMapLayer: React.FC<HomeMapLayerProps> = ({
	locationLoading,
	currentRegion,
	mapViewRef,
	visibleSpots,
	navigationRoute,
	driverRoute,
	navigationDestinationMarker,
	searchDestination,
	longPressMarker,
	isPlacingSpot,
	showEmbarquerSheet,
	isNavigationActive,
	onRegionChange,
	onHeadingChange,
	onMarkerPress,
	onLongPress,
	onMapPress,
}) => {
	return (
		<View style={styles.mapContainer}>
			{locationLoading ? (
				<LoadingSpinner message="Getting your location..." />
			) : (
				<>
					<MapViewComponent
						ref={mapViewRef}
						initialRegion={currentRegion}
						markers={visibleSpots}
						onRegionChange={onRegionChange}
						onHeadingChange={onHeadingChange}
						onMarkerPress={onMarkerPress}
						onLongPress={onLongPress}
						onPress={onMapPress}
					>
						{/* Destination marker (before navigation starts) */}
						{navigationDestinationMarker && (
							<DestinationMarker
								location={navigationDestinationMarker.location}
								name={navigationDestinationMarker.name}
							/>
						)}

						{/* Search marker */}
						{searchDestination &&
							!isNavigationActive &&
							!showEmbarquerSheet && (
								<Marker
									coordinate={searchDestination.location}
									pinColor={COLORS.error}
									tracksViewChanges={false}
								/>
							)}

						{/* Driver route polyline (comparison mode) */}
						{driverRoute && (
							<RoutePolyline
								route={driverRoute}
								strokeColor={COLORS.primary}
								strokeWidth={3}
								zIndex={1}
							/>
						)}

						{/* User route polyline (during navigation) */}
						{navigationRoute && (
							<RoutePolyline
								route={navigationRoute}
								strokeColor={COLORS.secondary}
								strokeWidth={5}
								zIndex={2}
							/>
						)}

						{/* Long press marker */}
						{longPressMarker && (
							<Marker
								coordinate={longPressMarker}
								pinColor={COLORS.error}
								tracksViewChanges={false}
							/>
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
	);
};
