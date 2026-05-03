import { StyleSheet } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';

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
	buttonGroup: {
		gap: SPACING.sm,
	},
	primaryButton: {
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
	},
	secondaryButton: {
		backgroundColor: COLORS.surface,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	buttonPressed: {
		opacity: 0.8,
	},
	primaryButtonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
	secondaryButtonText: {
		color: COLORS.text,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});
