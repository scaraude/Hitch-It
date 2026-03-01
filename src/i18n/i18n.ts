import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './translations/en';
import fr from './translations/fr';

const i18n = new I18n({
	en,
	fr,
});

// Set the locale once at the beginning of your app
i18n.locale = Localization.getLocales()[0]?.languageCode || 'en';

// Enable fallbacks for missing translations
i18n.enableFallback = true;

// Default locale
i18n.defaultLocale = 'en';

export default i18n;
