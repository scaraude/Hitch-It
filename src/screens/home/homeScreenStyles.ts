import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const homeScreenStyles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	mapContainer: {
		flex: 1,
	},
	nonMapOverlay: {
		...StyleSheet.absoluteFillObject,
	},
	centerMarker: {
		position: 'absolute',
		left: '50%',
		top: '50%',
		marginLeft: -9,
		marginTop: -9,
		alignItems: 'center',
	},
	markerPin: {
		width: 18,
		height: 18,
		backgroundColor: COLORS.secondary,
		borderRadius: 12,
		borderWidth: 3,
		borderColor: COLORS.background,
	},
	longPressPin: {
		width: 24,
		height: 24,
		backgroundColor: COLORS.primary,
		borderRadius: 12,
		borderWidth: 3,
		borderColor: COLORS.background,
	},
	longPressEmbarquerButton: {
		position: 'absolute',
		left: 16,
		right: 16,
		backgroundColor: '#539DF3',
		paddingVertical: 14,
		borderRadius: 16,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 4,
	},
	longPressEmbarquerButtonPressed: {
		opacity: 0.8,
	},
	longPressEmbarquerButtonText: {
		color: COLORS.background,
		fontSize: 16,
		fontWeight: '700',
		letterSpacing: 0.3,
	},
});
