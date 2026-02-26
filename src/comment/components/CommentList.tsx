import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';
import { formatDate } from '../../utils';
import { COMMENT_APPRECIATION_CONFIG } from '../constants';
import type { Comment } from '../types';

interface CommentListProps {
	comments: Comment[];
}

export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
	if (comments.length === 0) {
		return (
			<Text style={styles.emptyState}>Aucun commentaire pour le moment</Text>
		);
	}

	return (
		<View style={styles.list}>
			{comments.map(comment => {
				const appreciationConfig =
					COMMENT_APPRECIATION_CONFIG[comment.appreciation];

				return (
					<View key={comment.id} style={styles.card}>
						<View
							style={[
								styles.appreciationBadge,
								{ backgroundColor: appreciationConfig.color },
							]}
						>
							<Text style={styles.appreciationText}>
								{appreciationConfig.emoji} {appreciationConfig.label}
							</Text>
						</View>
						<Text style={styles.comment}>{comment.comment}</Text>
						<Text style={styles.metadata}>
							Par {comment.createdBy} • {formatDate(comment.createdAt)}
						</Text>
					</View>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	list: {
		gap: SPACING.md,
	},
	card: {
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		padding: SPACING.md,
		gap: SPACING.sm,
	},
	appreciationBadge: {
		alignSelf: 'flex-start',
		borderRadius: SIZES.radiusRound,
		paddingVertical: SPACING.xs,
		paddingHorizontal: SPACING.sm,
	},
	appreciationText: {
		color: COLORS.background,
		fontSize: SIZES.fontXs,
		fontWeight: '700',
	},
	comment: {
		color: COLORS.text,
		fontSize: SIZES.fontSm,
		lineHeight: 20,
	},
	metadata: {
		color: COLORS.textSecondary,
		fontSize: SIZES.fontXs,
	},
	emptyState: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		fontStyle: 'italic',
	},
});
