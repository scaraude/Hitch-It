export enum Language {
	French = 'fr',
}

export type TranslationKey = keyof typeof import('./translations/fr').default;
