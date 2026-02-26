import { StyleSheet } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';

const HANDLE_INDICATOR_WIDTH = 76;
const HANDLE_INDICATOR_HEIGHT = 6;
const HANDLE_INDICATOR_OPACITY = 0.65;

export const spotDetailsSheetStyles = StyleSheet.create({
	sheetContainer: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 5,
	},
	sheetBackground: {
		backgroundColor: COLORS.background,
		borderTopLeftRadius: SIZES.radiusXLarge,
		borderTopRightRadius: SIZES.radiusXLarge,
	},
	sheetBackgroundExpanded: {
		borderTopLeftRadius: SIZES.radiusLarge,
		borderTopRightRadius: SIZES.radiusLarge,
	},
	handle: {
		paddingTop: SPACING.sm,
		paddingBottom: SPACING.md,
	},
	handleIndicator: {
		width: HANDLE_INDICATOR_WIDTH,
		height: HANDLE_INDICATOR_HEIGHT,
		borderRadius: SIZES.radiusRound,
		backgroundColor: COLORS.textSecondary,
		opacity: HANDLE_INDICATOR_OPACITY,
	},
	content: {
		paddingHorizontal: SPACING.lg,
	},
	contentContainer: {
		paddingBottom: SPACING.xl,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: SPACING.lg,
	},
	title: {
		fontSize: SIZES.font2Xl,
		fontWeight: '700',
		color: COLORS.text,
		flexShrink: 1,
		paddingRight: SPACING.md,
	},
	topActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING.sm,
	},
	topActionButton: {
		width: SIZES.fabSize - SPACING.sm,
		height: SIZES.fabSize - SPACING.sm,
		borderRadius: SIZES.radiusRound,
		backgroundColor: COLORS.background,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 5,
	},
	topActionButtonDisabled: {
		opacity: 0.8,
	},
	primaryTopActionButton: {
		backgroundColor: COLORS.secondary,
	},
	streetViewIcon: {
		width: SIZES.iconMd,
		height: SIZES.iconMd,
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: SPACING.md,
	},
	summaryBlock: {
		flex: 1,
	},
	waitingBlock: {
		alignItems: 'flex-start',
	},
	label: {
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
		marginBottom: SPACING.xs,
	},
	directionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING.sm,
	},
	value: {
		fontSize: SIZES.font2Xl,
		color: COLORS.text,
		fontWeight: '500',
	},
	waitingValue: {
		fontSize: SIZES.font2Xl,
		color: COLORS.text,
		fontWeight: '500',
	},
	waitingRecords: {
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
		marginTop: SPACING.xs,
	},
	dataSection: {
		marginTop: SPACING.lg,
	},
	commentsSection: {
		marginTop: SPACING.lg,
		gap: SPACING.sm,
	},
	loadingComments: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		fontStyle: 'italic',
	},
	addCommentButton: {
		backgroundColor: COLORS.surface,
		paddingVertical: SPACING.md,
		paddingHorizontal: SPACING.lg,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
	},
	addCommentButtonText: {
		fontSize: SIZES.fontSm,
		color: COLORS.primary,
		fontWeight: '600',
	},
	commentComposer: {
		padding: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		backgroundColor: COLORS.surface,
		gap: SPACING.md,
	},
	commentComposerActions: {
		flexDirection: 'row',
		gap: SPACING.sm,
	},
	commentComposerButton: {
		flex: 1,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
	},
	cancelCommentButton: {
		backgroundColor: COLORS.background,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	submitCommentButton: {
		backgroundColor: COLORS.primary,
	},
	cancelCommentText: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.text,
	},
	submitCommentText: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.background,
	},
});
