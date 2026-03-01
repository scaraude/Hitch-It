import { COLORS } from '../../constants';
import type { TranslateFunction } from '../../i18n/types';
import { CommentAppreciation } from '../types';

export const getCommentAppreciationConfig = (
	t: TranslateFunction
): Record<
	CommentAppreciation,
	{ label: string; color: string; emoji: string }
> => ({
	[CommentAppreciation.Perfect]: {
		label: t('comment.appreciationExcellent'),
		color: COLORS.success,
		emoji: '🎯',
	},
	[CommentAppreciation.Good]: {
		label: t('comment.appreciationGood'),
		color: COLORS.primary,
		emoji: '👍',
	},
	[CommentAppreciation.Bad]: {
		label: t('comment.appreciationBad'),
		color: COLORS.error,
		emoji: '👎',
	},
});

export const COMMENT_APPRECIATIONS = Object.values(CommentAppreciation);
