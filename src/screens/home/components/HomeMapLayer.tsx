import type React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { LoadingSpinner, MapViewComponent } from '../../../components';
import { COLORS } from '../../../constants';
import { useTranslation } from '../../../i18n';
import {
	DestinationMarker,
	RoutePolyline,
} from '../../../navigation/components';
import { useNavigationProgress } from '../../../navigation/hooks';
import {
	useHomeLocation,
	useHomeMap,
	useHomeMapRef,
	useHomeNav,
	useHomeSearch,
	useHomeSession,
	useHomeSpot,
} from '../context/HomeStateContext';
import { homeScreenStyles as styles } from '../homeScreenStyles';

export const HomeMapLayer: React.FC = () => {
	const { userLocation, currentRegion, locationLoading } = useHomeLocation();
	const mapViewRef = useHomeMapRef();
	const map = useHomeMap();
	const nav = useHomeNav();
	const search = useHomeSearch();
	const session = useHomeSession();
	const spot = useHomeSpot();
	const { t } = useTranslation();

	const { passedRoutePolyline, remainingRoutePolyline } = useNavigationProgress(
		{
			routePolyline: nav.navigation.route?.polyline ?? [],
			initialDistanceKm: nav.navigation.route?.distanceKm ?? 0,
			userLocation,
			spotsOnRoute: nav.navigation.spotsOnRoute,
		}
	);

	return (
		<View style={styles.mapContainer}>
			<MapViewComponent
				ref={mapViewRef}
				initialRegion={currentRegion}
				markers={map.visibleSpots}
				onRegionChange={map.handleRegionChange}
				onHeadingChange={map.handleHeadingChange}
				onMarkerPress={map.handleMarkerPress}
				onLongPress={map.handleLongPress}
				onPress={map.handleMapPress}
			>
				{nav.navigation.destinationMarker && (
					<DestinationMarker
						location={nav.navigation.destinationMarker.location}
						name={nav.navigation.destinationMarker.name}
					/>
				)}

				{search.searchDestination &&
					!nav.navigation.isActive &&
					!session.showNavigationSetupSheet && (
						<Marker
							coordinate={search.searchDestination.location}
							pinColor={COLORS.error}
							tracksViewChanges={false}
						/>
					)}

				{nav.navigation.driverRoute && (
					<RoutePolyline
						route={nav.navigation.driverRoute}
						strokeColor={COLORS.primary}
						strokeWidth={3}
						zIndex={1}
					/>
				)}

				{nav.navigation.route && (
					<>
						<RoutePolyline
							coordinates={passedRoutePolyline}
							strokeColor={COLORS.navigationRoutePassed}
							strokeWidth={5}
							zIndex={2}
						/>
						<RoutePolyline
							coordinates={remainingRoutePolyline}
							strokeColor={COLORS.secondary}
							strokeWidth={5}
							zIndex={3}
						/>
					</>
				)}

				{map.longPressMarker && (
					<Marker
						coordinate={map.longPressMarker}
						pinColor={COLORS.error}
						tracksViewChanges={false}
					/>
				)}
			</MapViewComponent>

			{locationLoading && (
				<View style={styles.locationLoadingOverlay} pointerEvents="none">
					<LoadingSpinner
						variant="inline"
						size="small"
						message={t('map.gettingLocation')}
					/>
				</View>
			)}

			{spot.isPlacingSpot && (
				<View style={styles.centerMarker}>
					<View style={styles.markerPin} />
				</View>
			)}
		</View>
	);
};
