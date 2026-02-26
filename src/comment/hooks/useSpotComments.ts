import { useCallback, useEffect, useState } from 'react';
import { toastUtils } from '../../components/ui';
import type { SpotId } from '../../spot/types';
import { logger } from '../../utils';
import { createComment, getCommentsBySpotId } from '../services';
import type { Comment, CommentAppreciation } from '../types';
import { generateCommentId } from '../utils';

interface CreateCommentInput {
	appreciation: CommentAppreciation;
	comment: string;
	createdBy?: string;
}

interface UseSpotCommentsReturn {
	comments: Comment[];
	isLoading: boolean;
	isSubmitting: boolean;
	refreshComments: () => Promise<void>;
	submitComment: (input: CreateCommentInput) => Promise<boolean>;
}

const DEFAULT_CREATED_BY = 'CurrentUser';

export const useSpotComments = (spotId: SpotId): UseSpotCommentsReturn => {
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
			toastUtils.error(
				'Chargement échoué',
				'Impossible de charger les commentaires de ce spot.'
			);
		} finally {
			setIsLoading(false);
		}
	}, [spotId]);

	const submitComment = useCallback(
		async ({ appreciation, comment, createdBy }: CreateCommentInput) => {
			const trimmedComment = comment.trim();
			if (!trimmedComment) {
				toastUtils.error(
					'Commentaire requis',
					'Ajoute un commentaire avant de valider.'
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
				createdBy: createdBy ?? DEFAULT_CREATED_BY,
			};

			setIsSubmitting(true);
			try {
				await createComment(newComment);
				setComments(previous => [newComment, ...previous]);
				toastUtils.success('Commentaire ajouté');
				return true;
			} catch (error) {
				logger.repository.error('Unable to create comment', error, {
					spotId,
				});
				toastUtils.error(
					'Ajout impossible',
					"Le commentaire n'a pas pu être enregistré."
				);
				return false;
			} finally {
				setIsSubmitting(false);
			}
		},
		[spotId]
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
