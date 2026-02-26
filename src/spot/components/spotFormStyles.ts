import { StyleSheet } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';

const FORM_MAX_HEIGHT = '80%';
const FORM_SCROLL_MAX_HEIGHT = 500;

export const spotFormStyles = StyleSheet.create({
	container: {
		maxHeight: FORM_MAX_HEIGHT,
	},
	formContent: {
		padding: SPACING.lg,
	},
	scrollView: {
		maxHeight: FORM_SCROLL_MAX_HEIGHT,
	},
	title: {
		fontSize: SIZES.font2Xl,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: SPACING.lg,
	},
	label: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
		marginTop: SPACING.md,
		marginBottom: SPACING.sm,
	},
	input: {
		borderWidth: 1,
		borderColor: COLORS.surface,
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		padding: SPACING.md,
		fontSize: SIZES.fontMd,
		color: COLORS.text,
	},
	directionGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING.sm,
	},
	directionButton: {
		width: '23%',
		paddingVertical: SPACING.sm,
		borderRadius: SIZES.radiusMedium,
		borderWidth: 1,
		borderColor: COLORS.surface,
		backgroundColor: COLORS.surface,
		alignItems: 'center',
	},
	directionButtonSelected: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	directionText: {
		fontSize: SIZES.fontXs,
		color: COLORS.text,
		fontWeight: '500',
	},
	directionTextSelected: {
		color: COLORS.background,
	},
	destinationList: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING.sm,
		marginTop: SPACING.sm,
	},
	commentSection: {
		marginTop: SPACING.lg,
	},
	actions: {
		flexDirection: 'row',
		gap: SPACING.md,
		marginTop: SPACING.lg,
	},
	button: {
		flex: 1,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
	},
	cancelButton: {
		backgroundColor: COLORS.surface,
	},
	cancelButtonText: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
	},
	submitButton: {
		backgroundColor: COLORS.primary,
	},
	submitButtonDisabled: {
		backgroundColor: COLORS.textSecondary,
	},
	submitButtonText: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.background,
	},
});
