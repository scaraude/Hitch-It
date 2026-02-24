import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING } from '../constants';
import type { Location } from '../types';
import { AddressInput } from './AddressInput';

interface SearchBarOverlayProps {
	isExpanded: boolean;
	searchText: string;
	onSearchTextChange: (text: string) => void;
	onLocationSelected: (location: Location, name: string) => void;
	onToggle: () => void;
}

export const SearchBarOverlay: React.FC<SearchBarOverlayProps> = ({
	isExpanded,
	searchText,
	onSearchTextChange,
	onLocationSelected,
	onToggle,
}) => {
	const insets = useSafeAreaInsets();

	if (isExpanded) {
		return (
			<View
				style={[styles.expandedContainer, { top: insets.top + SPACING.lg }]}
			>
				<View style={styles.expandedSearchBar}>
					<Pressable
						style={styles.backButton}
						onPress={onToggle}
						accessibilityLabel="Fermer la recherche"
						accessibilityRole="button"
					>
						<Ionicons name="arrow-back" size={22} style={styles.backIcon} />
					</Pressable>
					<View style={styles.inputWrapper}>
						<AddressInput
							placeholder="Search"
							value={searchText}
							onChangeText={onSearchTextChange}
							onLocationSelected={onLocationSelected}
							autoFocus
							showEmptyState
							hapticFeedback
							showTopSuggestionLabel
							suggestionsPlacement="below"
							suggestionsStyle="dropdown"
							containerStyle={styles.addressInputContainer}
							inputContainerStyle={styles.addressInput}
							testID="search-bar-input"
						/>
					</View>
				</View>
			</View>
		);
	}

	return (
		<Pressable
			style={[styles.collapsedContainer, { top: insets.top + SPACING.lg }]}
			onPress={onToggle}
			accessibilityLabel="Rechercher"
			accessibilityRole="button"
			testID="search-bar-collapsed"
		>
			<Ionicons name="search" size={SIZES.iconMd} style={styles.searchIcon} />
		</Pressable>
	);
};

const styles = StyleSheet.create({
	collapsedContainer: {
		position: 'absolute',
		left: SPACING.md,
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: COLORS.background,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 3,
	},
	searchIcon: {
		color: '#484C52',
	},
	expandedContainer: {
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
	backButton: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 20,
	},
	backIcon: {
		color: '#484C52',
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
});
