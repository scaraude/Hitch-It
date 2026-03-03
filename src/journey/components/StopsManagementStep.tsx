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
// StopEditor
// ---------------------------------------------------------------------------

interface StopEditorProps {
	stop: ManualStop;
	stopNumber: number;
	onUpdate: (updates: Partial<ManualStop>) => void;
	onRemove: () => void;
	onDone: () => void;
}

const StopEditor: React.FC<StopEditorProps> = ({
	stop,
	stopNumber,
	onUpdate,
	onRemove,
	onDone,
}) => {
	const { t } = useTranslation();

	const handleWaitTimeChange = useCallback(
		(text: string) => {
			const minutes = Number.parseInt(text, 10);
			onUpdate({
				waitTimeMinutes: Number.isNaN(minutes) ? undefined : minutes,
			});
		},
		[onUpdate]
	);

	const handleNotesChange = useCallback(
		(text: string) => {
			onUpdate({ notes: text || undefined });
		},
		[onUpdate]
	);

	return (
		<View style={editorStyles.container}>
			<View style={editorStyles.header}>
				<Text style={editorStyles.title}>
					{t('journey.stopLabel', { number: stopNumber })}
				</Text>
				<Pressable
					onPress={onRemove}
					accessibilityLabel={t('journey.removeStop')}
				>
					<Ionicons name="trash-outline" size={20} color={COLORS.error} />
				</Pressable>
			</View>

			<TextInput
				style={editorStyles.input}
				placeholder={t('journey.waitTimePlaceholder')}
				value={stop.waitTimeMinutes?.toString() ?? ''}
				onChangeText={handleWaitTimeChange}
				keyboardType="numeric"
				placeholderTextColor={COLORS.textSecondary}
			/>

			<TextInput
				style={[editorStyles.input, editorStyles.notesInput]}
				placeholder={t('common.notesLabelOptional')}
				value={stop.notes ?? ''}
				onChangeText={handleNotesChange}
				multiline
				numberOfLines={2}
				placeholderTextColor={COLORS.textSecondary}
			/>

			<Pressable style={editorStyles.doneButton} onPress={onDone}>
				<Text style={editorStyles.doneButtonText}>{t('common.done')}</Text>
			</Pressable>
		</View>
	);
};

const editorStyles = StyleSheet.create({
	container: {
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		padding: SPACING.md,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: SPACING.sm,
	},
	title: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
	},
	input: {
		backgroundColor: COLORS.background,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: SIZES.radiusMedium,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		fontSize: SIZES.fontMd,
		color: COLORS.text,
		marginBottom: SPACING.sm,
	},
	notesInput: {
		minHeight: 60,
		textAlignVertical: 'top',
	},
	doneButton: {
		alignItems: 'center',
		paddingVertical: SPACING.sm,
	},
	doneButtonText: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.primary,
	},
});

// ---------------------------------------------------------------------------
// StopsList
// ---------------------------------------------------------------------------

interface StopsListProps {
	stops: ManualStop[];
	onSelectStop: (id: string) => void;
}

const StopsList: React.FC<StopsListProps> = ({ stops, onSelectStop }) => {
	const { t } = useTranslation();

	return (
		<View style={listStyles.container}>
			{stops.map((stop, index) => (
				<Pressable
					key={stop.id}
					style={listStyles.item}
					onPress={() => onSelectStop(stop.id)}
				>
					<View style={listStyles.dot} />
					<View style={listStyles.content}>
						<Text style={listStyles.itemTitle}>
							{t('journey.stopLabel', { number: index + 1 })}
						</Text>
						{stop.waitTimeMinutes != null && (
							<Text style={listStyles.itemDetail}>
								{t('journey.minuteWait', { minutes: stop.waitTimeMinutes })}
							</Text>
						)}
					</View>
					<Ionicons
						name="chevron-forward"
						size={18}
						color={COLORS.textSecondary}
					/>
				</Pressable>
			))}
		</View>
	);
};

const listStyles = StyleSheet.create({
	container: {
		gap: SPACING.xs,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		padding: SPACING.sm,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: STOP_MARKER_COLOR,
		marginRight: SPACING.sm,
	},
	content: {
		flex: 1,
	},
	itemTitle: {
		fontSize: SIZES.fontMd,
		fontWeight: '500',
		color: COLORS.text,
	},
	itemDetail: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
	},
});

// ---------------------------------------------------------------------------
// StopsSection
// ---------------------------------------------------------------------------

interface StopsSectionProps {
	stops: ManualStop[];
	selectedStop: ManualStop | undefined;
	isAddingStop: boolean;
	onToggleAddStop: () => void;
	onSelectStop: (id: string | null) => void;
	onUpdateStop: (id: string, updates: Partial<ManualStop>) => void;
	onRemoveStop: (id: string) => void;
}

const StopsSection: React.FC<StopsSectionProps> = ({
	stops,
	selectedStop,
	isAddingStop,
	onToggleAddStop,
	onSelectStop,
	onUpdateStop,
	onRemoveStop,
}) => {
	const { t } = useTranslation();
	const selectedStopNumber = selectedStop
		? stops.findIndex(s => s.id === selectedStop.id) + 1
		: 0;

	return (
		<View style={sectionStyles.container}>
			<View style={sectionStyles.header}>
				<Text style={sectionStyles.label}>
					{t('journey.stopsCount', { count: stops.length })}
				</Text>
				<Pressable
					style={[
						sectionStyles.addButton,
						isAddingStop && sectionStyles.addButtonActive,
					]}
					onPress={onToggleAddStop}
				>
					<Ionicons
						name={isAddingStop ? 'close' : 'add'}
						size={18}
						color={isAddingStop ? COLORS.error : COLORS.primary}
					/>
					<Text
						style={[
							sectionStyles.addButtonText,
							isAddingStop && sectionStyles.addButtonTextActive,
						]}
					>
						{isAddingStop ? t('common.cancel') : t('journey.addStop')}
					</Text>
				</Pressable>
			</View>

			{selectedStop ? (
				<StopEditor
					stop={selectedStop}
					stopNumber={selectedStopNumber}
					onUpdate={updates => onUpdateStop(selectedStop.id, updates)}
					onRemove={() => onRemoveStop(selectedStop.id)}
					onDone={() => onSelectStop(null)}
				/>
			) : (
				stops.length > 0 && (
					<StopsList stops={stops} onSelectStop={onSelectStop} />
				)
			)}
		</View>
	);
};

const sectionStyles = StyleSheet.create({
	container: {
		marginBottom: SPACING.md,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: SPACING.sm,
	},
	label: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.text,
	},
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING.xs,
		paddingHorizontal: SPACING.sm,
		paddingVertical: SPACING.xs,
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		borderWidth: 1,
		borderColor: COLORS.primary,
	},
	addButtonActive: {
		borderColor: COLORS.error,
		backgroundColor: 'rgba(244, 67, 54, 0.1)',
	},
	addButtonText: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.primary,
	},
	addButtonTextActive: {
		color: COLORS.error,
	},
});

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
