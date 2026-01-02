export const formatDate = (date: Date, locale: string = 'fr-FR'): string => {
	return new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
};

export const formatShortDate = (
	date: Date,
	locale: string = 'fr-FR'
): string => {
	return new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(date);
};
