import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../constants';
import { SIZES } from '../constants/sizes';
import { useTranslation } from '../i18n';
import * as journeyRepository from '../journey/services/journeyRepository';
import type { Journey } from '../journey/types';
import { JourneyPointType } from '../journey/types';
import type { RootStackParamList } from '../navigation/types';

type JourneyDetailRouteProp = RouteProp<RootStackParamList, 'JourneyDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const JOURNEY_FALLBACK_TITLE = 'Journey';

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
	const { t } = useTranslation();

	const [journey, setJourney] = useState<Journey | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [editableTitle, setEditableTitle] = useState('');
	const [isSavingTitle, setIsSavingTitle] = useState(false);
	const [isDeletingJourney, setIsDeletingJourney] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const loadJourney = async () => {
			setIsLoading(true);
			try {
				const journeyData = await journeyRepository.getJourneyById(journeyId);
				if (isMounted) {
					setJourney(journeyData);
					setEditableTitle(journeyData?.title ?? '');
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

	const handleSaveTitle = useCallback(async () => {
		if (!journey) return;

		const normalizedTitle = editableTitle.trim() || undefined;
		setIsSavingTitle(true);

		try {
			await journeyRepository.updateJourneyTitle(journey.id, normalizedTitle);
			setJourney({
				...journey,
				title: normalizedTitle,
			});
			setEditableTitle(normalizedTitle ?? '');
		} catch {
			Alert.alert(t('common.error'), t('errors.updateTitleFailed'));
		} finally {
			setIsSavingTitle(false);
		}
	}, [journey, editableTitle, t]);

	const executeDeleteJourney = useCallback(async () => {
		if (!journey) return;

		setIsDeletingJourney(true);
		try {
			await journeyRepository.deleteJourney(journey.id);
			navigation.goBack();
		} catch {
			Alert.alert(t('common.error'), t('errors.deleteFailed'));
		} finally {
			setIsDeletingJourney(false);
		}
	}, [journey, navigation, t]);

	const handleDeleteJourney = useCallback(() => {
		Alert.alert(t('journey.confirmDelete'), t('common.cannotUndo'), [
			{ text: t('common.cancel'), style: 'cancel' },
			{
				text: t('common.delete'),
				style: 'destructive',
				onPress: () => {
					void executeDeleteJourney();
				},
			},
		]);
	}, [executeDeleteJourney, t]);

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
					<Text style={styles.headerTitle}>{t('journey.details')}</Text>
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
					<Text style={styles.headerTitle}>{t('journey.details')}</Text>
					<View style={styles.headerSpacer} />
				</View>
				<View style={styles.errorContainer}>
					<Ionicons
						name="alert-circle-outline"
						size={64}
						color={COLORS.error}
					/>
					<Text style={styles.errorText}>
						{error?.message ?? t('journey.notFound')}
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	const title = journey.title || JOURNEY_FALLBACK_TITLE;
	const distance = formatDistance(journey.totalDistanceKm);
	const duration = formatDuration(journey.startedAt, journey.endedAt);
	const stopPoints = journey.points.filter(
		p => p.type === JourneyPointType.Stop
	);
	const routePolylinePoints = journey.routePolyline ?? [];
	const routePoints = journey.points.filter(
		p => p.type === JourneyPointType.Location
	);
	const mapPoints =
		routePolylinePoints.length > 1
			? routePolylinePoints
			: routePoints.length > 1
				? routePoints
				: journey.points;
	const carCount = stopPoints.length;
	const titleChanged = (journey.title ?? '') !== editableTitle.trim();

	// Calculate map region to fit all points
	const mapRegion =
		mapPoints.length > 0
			? (() => {
					const lats = mapPoints.map(p => p.latitude);
					const lngs = mapPoints.map(p => p.longitude);
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

	const startPoint =
		stopPoints.length > 0 ? stopPoints[0] : (mapPoints[0] ?? null);
	const endPoint =
		stopPoints.length > 0
			? stopPoints[stopPoints.length - 1]
			: mapPoints.length > 0
				? mapPoints[mapPoints.length - 1]
				: null;

	const polylineCoordinates = mapPoints.map(p => ({
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
									title={t('journey.startMarker')}
								/>
							)}
							{endPoint && startPoint !== endPoint && (
								<Marker
									coordinate={{
										latitude: endPoint.latitude,
										longitude: endPoint.longitude,
									}}
									pinColor={COLORS.error}
									title={t('journey.endMarker')}
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
					<View style={styles.titleSection}>
						<Text style={styles.titleSectionLabel}>
							{t('journey.titleLabel')}
						</Text>
						<TextInput
							style={styles.titleInput}
							placeholder={t('journey.titlePlaceholder')}
							value={editableTitle}
							onChangeText={setEditableTitle}
							placeholderTextColor={COLORS.textSecondary}
						/>
						<View style={styles.titleActions}>
							<Pressable
								style={[
									styles.titleActionButton,
									styles.primaryActionButton,
									(!titleChanged || isSavingTitle) &&
										styles.titleActionButtonDisabled,
								]}
								onPress={handleSaveTitle}
								disabled={!titleChanged || isSavingTitle}
							>
								<Text style={styles.primaryActionText}>
									{isSavingTitle ? t('common.saving') : t('journey.saveTitle')}
								</Text>
							</Pressable>
							<Pressable
								style={[
									styles.titleActionButton,
									styles.secondaryActionButton,
									editableTitle.length === 0 &&
										styles.titleActionButtonDisabled,
								]}
								onPress={() => setEditableTitle('')}
								disabled={editableTitle.length === 0}
							>
								<Text style={styles.secondaryActionText}>
									{t('common.clear')}
								</Text>
							</Pressable>
						</View>
					</View>

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
								{carCount} {t('journey.carLabel')}
							</Text>
						</View>
						<View style={styles.statBox}>
							<Ionicons name="time-outline" size={24} color={COLORS.primary} />
							<Text style={styles.statValue}>{duration}</Text>
						</View>
					</View>

					{stopPoints.length > 0 && (
						<View style={styles.stopsSection}>
							<Text style={styles.stopsTitle}>{t('journey.stopsLabel')}</Text>
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
												{t('journey.waitTime', {
													minutes: point.waitTimeMinutes,
												})}
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
							<Text style={styles.notesTitle}>{t('common.notesLabel')}</Text>
							<Text style={styles.notesText}>{journey.notes}</Text>
						</View>
					)}

					<Pressable
						style={[
							styles.deleteJourneyButton,
							isDeletingJourney && styles.deleteJourneyButtonDisabled,
						]}
						onPress={handleDeleteJourney}
						disabled={isDeletingJourney}
					>
						<Text style={styles.deleteJourneyButtonText}>
							{isDeletingJourney
								? t('common.deleting')
								: t('journey.deleteJourney')}
						</Text>
					</Pressable>
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
	titleSection: {
		marginBottom: SPACING.lg,
	},
	titleSectionLabel: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: SPACING.xs,
	},
	titleInput: {
		backgroundColor: COLORS.surface,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: SIZES.radiusMedium,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		fontSize: SIZES.fontMd,
		color: COLORS.text,
	},
	titleActions: {
		flexDirection: 'row',
		gap: SPACING.sm,
		marginTop: SPACING.sm,
	},
	titleActionButton: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: SPACING.sm,
		borderRadius: SIZES.radiusMedium,
		borderWidth: 1,
	},
	primaryActionButton: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	secondaryActionButton: {
		backgroundColor: COLORS.background,
		borderColor: COLORS.border,
	},
	titleActionButtonDisabled: {
		opacity: 0.5,
	},
	primaryActionText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontSm,
		fontWeight: '600',
	},
	secondaryActionText: {
		color: COLORS.text,
		fontSize: SIZES.fontSm,
		fontWeight: '600',
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
	deleteJourneyButton: {
		marginTop: SPACING.xl,
		borderWidth: 1,
		borderColor: COLORS.error,
		borderRadius: SIZES.radiusMedium,
		paddingVertical: SPACING.md,
		alignItems: 'center',
		backgroundColor: COLORS.background,
	},
	deleteJourneyButtonDisabled: {
		opacity: 0.5,
	},
	deleteJourneyButtonText: {
		color: COLORS.error,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});
