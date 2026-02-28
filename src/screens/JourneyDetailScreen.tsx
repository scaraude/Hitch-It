import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../constants';
import { SIZES } from '../constants/sizes';
import * as journeyRepository from '../journey/services/journeyRepository';
import type { Journey } from '../journey/types';
import { JourneyPointType } from '../journey/types';
import type { RootStackParamList } from '../navigation/types';

type JourneyDetailRouteProp = RouteProp<RootStackParamList, 'JourneyDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatDuration(startedAt: Date, endedAt?: Date): string {
	if (!endedAt) return '—';

	const durationMs = endedAt.getTime() - startedAt.getTime();
	const minutes = Math.floor(durationMs / (1000 * 60));

	if (minutes < 60) {
		return `${minutes}min`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
}

function formatDistance(km?: number): string {
	if (!km) return '—';
	return `${Math.round(km)} km`;
}

export default function JourneyDetailScreen() {
	const navigation = useNavigation<NavigationProp>();
	const route = useRoute<JourneyDetailRouteProp>();
	const { journeyId } = route.params;

	const [journey, setJourney] = useState<Journey | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadJourney = async () => {
			setIsLoading(true);
			try {
				const journeyData = await journeyRepository.getJourneyById(journeyId);
				if (isMounted) {
					setJourney(journeyData);
					setIsLoading(false);
				}
			} catch (err) {
				if (isMounted) {
					setError(
						err instanceof Error ? err : new Error('Failed to load journey')
					);
					setIsLoading(false);
				}
			}
		};

		loadJourney();

		return () => {
			isMounted = false;
		};
	}, [journeyId]);

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.header}>
					<Pressable
						style={styles.backButton}
						onPress={() => navigation.goBack()}
					>
						<Ionicons
							name="arrow-back"
							size={SIZES.iconMd}
							color={COLORS.text}
						/>
					</Pressable>
					<Text style={styles.headerTitle}>Journey Details</Text>
					<View style={styles.headerSpacer} />
				</View>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={COLORS.primary} />
				</View>
			</SafeAreaView>
		);
	}

	if (error || !journey) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.header}>
					<Pressable
						style={styles.backButton}
						onPress={() => navigation.goBack()}
					>
						<Ionicons
							name="arrow-back"
							size={SIZES.iconMd}
							color={COLORS.text}
						/>
					</Pressable>
					<Text style={styles.headerTitle}>Journey Details</Text>
					<View style={styles.headerSpacer} />
				</View>
				<View style={styles.errorContainer}>
					<Ionicons
						name="alert-circle-outline"
						size={64}
						color={COLORS.error}
					/>
					<Text style={styles.errorText}>
						{error?.message ?? 'Journey not found'}
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	const title = journey.title || 'Journey';
	const distance = formatDistance(journey.totalDistanceKm);
	const duration = formatDuration(journey.startedAt, journey.endedAt);
	const stopPoints = journey.points.filter(
		p => p.type === JourneyPointType.Stop
	);
	const carCount = stopPoints.length;

	// Calculate map region to fit all points
	const mapRegion =
		journey.points.length > 0
			? (() => {
					const lats = journey.points.map(p => p.latitude);
					const lngs = journey.points.map(p => p.longitude);
					const minLat = Math.min(...lats);
					const maxLat = Math.max(...lats);
					const minLng = Math.min(...lngs);
					const maxLng = Math.max(...lngs);
					const latDelta = (maxLat - minLat) * 1.3; // Add padding
					const lngDelta = (maxLng - minLng) * 1.3;

					return {
						latitude: (minLat + maxLat) / 2,
						longitude: (minLng + maxLng) / 2,
						latitudeDelta: Math.max(latDelta, 0.01),
						longitudeDelta: Math.max(lngDelta, 0.01),
					};
				})()
			: undefined;

	const startPoint = journey.points.length > 0 ? journey.points[0] : null;
	const endPoint =
		journey.points.length > 0
			? journey.points[journey.points.length - 1]
			: null;

	const polylineCoordinates = journey.points.map(p => ({
		latitude: p.latitude,
		longitude: p.longitude,
	}));

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Pressable
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="arrow-back" size={SIZES.iconMd} color={COLORS.text} />
				</Pressable>
				<Text style={styles.headerTitle}>{title}</Text>
				<View style={styles.headerSpacer} />
			</View>

			<ScrollView style={styles.content}>
				{mapRegion && (
					<View style={styles.mapContainer}>
						<MapView
							style={styles.map}
							provider={PROVIDER_DEFAULT}
							initialRegion={mapRegion}
						>
							{startPoint && (
								<Marker
									coordinate={{
										latitude: startPoint.latitude,
										longitude: startPoint.longitude,
									}}
									pinColor={COLORS.secondary}
									title="Start"
								/>
							)}
							{endPoint && startPoint !== endPoint && (
								<Marker
									coordinate={{
										latitude: endPoint.latitude,
										longitude: endPoint.longitude,
									}}
									pinColor={COLORS.error}
									title="End"
								/>
							)}
							{stopPoints.map(point => (
								<Marker
									key={point.id}
									coordinate={{
										latitude: point.latitude,
										longitude: point.longitude,
									}}
									pinColor={COLORS.primary}
								/>
							))}
							{polylineCoordinates.length > 1 && (
								<Polyline
									coordinates={polylineCoordinates}
									strokeColor={COLORS.primary}
									strokeWidth={3}
								/>
							)}
						</MapView>
					</View>
				)}

				<View style={styles.infoPanel}>
					<View style={styles.statsRow}>
						<View style={styles.statBox}>
							<Ionicons
								name="navigate-outline"
								size={24}
								color={COLORS.primary}
							/>
							<Text style={styles.statValue}>{distance}</Text>
						</View>
						<View style={styles.statBox}>
							<Ionicons name="car-outline" size={24} color={COLORS.primary} />
							<Text style={styles.statValue}>
								{carCount} car{carCount > 1 ? 's' : ''}
							</Text>
						</View>
						<View style={styles.statBox}>
							<Ionicons name="time-outline" size={24} color={COLORS.primary} />
							<Text style={styles.statValue}>{duration}</Text>
						</View>
					</View>

					{stopPoints.length > 0 && (
						<View style={styles.stopsSection}>
							<Text style={styles.stopsTitle}>Stops</Text>
							{stopPoints.map((point, index) => (
								<View key={point.id} style={styles.stopItem}>
									<View style={styles.stopNumber}>
										<Text style={styles.stopNumberText}>{index + 1}</Text>
									</View>
									<View style={styles.stopDetails}>
										<Text style={styles.stopTime}>
											{point.timestamp.toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</Text>
										{point.waitTimeMinutes !== undefined && (
											<Text style={styles.stopWaitTime}>
												Wait: {point.waitTimeMinutes} min
											</Text>
										)}
										{point.notes && (
											<Text style={styles.stopNotes}>{point.notes}</Text>
										)}
									</View>
								</View>
							))}
						</View>
					)}

					{journey.notes && (
						<View style={styles.notesSection}>
							<Text style={styles.notesTitle}>Notes</Text>
							<Text style={styles.notesText}>{journey.notes}</Text>
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		backgroundColor: COLORS.background,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		flex: 1,
		fontSize: SIZES.fontLg,
		fontWeight: '600',
		color: COLORS.text,
		textAlign: 'center',
	},
	headerSpacer: {
		width: 40,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: SPACING.xl,
	},
	errorText: {
		fontSize: SIZES.fontMd,
		color: COLORS.error,
		marginTop: SPACING.md,
		textAlign: 'center',
	},
	content: {
		flex: 1,
	},
	mapContainer: {
		height: 400,
		backgroundColor: COLORS.surface,
	},
	map: {
		flex: 1,
	},
	infoPanel: {
		padding: SPACING.lg,
	},
	statsRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: SPACING.lg,
	},
	statBox: {
		alignItems: 'center',
		gap: SPACING.sm,
	},
	statValue: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
	},
	stopsSection: {
		marginTop: SPACING.lg,
	},
	stopsTitle: {
		fontSize: SIZES.fontLg,
		fontWeight: '700',
		color: COLORS.text,
		marginBottom: SPACING.md,
	},
	stopItem: {
		flexDirection: 'row',
		marginBottom: SPACING.md,
		paddingBottom: SPACING.md,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	stopNumber: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: COLORS.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: SPACING.md,
	},
	stopNumberText: {
		fontSize: SIZES.fontSm,
		fontWeight: '700',
		color: COLORS.textLight,
	},
	stopDetails: {
		flex: 1,
	},
	stopTime: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: SPACING.xs,
	},
	stopWaitTime: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		marginBottom: SPACING.xs,
	},
	stopNotes: {
		fontSize: SIZES.fontSm,
		color: COLORS.text,
		fontStyle: 'italic',
	},
	notesSection: {
		marginTop: SPACING.lg,
		padding: SPACING.md,
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
	},
	notesTitle: {
		fontSize: SIZES.fontMd,
		fontWeight: '700',
		color: COLORS.text,
		marginBottom: SPACING.sm,
	},
	notesText: {
		fontSize: SIZES.fontSm,
		color: COLORS.text,
		lineHeight: 20,
	},
});
