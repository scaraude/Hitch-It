import { COLORS } from '../../constants';
import { CommentAppreciation } from '../types';

export const COMMENT_APPRECIATION_CONFIG: Record<
	CommentAppreciation,
	{ label: string; color: string; emoji: string }
> = {
	[CommentAppreciation.Perfect]: {
		label: 'Parfait',
		color: COLORS.success,
		emoji: '🎯',
	},
	[CommentAppreciation.Good]: {
		label: 'Bon',
		color: COLORS.primary,
		emoji: '👍',
	},
	[CommentAppreciation.Bad]: {
		label: 'Mauvais',
		color: COLORS.error,
		emoji: '👎',
	},
};

export const COMMENT_APPRECIATIONS = Object.values(CommentAppreciation);
