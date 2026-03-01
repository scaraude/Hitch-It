import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import i18n from './i18n';
import type { Language } from './types';

const LANGUAGE_KEY = 'app_language';

export function useTranslation() {
	const [locale, setLocaleState] = useState(i18n.locale);

	// biome-ignore lint/correctness/useExhaustiveDependencies: locale is needed to trigger re-renders when language changes
	const t = useCallback(
		(key: string, options?: Record<string, string | number>) => {
			return i18n.t(key, options);
		},
		[locale]
	);

	const setLocale = useCallback(async (newLocale: Language) => {
		i18n.locale = newLocale;
		setLocaleState(newLocale);
		// Persist the language preference
		await SecureStore.setItemAsync(LANGUAGE_KEY, newLocale);
	}, []);

	return {
		t,
		locale,
		setLocale,
	};
}

// Initialize language from storage
export async function initializeLanguage() {
	try {
		const savedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);
		if (savedLanguage) {
			i18n.locale = savedLanguage;
		}
	} catch (error) {
		console.warn('Failed to load saved language preference:', error);
	}
}
