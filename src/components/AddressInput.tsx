import * as Haptics from 'expo-haptics';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Animated,
	Keyboard,
	Pressable,
	type StyleProp,
	StyleSheet,
	Text,
	TextInput,
	View,
	type ViewStyle,
} from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { SearchSuggestion } from '../services/geocodingService';
import { searchPlaces } from '../services/geocodingService';
import type { Location } from '../types';
import { logger } from '../utils/logger';

interface AddressInputProps {
	placeholder: string;
	value: string;
	onChangeText: (text: string) => void;
	onLocationSelected: (location: Location, name: string) => void;
	label?: string;
	icon?: string;
	autoFocus?: boolean;
	testID?: string;
	showEmptyState?: boolean;
	hapticFeedback?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
	inputContainerStyle?: StyleProp<ViewStyle>;
	suggestionsStyle?: 'dropdown' | 'inline';
	suggestionsPlacement?: 'above' | 'below';
	showTopSuggestionLabel?: boolean;
}

export function AddressInput({
	placeholder,
	value,
	onChangeText,
	onLocationSelected,
	label,
	icon = '📍',
	autoFocus = false,
	testID,
	showEmptyState = false,
	hapticFeedback = false,
	containerStyle,
	inputContainerStyle,
	suggestionsStyle = 'dropdown',
	suggestionsPlacement = 'below',
	showTopSuggestionLabel = false,
}: AddressInputProps) {
	const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const debouncedSearchText = useDebouncedValue(value, 300);
	const suggestionsOpacity = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const fetchSuggestions = async () => {
			if (!debouncedSearchText.trim()) {
				setSuggestions([]);
				suggestionsOpacity.setValue(0);
				return;
			}

			setIsLoading(true);
			try {
				const results = await searchPlaces(debouncedSearchText);
				setSuggestions(results);
				if (results.length > 0) {
					Animated.timing(suggestionsOpacity, {
						toValue: 1,
						duration: 200,
						useNativeDriver: true,
					}).start();
				}
			} catch (error) {
				logger.app.error('Failed to fetch search suggestions', error);
				setSuggestions([]);
				suggestionsOpacity.setValue(0);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSuggestions();
	}, [debouncedSearchText, suggestionsOpacity]);

	const handleSuggestionPress = useCallback(
		async (suggestion: SearchSuggestion) => {
			if (hapticFeedback) {
				await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}
			onLocationSelected(suggestion.location, suggestion.name);
			onChangeText(suggestion.name);
			setSuggestions([]);
			Keyboard.dismiss();
		},
		[hapticFeedback, onChangeText, onLocationSelected]
	);

	const handleBlur = useCallback(() => {
		setIsFocused(false);
		// Delay hiding suggestions to allow press to register
		setTimeout(() => {
			Animated.timing(suggestionsOpacity, {
				toValue: 0,
				duration: 150,
				useNativeDriver: true,
			}).start(() => setSuggestions([]));
		}, 200);
	}, [suggestionsOpacity]);

	const handleFocus = useCallback(() => {
		setIsFocused(true);
	}, []);

	const isDropdown = suggestionsStyle === 'dropdown';
	const showAbove = isDropdown && suggestionsPlacement === 'above';

	return (
		<View style={[styles.container, containerStyle]}>
			{label && <Text style={styles.label}>{label}</Text>}
			<View style={[styles.inputContainer, inputContainerStyle]}>
				<Text style={styles.icon}>{icon}</Text>
				<TextInput
					style={styles.input}
					value={value}
					onChangeText={onChangeText}
					onFocus={handleFocus}
					onBlur={handleBlur}
					placeholder={placeholder}
					placeholderTextColor={COLORS.textSecondary}
					autoFocus={autoFocus}
					testID={testID}
				/>
				{isLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
			</View>

			{/* Empty state */}
			{isFocused &&
				showEmptyState &&
				!isLoading &&
				value.trim() &&
				suggestions.length === 0 && (
					<View
						style={[
							styles.emptyContainer,
							isDropdown && styles.suggestionsDropdown,
							showAbove && styles.suggestionsAbove,
						]}
					>
						<Text style={styles.emptyText}>Aucun résultat</Text>
					</View>
				)}

			{/* Suggestions list */}
			{isFocused && suggestions.length > 0 ? (
				<Animated.View
					style={[
						styles.suggestionsContainer,
						isDropdown && styles.suggestionsDropdown,
						showAbove && styles.suggestionsAbove,
						{ opacity: suggestionsOpacity },
					]}
				>
					{showTopSuggestionLabel ? (
						<Text style={styles.topSuggestionLabel}>
							Suggestion la plus probable
						</Text>
					) : null}
					{suggestions.slice(0, 4).map(suggestion => (
						<SuggestionItem
							key={suggestion.id}
							suggestion={suggestion}
							onPress={handleSuggestionPress}
						/>
					))}
				</Animated.View>
			) : null}
		</View>
	);
}

const SuggestionItem = memo(function SuggestionItem({
	suggestion,
	onPress,
}: {
	suggestion: SearchSuggestion;
	onPress: (suggestion: SearchSuggestion) => void | Promise<void>;
}) {
	const handlePress = useCallback(() => {
		onPress(suggestion);
	}, [onPress, suggestion]);

	return (
		<Pressable style={styles.suggestionItem} onPress={handlePress}>
			<Text style={styles.suggestionName}>{suggestion.name}</Text>
			{suggestion.description ? (
				<Text style={styles.suggestionDescription}>
					{suggestion.description}
				</Text>
			) : null}
		</Pressable>
	);
});

const styles = StyleSheet.create({
	container: {
		marginBottom: SPACING.lg,
		zIndex: 1,
		overflow: 'visible',
	},
	label: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: SPACING.sm,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		gap: SPACING.sm,
	},
	icon: {
		fontSize: SIZES.fontMd,
	},
	input: {
		flex: 1,
		fontSize: SIZES.fontMd,
		color: COLORS.text,
		padding: 0,
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
		backgroundColor: COLORS.background,
	},
	suggestionsDropdown: {
		position: 'absolute',
		top: '100%',
		left: 0,
		right: 0,
		borderRadius: SIZES.radiusMedium,
		marginTop: SPACING.xs,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 4,
		zIndex: 100,
	},
	suggestionsAbove: {
		top: undefined,
		bottom: '100%',
		marginTop: 0,
		marginBottom: SPACING.xs,
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
	topSuggestionLabel: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		paddingHorizontal: SPACING.md,
		paddingTop: SPACING.sm,
		paddingBottom: SPACING.xs,
		fontStyle: 'italic',
	},
});
