import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import type { SearchSuggestion } from '../services/geocodingService';
import { searchPlaces } from '../services/geocodingService';
import { logger } from '../utils/logger';
import { useDebouncedValue } from './useDebouncedValue';

interface UsePlaceSuggestionsArgs {
	searchText: string;
	disabled?: boolean;
}

interface UsePlaceSuggestionsReturn {
	suggestions: SearchSuggestion[];
	isLoading: boolean;
	suggestionsOpacity: Animated.Value;
	clearSuggestions: () => void;
}

export const usePlaceSuggestions = ({
	searchText,
	disabled = false,
}: UsePlaceSuggestionsArgs): UsePlaceSuggestionsReturn => {
	const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const suggestionsOpacity = useRef(new Animated.Value(0)).current;

	const debouncedSearchText = useDebouncedValue(searchText, 300);

	useEffect(() => {
		let isMounted = true;

		const fetchSuggestions = async () => {
			if (disabled) {
				if (isMounted) {
					setIsLoading(false);
					setSuggestions([]);
					suggestionsOpacity.setValue(0);
				}
				return;
			}

			if (!debouncedSearchText.trim()) {
				if (isMounted) {
					setSuggestions([]);
					suggestionsOpacity.setValue(0);
				}
				return;
			}

			if (isMounted) {
				setIsLoading(true);
			}

			try {
				const results = await searchPlaces(debouncedSearchText);
				if (!isMounted) return;

				setSuggestions(results);
				if (results.length > 0) {
					Animated.timing(suggestionsOpacity, {
						toValue: 1,
						duration: 200,
						useNativeDriver: true,
					}).start();
				}
			} catch (error) {
				if (!isMounted) return;

				logger.app.error('Failed to fetch search suggestions', error);
				setSuggestions([]);
				suggestionsOpacity.setValue(0);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void fetchSuggestions();

		return () => {
			isMounted = false;
		};
	}, [debouncedSearchText, disabled, suggestionsOpacity]);

	const clearSuggestions = () => {
		Animated.timing(suggestionsOpacity, {
			toValue: 0,
			duration: 150,
			useNativeDriver: true,
		}).start(() => setSuggestions([]));
	};

	return {
		suggestions,
		isLoading,
		suggestionsOpacity,
		clearSuggestions,
	};
};
