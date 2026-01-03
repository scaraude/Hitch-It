export const APP_CONFIG = {
	name: 'Hitch It',
	version: '1.0.0',
	description: 'A modern React Native app for hitchhiking',
} as const;

export const COLORS = {
	primary: '#096396',
	secondary: '#4A90E2',
	success: '#4CAF50',
	warning: '#FF9800',
	error: '#F44336',
	danger: '#F44336',
	background: '#FFFFFF',
	surface: '#F5F5F5',
	text: '#212121',
	textSecondary: '#757575',
	textLight: '#FFFFFF',
	border: '#E0E0E0',
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

export { SIZES } from './sizes';
