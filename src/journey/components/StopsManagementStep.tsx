import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	ActivityIndicator,
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
import type { RoutePoint } from '../../navigation/types';
import type { Location, MapRegion } from '../../types';
import type { ManualStop } from '../hooks/useManualJourneyFlow';

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
	routePolyline: RoutePoint[] | null;
	isLoadingRoute: boolean;
	routeError: string | null;
	onAddStop: (location: Location) => void;
	onUpdateStop: (id: string, updates: Partial<ManualStop>) => void;
	onRemoveStop: (id: string) => void;
	onSelectStop: (id: string | null) => void;
	onTitleChange: (title: string) => void;
	onNotesChange: (notes: string) => void;
	onSave: () => void;
	onBack: () => void;
}

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
	routePolyline,
	isLoadingRoute,
	routeError,
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

	// Calculate region to fit all points
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

		const latDelta = Math.max((maxLat - minLat) * 1.5, 0.02);
		const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.02);

		return {
			latitude: (minLat + maxLat) / 2,
			longitude: (minLng + maxLng) / 2,
			latitudeDelta: latDelta,
			longitudeDelta: lngDelta,
		};
	}, [startLocation, endLocation, stops]);

	// Use calculated route polyline if available, otherwise fallback to straight line
	const polylineCoordinates = useMemo(() => {
		if (routePolyline && routePolyline.length > 0) {
			return routePolyline;
		}
		// Fallback to straight line
		return [
			{ latitude: startLocation.latitude, longitude: startLocation.longitude },
			{ latitude: endLocation.latitude, longitude: endLocation.longitude },
		];
	}, [routePolyline, startLocation, endLocation]);

	// Fit map to show all points on mount
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

	// Long press always adds a stop (more intuitive gesture)
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

	const selectedStop = useMemo(
		() => stops.find(s => s.id === selectedStopId),
		[stops, selectedStopId]
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
					{/* Route polyline */}
					<Polyline
						coordinates={polylineCoordinates}
						strokeColor={COLORS.primary}
						strokeWidth={3}
					/>

					{/* Start marker (blue) */}
					<Marker
						coordinate={startLocation}
						title={startName || 'Start'}
						pinColor={COLORS.secondary}
					/>

					{/* End marker (red) */}
					<Marker
						coordinate={endLocation}
						title={endName || 'End'}
						pinColor={COLORS.error}
					/>

					{/* Stop markers (black) */}
					{stops.map((stop, index) => (
						<Marker
							key={stop.id}
							coordinate={stop.location}
							title={`Stop ${index + 1}`}
							pinColor={stop.id === selectedStopId ? COLORS.primary : '#333333'}
							onPress={() => handleStopMarkerPress(stop.id)}
						/>
					))}
				</MapViewComponent>

				{/* Loading route overlay */}
				{isLoadingRoute && (
					<View style={styles.loadingOverlay} pointerEvents="none">
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color={COLORS.primary} />
							<Text style={styles.loadingText}>Calculating route...</Text>
						</View>
					</View>
				)}

				{/* Adding stop hint overlay */}
				{isAddingStop && !isLoadingRoute && (
					<View style={styles.addingStopOverlay} pointerEvents="none">
						<View style={styles.addingStopHint}>
							<Text style={styles.addingStopText}>
								Tap on the map to add a stop
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
					accessibilityLabel="Go back"
					accessibilityRole="button"
				>
					<Ionicons name="arrow-back" size={SIZES.iconMd} color={COLORS.text} />
				</Pressable>
				<View style={styles.headerTextContainer}>
					<Text style={styles.headerTitle}>Add Stops</Text>
					<Text style={styles.headerSubtitle}>
						Long press on map to add stops
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
					{/* Route error */}
					{routeError && (
						<View style={styles.errorBanner}>
							<Ionicons name="warning" size={16} color={COLORS.warning} />
							<Text style={styles.errorText}>{routeError}</Text>
						</View>
					)}

					{/* Journey title */}
					<View style={styles.inputSection}>
						<Text style={styles.inputLabel}>Journey Title (optional)</Text>
						<TextInput
							style={styles.input}
							placeholder="e.g., Paris to Lyon"
							value={title}
							onChangeText={onTitleChange}
							placeholderTextColor={COLORS.textSecondary}
						/>
					</View>

					{/* Add stop button or stop list */}
					<View style={styles.stopsSection}>
						<View style={styles.stopsSectionHeader}>
							<Text style={styles.inputLabel}>Stops ({stops.length})</Text>
							<Pressable
								style={[
									styles.addStopButton,
									isAddingStop && styles.addStopButtonActive,
								]}
								onPress={() => setIsAddingStop(!isAddingStop)}
							>
								<Ionicons
									name={isAddingStop ? 'close' : 'add'}
									size={18}
									color={isAddingStop ? COLORS.error : COLORS.primary}
								/>
								<Text
									style={[
										styles.addStopButtonText,
										isAddingStop && styles.addStopButtonTextActive,
									]}
								>
									{isAddingStop ? 'Cancel' : 'Add Stop'}
								</Text>
							</Pressable>
						</View>

						{/* Selected stop editor */}
						{selectedStop && (
							<View style={styles.stopEditor}>
								<View style={styles.stopEditorHeader}>
									<Text style={styles.stopEditorTitle}>
										Stop {stops.findIndex(s => s.id === selectedStop.id) + 1}
									</Text>
									<Pressable
										onPress={() => onRemoveStop(selectedStop.id)}
										accessibilityLabel="Remove stop"
									>
										<Ionicons
											name="trash-outline"
											size={20}
											color={COLORS.error}
										/>
									</Pressable>
								</View>

								<TextInput
									style={styles.stopInput}
									placeholder="Wait time (minutes)"
									value={selectedStop.waitTimeMinutes?.toString() || ''}
									onChangeText={text => {
										const minutes = Number.parseInt(text, 10);
										onUpdateStop(selectedStop.id, {
											waitTimeMinutes: Number.isNaN(minutes)
												? undefined
												: minutes,
										});
									}}
									keyboardType="numeric"
									placeholderTextColor={COLORS.textSecondary}
								/>

								<TextInput
									style={[styles.stopInput, styles.stopNotesInput]}
									placeholder="Notes (optional)"
									value={selectedStop.notes || ''}
									onChangeText={text =>
										onUpdateStop(selectedStop.id, { notes: text || undefined })
									}
									multiline
									numberOfLines={2}
									placeholderTextColor={COLORS.textSecondary}
								/>

								<Pressable
									style={styles.doneEditingButton}
									onPress={() => onSelectStop(null)}
								>
									<Text style={styles.doneEditingText}>Done</Text>
								</Pressable>
							</View>
						)}

						{/* Stops preview list (when not editing) */}
						{!selectedStop && stops.length > 0 && (
							<View style={styles.stopsList}>
								{stops.map((stop, index) => (
									<Pressable
										key={stop.id}
										style={styles.stopItem}
										onPress={() => onSelectStop(stop.id)}
									>
										<View style={styles.stopItemDot} />
										<View style={styles.stopItemContent}>
											<Text style={styles.stopItemTitle}>Stop {index + 1}</Text>
											{stop.waitTimeMinutes && (
												<Text style={styles.stopItemDetail}>
													{stop.waitTimeMinutes} min wait
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
						)}
					</View>

					{/* Journey notes */}
					<View style={styles.inputSection}>
						<Text style={styles.inputLabel}>Notes (optional)</Text>
						<TextInput
							style={[styles.input, styles.notesInput]}
							placeholder="Any additional notes about this journey..."
							value={notes}
							onChangeText={onNotesChange}
							multiline
							numberOfLines={3}
							placeholderTextColor={COLORS.textSecondary}
						/>
					</View>
				</ScrollView>

				{/* Save button */}
				<Pressable
					style={[
						styles.saveButton,
						(!canSave || isSaving) && styles.saveButtonDisabled,
					]}
					onPress={onSave}
					disabled={!canSave || isSaving}
				>
					<Text style={styles.saveButtonText}>
						{isSaving ? 'Saving...' : 'Save Journey'}
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
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.8)',
	},
	loadingContainer: {
		alignItems: 'center',
		gap: SPACING.sm,
	},
	loadingText: {
		color: COLORS.text,
		fontSize: SIZES.fontMd,
		fontWeight: '500',
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
	errorBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 152, 0, 0.1)',
		padding: SPACING.sm,
		borderRadius: SIZES.radiusMedium,
		marginBottom: SPACING.md,
		gap: SPACING.xs,
	},
	errorText: {
		flex: 1,
		color: COLORS.warning,
		fontSize: SIZES.fontSm,
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
	stopsSection: {
		marginBottom: SPACING.md,
	},
	stopsSectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: SPACING.sm,
	},
	addStopButton: {
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
	addStopButtonActive: {
		borderColor: COLORS.error,
		backgroundColor: 'rgba(244, 67, 54, 0.1)',
	},
	addStopButtonText: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.primary,
	},
	addStopButtonTextActive: {
		color: COLORS.error,
	},
	stopEditor: {
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		padding: SPACING.md,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	stopEditorHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: SPACING.sm,
	},
	stopEditorTitle: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
	},
	stopInput: {
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
	stopNotesInput: {
		minHeight: 60,
		textAlignVertical: 'top',
	},
	doneEditingButton: {
		alignItems: 'center',
		paddingVertical: SPACING.sm,
	},
	doneEditingText: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.primary,
	},
	stopsList: {
		gap: SPACING.xs,
	},
	stopItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		padding: SPACING.sm,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	stopItemDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#333333',
		marginRight: SPACING.sm,
	},
	stopItemContent: {
		flex: 1,
	},
	stopItemTitle: {
		fontSize: SIZES.fontMd,
		fontWeight: '500',
		color: COLORS.text,
	},
	stopItemDetail: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
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
