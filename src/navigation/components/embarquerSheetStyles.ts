import { StyleSheet } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';

const SHEET_MAX_HEIGHT = '60%';
const GO_BUTTON_WIDTH = 64;
const GO_BUTTON_HEIGHT = 36;

export const embarquerSheetStyles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1100,
	},
	sheet: {
		position: 'absolute',
		left: 0,
		right: 0,
		maxHeight: SHEET_MAX_HEIGHT,
		backgroundColor: COLORS.background,
		borderBottomLeftRadius: SIZES.radiusXLarge,
		borderBottomRightRadius: SIZES.radiusXLarge,
		borderWidth: 1,
		borderColor: COLORS.border,
		paddingHorizontal: SPACING.md,
		paddingTop: SPACING.md,
		paddingBottom: SPACING.lg,
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 6,
	},
	closeButton: {
		alignSelf: 'flex-end',
		width: SIZES.iconMd + SPACING.xs,
		height: SIZES.iconMd + SPACING.xs,
		borderRadius: SIZES.radiusRound,
		backgroundColor: COLORS.surface,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: SPACING.sm,
	},
	form: {
		gap: SPACING.sm,
	},
	field: {
		gap: SPACING.xs,
	},
	swapButtonContainer: {
		alignItems: 'center',
	},
	startInputLayer: {
		zIndex: 2,
	},
	destinationInputLayer: {
		zIndex: 1,
	},
	addressInputContainer: {
		marginBottom: 0,
	},
	addressInputField: {
		paddingVertical: SPACING.xs,
	},
	positionButton: {
		alignSelf: 'flex-end',
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING.xs,
		paddingHorizontal: SPACING.sm,
		paddingVertical: SPACING.xs,
		borderRadius: SIZES.radiusMedium,
		backgroundColor: COLORS.surface,
	},
	positionButtonPressed: {
		opacity: 0.75,
	},
	positionButtonDisabled: {
		opacity: 0.55,
	},
	positionButtonText: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.primary,
	},
	positionButtonTextDisabled: {
		color: COLORS.textSecondary,
	},
	goButton: {
		alignSelf: 'flex-end',
		width: GO_BUTTON_WIDTH,
		height: GO_BUTTON_HEIGHT,
		borderRadius: SIZES.radiusRound,
		marginTop: SPACING.md,
		backgroundColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 3,
	},
	goButtonPressed: {
		opacity: 0.85,
	},
	goButtonDisabled: {
		backgroundColor: COLORS.surface,
	},
	goButtonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '700',
		textTransform: 'lowercase',
	},
	goButtonTextDisabled: {
		color: COLORS.textSecondary,
	},
});
