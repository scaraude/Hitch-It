import type React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { LoadingSpinner, MapViewComponent } from '../../../components';
import { COLORS } from '../../../constants';
import {
	DestinationMarker,
	RoutePolyline,
} from '../../../navigation/components';
import { useHomeScreenContext } from '../context/HomeScreenContext';
import { homeScreenStyles as styles } from '../homeScreenStyles';

export const HomeMapLayer: React.FC = () => {
	const {
		mapLayer: {
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
		},
	} = useHomeScreenContext();

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
