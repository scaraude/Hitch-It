export const APP_CONFIG = {
	name: 'Hitch It',
	version: '1.0.0',
	description: 'A modern React Native app for hitchhiking',
} as const;

const BRAND = {
	sunbeam: '#FFB703',
	sunbeamTint: '#FFCB47',
	sunbeamDeep: '#E09600',
	ink: '#1B2A41',
	inkSoft: '#5A6472',
	petrol: '#0F6E72',
	petrolTint: '#E2F0F0',
	coral: '#FB5343',
} as const;

export const COLORS = {
	// Brand palette (canonical — Brand Book v1 "Sunbeam & Petrol")
	...BRAND,
	// Role tokens (Brand Book v1)
	action: BRAND.sunbeam,
	onAction: BRAND.ink,
	accent: BRAND.petrol,
	// Semantic aliases — existing consumer keys keep working
	primary: BRAND.petrol,
	secondary: '#2D7DD2',
	success: '#2E9E5B',
	warning: '#E8810C',
	error: '#E5484D',
	errorTint: 'rgba(229, 72, 77, 0.1)',
	danger: '#E5484D',
	info: '#2D7DD2',
	background: '#FFFDF9',
	surface: '#F6F3EC',
	text: BRAND.ink,
	textSecondary: BRAND.inkSoft,
	textLight: '#FFFFFF',
	border: '#E9E5DC',
	navigationRoutePassed: BRAND.inkSoft,
} as const;

export const MAP_CONFIG = {
	defaultRegion: {
		latitude: 45.75500275139512,
		longitude: 4.840276964527021,
		latitudeDelta: 0.0922,
		longitudeDelta: 0.0421,
	},
	defaultMarkerColor: COLORS.primary,
} as const;

export const SPACING = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	xxl: 48,
} as const;

export const FONTS = {
	// Fredoka — headings & display (Brand Book v1)
	heading: 'Fredoka_500Medium',
	headingSemiBold: 'Fredoka_600SemiBold',
	// Nunito Sans — body copy (Brand Book v1)
	body: 'NunitoSans_400Regular',
	bodyMedium: 'NunitoSans_500Medium',
	bodySemiBold: 'NunitoSans_600SemiBold',
	bodyBold: 'NunitoSans_700Bold',
} as const;

export const TYPOGRAPHY = {
	display: { fontFamily: FONTS.headingSemiBold, fontSize: 32, lineHeight: 40 },
	title: { fontFamily: FONTS.headingSemiBold, fontSize: 24, lineHeight: 32 },
	heading: { fontFamily: FONTS.heading, fontSize: 20, lineHeight: 28 },
	body: { fontFamily: FONTS.body, fontSize: 16, lineHeight: 24 },
	label: { fontFamily: FONTS.bodySemiBold, fontSize: 14, lineHeight: 20 },
	caption: { fontFamily: FONTS.body, fontSize: 12, lineHeight: 16 },
} as const;

export { SIZES } from './sizes';
