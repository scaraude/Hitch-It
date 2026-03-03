import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
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
import {
	JourneyDetailFeedback,
	JourneyDetailHeader,
	JourneyStopsList,
} from '../journey/components/journeyDetail';
import * as journeyRepository from '../journey/services/journeyRepository';
import type { Journey } from '../journey/types';
import { buildJourneyDetailViewModel } from '../journey/utils/journeyDetailViewModel';
import type { RootStackParamList } from '../navigation/types';

type JourneyDetailRouteProp = RouteProp<RootStackParamList, 'JourneyDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const JOURNEY_FALLBACK_TITLE = 'Journey';

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
			setJourney({ ...journey, title: normalizedTitle });
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

	const goBack = useCallback(() => navigation.goBack(), [navigation]);

	// ---- Loading / error shells ----

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<JourneyDetailHeader title={t('journey.details')} onBack={goBack} />
				<JourneyDetailFeedback variant="loading" />
			</SafeAreaView>
		);
	}

	if (error || !journey) {
		return (
			<SafeAreaView style={styles.container}>
				<JourneyDetailHeader title={t('journey.details')} onBack={goBack} />
				<JourneyDetailFeedback
					variant="error"
					message={error?.message ?? t('journey.notFound')}
				/>
			</SafeAreaView>
		);
	}

	// ---- View model ----

	const vm = buildJourneyDetailViewModel(journey, JOURNEY_FALLBACK_TITLE);
	const titleChanged = (journey.title ?? '') !== editableTitle.trim();

	// ---- Render ----

	return (
		<SafeAreaView style={styles.container}>
			<JourneyDetailHeader title={vm.title} onBack={goBack} />

			<ScrollView style={styles.content}>
				{vm.mapRegion && (
					<View style={styles.mapContainer}>
						<MapView
							style={styles.map}
							provider={PROVIDER_DEFAULT}
							initialRegion={vm.mapRegion}
						>
							{vm.startPoint && (
								<Marker
									coordinate={{
										latitude: vm.startPoint.latitude,
										longitude: vm.startPoint.longitude,
									}}
									pinColor={COLORS.secondary}
									title={t('journey.startMarker')}
								/>
							)}
							{vm.endPoint && vm.startPoint !== vm.endPoint && (
								<Marker
									coordinate={{
										latitude: vm.endPoint.latitude,
										longitude: vm.endPoint.longitude,
									}}
									pinColor={COLORS.error}
									title={t('journey.endMarker')}
								/>
							)}
							{vm.stopPoints.map(point => (
								<Marker
									key={point.id}
									coordinate={{
										latitude: point.latitude,
										longitude: point.longitude,
									}}
									pinColor={COLORS.primary}
								/>
							))}
							{vm.polylineCoordinates.length > 1 && (
								<Polyline
									coordinates={vm.polylineCoordinates}
									strokeColor={COLORS.primary}
									strokeWidth={3}
								/>
							)}
						</MapView>
					</View>
				)}

				<View style={styles.infoPanel}>
					{/* Title editor */}
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

					{/* Stats row */}
					<View style={styles.statsRow}>
						<View style={styles.statBox}>
							<Ionicons
								name="navigate-outline"
								size={24}
								color={COLORS.primary}
							/>
							<Text style={styles.statValue}>{vm.distance}</Text>
						</View>
						<View style={styles.statBox}>
							<Ionicons name="car-outline" size={24} color={COLORS.primary} />
							<Text style={styles.statValue}>
								{vm.stopPoints.length} {t('journey.carLabel')}
							</Text>
						</View>
						<View style={styles.statBox}>
							<Ionicons name="time-outline" size={24} color={COLORS.primary} />
							<Text style={styles.statValue}>{vm.duration}</Text>
						</View>
					</View>

					<JourneyStopsList stopPoints={vm.stopPoints} />

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
