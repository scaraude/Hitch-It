import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants';

export const sheetStyles = StyleSheet.create({
	container: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 5,
	},
	background: {
		backgroundColor: COLORS.background,
		borderTopLeftRadius: SIZES.radiusXLarge,
		borderTopRightRadius: SIZES.radiusXLarge,
	},
	defaultHandleIndicator: {
		backgroundColor: COLORS.surface,
	},
});
