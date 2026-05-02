import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { COLORS, SIZES, SPACING } from '../../constants';
import { useTranslation } from '../../i18n/useTranslation';
import type { Journey } from '../types';
import {
	formatDistance,
	formatDuration,
} from '../utils/journeyDetailViewModel';

interface JourneyCardProps {
	journey: Journey;
	onPress: () => void;
}

export function JourneyCard({ journey, onPress }: JourneyCardProps) {
	const { t } = useTranslation();
	const title = journey.title || t('journey.defaultTitle');
	const distance = formatDistance(journey.totalDistanceKm);
	const duration = formatDuration(journey.startedAt, journey.endedAt);
	const stopCount = journey.stops.length;
	const stopCountLabel =
		stopCount > 1
			? t('journey.stopCountLabelPlural', { count: stopCount })
			: t('journey.stopCountLabel', { count: stopCount });
	const routePolylinePoints = journey.routePolyline ?? [];
	const stopPoints = journey.stops;
	const mapPoints =
		routePolylinePoints.length > 1 ? routePolylinePoints : stopPoints;

	// Extract map region from points (if available)
	const hasPoints = mapPoints.length > 0;
	const mapRegion = hasPoints
		? {
				latitude: mapPoints[0].latitude,
				longitude: mapPoints[0].longitude,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
			}
		: undefined;

	const startPoint =
		stopPoints.length > 0 ? stopPoints[0] : (mapPoints[0] ?? null);
	const endPoint =
		stopPoints.length > 0
			? stopPoints[stopPoints.length - 1]
			: mapPoints.length > 0
				? mapPoints[mapPoints.length - 1]
				: null;

	return (
		<Pressable
			style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
			onPress={onPress}
		>
			<View style={styles.mapContainer}>
				{mapRegion && (
					<MapView
						style={styles.map}
						provider={PROVIDER_DEFAULT}
						region={mapRegion}
						scrollEnabled={false}
						zoomEnabled={false}
						rotateEnabled={false}
						pitchEnabled={false}
						pointerEvents="none"
					>
						{startPoint && (
							<Marker
								coordinate={{
									latitude: startPoint.latitude,
									longitude: startPoint.longitude,
								}}
								pinColor={COLORS.secondary}
							/>
						)}
						{endPoint && (
							<Marker
								coordinate={{
									latitude: endPoint.latitude,
									longitude: endPoint.longitude,
								}}
								pinColor={COLORS.error}
							/>
						)}
						{mapPoints.length > 1 && (
							<Polyline
								coordinates={mapPoints.map(p => ({
									latitude: p.latitude,
									longitude: p.longitude,
								}))}
								strokeColor={COLORS.primary}
								strokeWidth={3}
							/>
						)}
					</MapView>
				)}
				{!hasPoints && (
					<View style={styles.noMapPlaceholder}>
						<Ionicons
							name="map-outline"
							size={32}
							color={COLORS.textSecondary}
						/>
					</View>
				)}
			</View>

			<View style={styles.info}>
				<Text style={styles.title} numberOfLines={1}>
					{title}
				</Text>
				<Text style={styles.details}>
					{distance} - {stopCountLabel} - {duration}
				</Text>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: COLORS.background,
		borderRadius: SIZES.radiusMedium,
		overflow: 'hidden',
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	cardPressed: {
		opacity: 0.8,
	},
	mapContainer: {
		height: 140,
		backgroundColor: COLORS.surface,
	},
	map: {
		flex: 1,
	},
	noMapPlaceholder: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	info: {
		padding: SPACING.md,
		backgroundColor: COLORS.background,
	},
	title: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: SPACING.xs,
	},
	details: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
	},
});
