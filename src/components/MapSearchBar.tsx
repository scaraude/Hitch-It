import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { SearchSuggestion } from '@/services/geocodingService';
import { searchPlaces } from '@/services/geocodingService';
import type { Location } from '@/types';
import { logger } from '@/utils/logger';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Keyboard,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants';

interface MapSearchBarProps {
	onLocationSelected: (location: Location, name: string) => void;
	initiallyExpanded?: boolean;
}

export const MapSearchBar: React.FC<MapSearchBarProps> = ({
	onLocationSelected,
	initiallyExpanded = false,
}) => {
	const [searchText, setSearchText] = useState('');
	const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

	const debouncedSearchText = useDebouncedValue(searchText, 300);

	useEffect(() => {
		const fetchSuggestions = async () => {
			if (!debouncedSearchText.trim()) {
				setSuggestions([]);
				return;
			}

			setIsLoading(true);
			try {
				const results = await searchPlaces(debouncedSearchText);
				setSuggestions(results);
			} catch (error) {
				logger.app.error('Failed to fetch search suggestions', error);
				setSuggestions([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSuggestions();
	}, [debouncedSearchText]);

	const handleExpand = () => {
		setIsExpanded(true);
	};

	const handleCollapse = () => {
		setIsExpanded(false);
		setSearchText('');
		setSuggestions([]);
		Keyboard.dismiss();
	};

	const handleSuggestionPress = (suggestion: SearchSuggestion) => {
		onLocationSelected(suggestion.location, suggestion.name);
		handleCollapse();
	};

	if (!isExpanded) {
		return (
			<View style={styles.container}>
				<TouchableOpacity
					style={styles.collapsedButton}
					onPress={handleExpand}
					accessibilityLabel="Rechercher un lieu"
					accessibilityRole="button"
					testID="map-search-button"
				>
					<Text style={styles.searchIcon}>🔍</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.searchContainer}>
				<View style={styles.inputRow}>
					<Text style={styles.searchIconExpanded}>🔍</Text>
					<TextInput
						style={styles.input}
						value={searchText}
						onChangeText={setSearchText}
						placeholder="Rechercher un lieu"
						placeholderTextColor={COLORS.textSecondary}
						autoFocus={true}
						accessibilityLabel="Rechercher un lieu"
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

				{isLoading && (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="small" color={COLORS.primary} />
					</View>
				)}

				{!isLoading && searchText.trim() && suggestions.length === 0 && (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>Aucun résultat</Text>
					</View>
				)}

				{!isLoading && suggestions.length > 0 && (
					<View style={styles.suggestionsContainer}>
						{suggestions.map(suggestion => (
							<TouchableOpacity
								key={suggestion.id}
								style={styles.suggestionItem}
								onPress={() => handleSuggestionPress(suggestion)}
								accessibilityRole="button"
								accessibilityLabel={`${suggestion.name}, ${suggestion.description}`}
								testID={`suggestion-${suggestion.id}`}
							>
								<View>
									<Text style={styles.suggestionName}>{suggestion.name}</Text>
									{suggestion.description && (
										<Text style={styles.suggestionDescription}>
											{suggestion.description}
										</Text>
									)}
								</View>
							</TouchableOpacity>
						))}
					</View>
				)}
			</View>
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
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		gap: SPACING.sm,
	},
	searchIconExpanded: {
		fontSize: SIZES.iconMd,
	},
	input: {
		flex: 1,
		fontSize: SIZES.fontMd,
		color: COLORS.text,
		padding: 0,
	},
	closeButton: {
		padding: SPACING.xs,
	},
	closeIcon: {
		fontSize: SIZES.iconMd,
		color: COLORS.textSecondary,
	},
	loadingContainer: {
		padding: SPACING.md,
		alignItems: 'center',
	},
	emptyContainer: {
		padding: SPACING.md,
		alignItems: 'center',
	},
	emptyText: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
	},
	suggestionsContainer: {
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
	},
	suggestionItem: {
		padding: SPACING.md,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	suggestionName: {
		fontSize: SIZES.fontMd,
		color: COLORS.text,
		fontWeight: '600',
	},
	suggestionDescription: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		marginTop: SPACING.xs,
	},
});

export default MapSearchBar;
