import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapViewComponent, { type MapViewRef } from '../../components/MapView';
import { COLORS, SPACING } from '../../constants';
import { SIZES } from '../../constants/sizes';
import { useTranslation } from '../../i18n';
import type { Location, MapRegion } from '../../types';
import type { ManualStop } from '../hooks/useManualJourneyFlow';
import { StopsSection } from './StopsSection';

// Non-token color used for unselected stop markers (dark gray dot)
const STOP_MARKER_COLOR = '#333333';

interface StopsManagementStepProps {
	startLocation: Location;
	startName: string;
	endLocation: Location;
	endName: string;
	stops: ManualStop[];
	selectedStopId: string | null;
	title: string;
	notes: string;
	isSaving: boolean;
	canSave: boolean;
	onAddStop: (location: Location) => void;
	onUpdateStop: (id: string, updates: Partial<ManualStop>) => void;
	onRemoveStop: (id: string) => void;
	onSelectStop: (id: string | null) => void;
	onTitleChange: (title: string) => void;
	onNotesChange: (notes: string) => void;
	onSave: () => void;
	onBack: () => void;
}

// ---------------------------------------------------------------------------
// StopsManagementStep
// ---------------------------------------------------------------------------

/**
 * Step 3: Manage stops on the route and finalize the journey.
 * Shows start marker (blue), end marker (red), route polyline,
 * and allows adding stops by tapping on the map.
 */
