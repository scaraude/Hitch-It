export enum Language {
	French = 'fr',
}

export type TranslationKey = keyof typeof import('./translations/fr').default;

export type TranslateFunction = (
	key: string,
	options?: Record<string, string | number>
) => string;
