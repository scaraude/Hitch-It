import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressInput } from '../../components/AddressInput';
import MapViewComponent, { type MapViewRef } from '../../components/MapView';
import { COLORS, MAP_CONFIG, SPACING } from '../../constants';
import { SIZES } from '../../constants/sizes';
import type { Location, MapRegion } from '../../types';
import { CenterMapMarker } from './CenterMapMarker';

interface LocationPickerStepProps {
	title: string;
	subtitle: string;
	ctaLabel: string;
	markerColor?: string;
	onConfirm: (location: Location, name: string) => void;
	onBack: () => void;
	initialRegion?: MapRegion;
}

/**
 * A full-screen map step for selecting a location.
 * Used for both start and end point selection.
 */
export const LocationPickerStep: React.FC<LocationPickerStepProps> = ({
	title,
	subtitle,
	ctaLabel,
	markerColor = COLORS.error,
	onConfirm,
	onBack,
	initialRegion = MAP_CONFIG.defaultRegion,
}) => {
	const insets = useSafeAreaInsets();
	const mapRef = useRef<MapViewRef>(null);

	const [searchText, setSearchText] = useState('');
	const [isSearchExpanded, setIsSearchExpanded] = useState(false);
	const [currentRegion, setCurrentRegion] = useState<MapRegion>(initialRegion);
	const [locationName, setLocationName] = useState('');

	const handleRegionChange = useCallback((region: Region) => {
		setCurrentRegion(region);
		// Clear location name when user pans manually
		setLocationName('');
	}, []);

	const handleLocationSelected = useCallback(
		(location: Location, name: string) => {
			setLocationName(name);
			setSearchText(name);
			setIsSearchExpanded(false);

			// Animate map to selected location
			const newRegion: MapRegion = {
				latitude: location.latitude,
				longitude: location.longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			};
			mapRef.current?.animateToRegion(newRegion, 500);
			setCurrentRegion(newRegion);
		},
		[]
	);

	const handleConfirm = useCallback(() => {
		const location: Location = {
			latitude: currentRegion.latitude,
			longitude: currentRegion.longitude,
		};
		onConfirm(location, locationName || 'Selected location');
	}, [currentRegion, locationName, onConfirm]);

	const toggleSearch = useCallback(() => {
		setIsSearchExpanded(prev => !prev);
	}, []);

	return (
		<View style={styles.container}>
			{/* Map */}
			<MapViewComponent
				ref={mapRef}
				initialRegion={initialRegion}
				onRegionChange={handleRegionChange}
				showUserLocation
			/>

			{/* Center marker */}
			<CenterMapMarker color={markerColor} />

			{/* Header with back button and title */}
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
					<Text style={styles.headerTitle}>{title}</Text>
					<Text style={styles.headerSubtitle}>{subtitle}</Text>
				</View>
			</View>

			{/* Search bar */}
			{isSearchExpanded ? (
				<View
					style={[styles.expandedSearchContainer, { top: insets.top + 70 }]}
				>
					<View style={styles.expandedSearchBar}>
						<Pressable
							style={styles.searchBackButton}
							onPress={toggleSearch}
							accessibilityLabel="Close search"
							accessibilityRole="button"
						>
							<Ionicons name="arrow-back" size={22} color="#484C52" />
						</Pressable>
						<View style={styles.inputWrapper}>
							<AddressInput
								placeholder="Search for a location"
								value={searchText}
								onChangeText={setSearchText}
								onLocationSelected={handleLocationSelected}
								autoFocus
								showEmptyState
								hapticFeedback
								showTopSuggestionLabel
								suggestionsPlacement="below"
								suggestionsStyle="dropdown"
								containerStyle={styles.addressInputContainer}
								inputContainerStyle={styles.addressInput}
								testID="location-picker-search"
							/>
						</View>
					</View>
				</View>
			) : (
				<Pressable
					style={[styles.collapsedSearchBar, { top: insets.top + 70 }]}
					onPress={toggleSearch}
					accessibilityLabel="Search for a location"
					accessibilityRole="button"
				>
					<Ionicons
						name="search"
						size={SIZES.iconMd}
						color={COLORS.textSecondary}
					/>
					<Text style={styles.searchPlaceholder}>Search for a location</Text>
				</Pressable>
			)}

			{/* CTA Button */}
			<View
				style={[
					styles.ctaContainer,
					{ paddingBottom: insets.bottom + SPACING.md },
				]}
			>
				<Pressable
					style={styles.ctaButton}
					onPress={handleConfirm}
					accessibilityLabel={ctaLabel}
					accessibilityRole="button"
				>
					<Text style={styles.ctaText}>{ctaLabel}</Text>
				</Pressable>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
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
	collapsedSearchBar: {
		position: 'absolute',
		left: SPACING.md,
		right: SPACING.md,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.background,
		borderRadius: 28,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		minHeight: 48,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 4,
	},
	searchPlaceholder: {
		marginLeft: SPACING.sm,
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
	},
	expandedSearchContainer: {
		position: 'absolute',
		left: SPACING.md,
		right: SPACING.md,
	},
	expandedSearchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.background,
		borderRadius: 28,
		paddingLeft: SPACING.sm,
		paddingRight: SPACING.md,
		paddingVertical: SPACING.sm,
		minHeight: 56,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 4,
	},
	searchBackButton: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 20,
	},
	inputWrapper: {
		flex: 1,
		justifyContent: 'center',
	},
	addressInputContainer: {
		marginBottom: 0,
	},
	addressInput: {
		backgroundColor: 'transparent',
		borderWidth: 0,
		paddingVertical: 0,
		minHeight: 40,
	},
	ctaContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.md,
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
	},
	ctaButton: {
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
	},
	ctaText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});
