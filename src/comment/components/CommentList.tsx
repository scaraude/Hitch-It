import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';
import { useTranslation } from '../../i18n';
import { formatDate } from '../../utils';
import { getCommentAppreciationConfig } from '../constants';
import type { Comment } from '../types';

interface CommentListProps {
	comments: Comment[];
}

export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
	const { t } = useTranslation();
	const commentAppreciationConfig = getCommentAppreciationConfig(t);

	if (comments.length === 0) {
		return <Text style={styles.emptyState}>{t('comment.noCommentsYet')}</Text>;
	}

	return (
		<View style={styles.list}>
			{comments.map(comment => {
				const appreciationConfig =
					commentAppreciationConfig[comment.appreciation];

				return (
					<View key={comment.id} style={styles.card}>
						<View style={styles.cardHeader}>
							<View style={styles.authorContainer}>
								<Text style={styles.author}>{comment.createdBy}</Text>
								<Text style={styles.metadata}>
									{formatDate(comment.createdAt)}
								</Text>
							</View>
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
						</View>
						<Text style={styles.comment}>{comment.comment}</Text>
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
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		gap: SPACING.sm,
	},
	authorContainer: {
		flexShrink: 1,
	},
	author: {
		color: COLORS.text,
		fontSize: SIZES.fontSm,
		fontWeight: '700',
	},
	appreciationBadge: {
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
		fontStyle: 'italic',
	},
	emptyState: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		fontStyle: 'italic',
	},
});
