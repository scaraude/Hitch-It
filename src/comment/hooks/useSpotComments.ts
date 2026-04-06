import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth';
import { toastUtils } from '../../components/ui';
import { useTranslation } from '../../i18n/useTranslation';
import type { SpotId } from '../../spot/types';
import { logger } from '../../utils';
import { createComment, getCommentsBySpotId } from '../services';
import type { Comment, CommentAppreciation } from '../types';
import { generateCommentId } from '../utils';

interface CreateCommentInput {
	appreciation: CommentAppreciation;
	comment: string;
}

interface UseSpotCommentsReturn {
	comments: Comment[];
	isLoading: boolean;
	isSubmitting: boolean;
	refreshComments: () => Promise<void>;
	submitComment: (input: CreateCommentInput) => Promise<boolean>;
}

export const useSpotComments = (spotId: SpotId): UseSpotCommentsReturn => {
	const { user, isAuthenticated } = useAuth();
	const { t } = useTranslation();
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const refreshComments = useCallback(async () => {
		setIsLoading(true);
		try {
			const nextComments = await getCommentsBySpotId(spotId);
			setComments(nextComments);
		} catch (error) {
			logger.repository.error('Unable to load comments for spot', error, {
				spotId,
			});
			toastUtils.error(t('comment.loadError'), t('comment.loadErrorMessage'));
		} finally {
			setIsLoading(false);
		}
	}, [spotId, t]);

	const submitComment = useCallback(
		async ({ appreciation, comment }: CreateCommentInput) => {
			const trimmedComment = comment.trim();
			if (!trimmedComment) {
				toastUtils.error(
					t('comment.commentRequired'),
					t('comment.commentRequiredMessage')
				);
				return false;
			}

			if (!isAuthenticated || !user) {
				toastUtils.error(
					t('comment.authRequired'),
					t('comment.authRequiredMessage')
				);
				return false;
			}

			const now = new Date();
			const newComment: Comment = {
				id: generateCommentId(),
				spotId,
				appreciation,
				comment: trimmedComment,
				createdAt: now,
				updatedAt: now,
				createdByUserId: user.id,
				authorUsername: user.username.trim() || null,
			};

			setIsSubmitting(true);
			try {
				await createComment(newComment);
				setComments(previous => [newComment, ...previous]);
				toastUtils.success(t('comment.commentAdded'));
				return true;
			} catch (error) {
				logger.repository.error('Unable to create comment', error, {
					spotId,
				});
				toastUtils.error(t('comment.addError'), t('comment.addErrorMessage'));
				return false;
			} finally {
				setIsSubmitting(false);
			}
		},
		[isAuthenticated, spotId, t, user]
	);

	useEffect(() => {
		void refreshComments();
	}, [refreshComments]);

	return {
		comments,
		isLoading,
		isSubmitting,
		refreshComments,
		submitComment,
	};
};
