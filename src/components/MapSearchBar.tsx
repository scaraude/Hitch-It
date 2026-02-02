import { useState } from 'react';
import {
	Keyboard,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants';
import type { Location } from '../types';
import { AddressInput } from './AddressInput';

interface MapSearchBarProps {
	onLocationSelected: (location: Location, name: string) => void;
	initiallyExpanded?: boolean;
}

export const MapSearchBar: React.FC<MapSearchBarProps> = ({
	onLocationSelected,
	initiallyExpanded = false,
}) => {
	const [searchText, setSearchText] = useState('');
	const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

	const handleExpand = () => {
		setIsExpanded(true);
	};

	const handleCollapse = () => {
		setIsExpanded(false);
		setSearchText('');
		Keyboard.dismiss();
	};

	const handleLocationSelected = (location: Location, name: string) => {
		onLocationSelected(location, name);
		handleCollapse();
	};

	return (
		<View style={styles.container}>
			{!isExpanded ? (
				<TouchableOpacity
					style={styles.collapsedButton}
					onPress={handleExpand}
					accessibilityLabel="Rechercher un lieu"
					accessibilityRole="button"
					testID="map-search-button"
				>
					<Text style={styles.searchIcon}>🔍</Text>
				</TouchableOpacity>
			) : (
				<View style={styles.searchContainer}>
					<View style={styles.inputWrapper}>
						<AddressInput
							placeholder="Rechercher un lieu"
							value={searchText}
							onChangeText={setSearchText}
							onLocationSelected={handleLocationSelected}
							icon="🔍"
							autoFocus
							showEmptyState
							hapticFeedback
							containerStyle={styles.addressInputContainer}
							inputContainerStyle={styles.addressInputInner}
							suggestionsStyle="inline"
							testID="map-search-input"
						/>
						<TouchableOpacity
							onPress={handleCollapse}
							style={styles.closeButton}
							accessibilityLabel="Fermer la recherche"
							accessibilityRole="button"
							testID="map-search-close"
						>
							<Text style={styles.closeIcon}>✕</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: SPACING.md,
		left: SPACING.md,
		right: SPACING.md,
		zIndex: 1000,
	},
	collapsedButton: {
		width: SIZES.fabSize,
		height: SIZES.fabSize,
		borderRadius: SIZES.radiusLarge,
		backgroundColor: COLORS.background,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 4,
	},
	searchIcon: {
		fontSize: SIZES.iconLg,
	},
	searchContainer: {
		backgroundColor: COLORS.background,
		borderRadius: SIZES.radiusLarge,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 4,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	addressInputContainer: {
		flex: 1,
		marginBottom: 0,
	},
	addressInputInner: {
		backgroundColor: 'transparent',
		paddingVertical: SPACING.sm,
	},
	closeButton: {
		padding: SPACING.md,
	},
	closeIcon: {
		fontSize: SIZES.iconMd,
		color: COLORS.textSecondary,
	},
});

export default MapSearchBar;