export const StopsManagementStep: React.FC<StopsManagementStepProps> = ({
	startLocation,
	startName,
	endLocation,
	endName,
	stops,
	selectedStopId,
	title,
	notes,
	isSaving,
	canSave,
	onAddStop,
	onUpdateStop,
	onRemoveStop,
	onSelectStop,
	onTitleChange,
	onNotesChange,
	onSave,
	onBack,
}) => {
	const insets = useSafeAreaInsets();
	const mapRef = useRef<MapViewRef>(null);
	const [isAddingStop, setIsAddingStop] = useState(false);
	const { t } = useTranslation();

	const selectedStop = stops.find(s => s.id === selectedStopId);

	const initialRegion = useMemo((): MapRegion => {
		const allLats = [
			startLocation.latitude,
			endLocation.latitude,
			...stops.map(s => s.location.latitude),
		];
		const allLngs = [
			startLocation.longitude,
			endLocation.longitude,
			...stops.map(s => s.location.longitude),
		];

		const minLat = Math.min(...allLats);
		const maxLat = Math.max(...allLats);
		const minLng = Math.min(...allLngs);
		const maxLng = Math.max(...allLngs);

		return {
			latitude: (minLat + maxLat) / 2,
			longitude: (minLng + maxLng) / 2,
			latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.02),
			longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.02),
		};
	}, [startLocation, endLocation, stops]);

	const polylineCoordinates = useMemo(
		() => [
			{ latitude: startLocation.latitude, longitude: startLocation.longitude },
			...stops.map(s => ({
				latitude: s.location.latitude,
				longitude: s.location.longitude,
			})),
			{ latitude: endLocation.latitude, longitude: endLocation.longitude },
		],
		[startLocation, endLocation, stops]
	);

	useEffect(() => {
		const timer = setTimeout(() => {
			mapRef.current?.animateToRegion(initialRegion, 500);
		}, 100);
		return () => clearTimeout(timer);
	}, [initialRegion]);

	const handleMapPress = useCallback(
		(location: Location) => {
			if (isAddingStop) {
				onAddStop(location);
				setIsAddingStop(false);
			}
		},
		[isAddingStop, onAddStop]
	);

	const handleMapLongPress = useCallback(
		(location: Location) => {
			onAddStop(location);
			setIsAddingStop(false);
		},
		[onAddStop]
	);

	const handleStopMarkerPress = useCallback(
		(stopId: string) => {
			onSelectStop(selectedStopId === stopId ? null : stopId);
		},
		[selectedStopId, onSelectStop]
	);

	return (
		<View style={styles.container}>
			{/* Map */}
			<View style={styles.mapContainer}>
				<MapViewComponent
					ref={mapRef}
					initialRegion={initialRegion}
					showUserLocation={false}
					onPress={handleMapPress}
					onLongPress={handleMapLongPress}
				>
					<Polyline
						coordinates={polylineCoordinates}
						strokeColor={COLORS.primary}
						strokeWidth={3}
					/>
					<Marker
						coordinate={startLocation}
						title={startName || t('journey.startMarker')}
						pinColor={COLORS.secondary}
					/>
					<Marker
						coordinate={endLocation}
						title={endName || t('journey.endMarker')}
						pinColor={COLORS.error}
					/>
					{stops.map((stop, index) => (
						<Marker
							key={stop.id}
							coordinate={stop.location}
							title={t('journey.stopMarkerTitle', { number: index + 1 })}
							pinColor={
								stop.id === selectedStopId ? COLORS.primary : STOP_MARKER_COLOR
							}
							onPress={() => handleStopMarkerPress(stop.id)}
						/>
					))}
				</MapViewComponent>

				{isAddingStop && (
					<View style={styles.addingStopOverlay} pointerEvents="none">
						<View style={styles.addingStopHint}>
							<Text style={styles.addingStopText}>
								{t('journey.tapToAddStop')}
							</Text>
						</View>
					</View>
				)}
			</View>

			{/* Header */}
			<View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
				<Pressable
					style={styles.backButton}
					onPress={onBack}
					accessibilityLabel={t('common.goBack')}
					accessibilityRole="button"
				>
					<Ionicons name="arrow-back" size={SIZES.iconMd} color={COLORS.text} />
				</Pressable>
				<View style={styles.headerTextContainer}>
					<Text style={styles.headerTitle}>{t('journey.addStops')}</Text>
					<Text style={styles.headerSubtitle}>
						{t('journey.longPressHint')}
					</Text>
				</View>
			</View>

			{/* Bottom panel */}
			<View
				style={[
					styles.bottomPanel,
					{ paddingBottom: insets.bottom + SPACING.md },
				]}
			>
				<View style={styles.bottomPanelHeader}>
					<View style={styles.dragHandle} />
				</View>

				<ScrollView
					style={styles.bottomPanelContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.inputSection}>
						<Text style={styles.inputLabel}>
							{t('journey.titleLabelOptional')}
						</Text>
						<TextInput
							style={styles.input}
							placeholder={t('journey.titlePlaceholder')}
							value={title}
							onChangeText={onTitleChange}
							placeholderTextColor={COLORS.textSecondary}
						/>
					</View>

					<StopsSection
						stops={stops}
						selectedStop={selectedStop}
						isAddingStop={isAddingStop}
						onToggleAddStop={() => setIsAddingStop(prev => !prev)}
						onSelectStop={onSelectStop}
						onUpdateStop={onUpdateStop}
						onRemoveStop={onRemoveStop}
					/>

					<View style={styles.inputSection}>
						<Text style={styles.inputLabel}>
							{t('common.notesLabelOptional')}
						</Text>
						<TextInput
							style={[styles.input, styles.notesInput]}
							placeholder={t('journey.notesPlaceholder')}
							value={notes}
							onChangeText={onNotesChange}
							multiline
							numberOfLines={3}
							placeholderTextColor={COLORS.textSecondary}
						/>
					</View>
				</ScrollView>

				<Pressable
					style={[
						styles.saveButton,
						(!canSave || isSaving) && styles.saveButtonDisabled,
					]}
					onPress={onSave}
					disabled={!canSave || isSaving}
				>
					<Text style={styles.saveButtonText}>
						{isSaving ? t('common.saving') : t('journey.saveJourney')}
					</Text>
				</Pressable>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	mapContainer: {
		flex: 1,
	},
	header: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING.md,
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		paddingBottom: SPACING.sm,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
		backgroundColor: COLORS.surface,
	},
	headerTextContainer: {
		marginLeft: SPACING.md,
	},
	headerTitle: {
		fontSize: SIZES.fontLg,
		fontWeight: '600',
		color: COLORS.text,
	},
	headerSubtitle: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		marginTop: 2,
	},
	addingStopOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
	},
	addingStopHint: {
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		paddingHorizontal: SPACING.lg,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
	},
	addingStopText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '500',
	},
	bottomPanel: {
		backgroundColor: COLORS.background,
		borderTopLeftRadius: SIZES.radiusXLarge,
		borderTopRightRadius: SIZES.radiusXLarge,
		paddingHorizontal: SPACING.lg,
		maxHeight: '50%',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},
	bottomPanelHeader: {
		alignItems: 'center',
		paddingVertical: SPACING.sm,
	},
	dragHandle: {
		width: 40,
		height: 4,
		backgroundColor: COLORS.border,
		borderRadius: 2,
	},
	bottomPanelContent: {
		flex: 1,
	},
	inputSection: {
		marginBottom: SPACING.md,
	},
	inputLabel: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: SPACING.xs,
	},
	input: {
		backgroundColor: COLORS.surface,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: SIZES.radiusMedium,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		fontSize: SIZES.fontMd,
		color: COLORS.text,
	},
	notesInput: {
		minHeight: 80,
		textAlignVertical: 'top',
	},
	saveButton: {
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
		marginTop: SPACING.sm,
	},
	saveButtonDisabled: {
		opacity: 0.6,
	},
	saveButtonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});
