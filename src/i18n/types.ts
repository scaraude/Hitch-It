export enum Language {
	English = 'en',
	French = 'fr',
	German = 'de',
	Spanish = 'es',
	Italian = 'it',
}

export type TranslationKey = keyof typeof import('./translations/fr').default;

export type TranslateFunction = (
	key: string,
	options?: Record<string, string | number>
) => string;
