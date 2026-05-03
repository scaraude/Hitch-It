import { useCallback, useState } from 'react';
import type { CommentAppreciation } from '../../comment/types';
import { toastUtils } from '../../components/ui';
import { useTranslation } from '../../i18n/useTranslation';
import type { SpotDetailsCommentComposerState } from '../components/spotDetailsTypes';

interface SubmitCommentInput {
	appreciation: CommentAppreciation;
	comment: string;
}

interface UseSpotDetailsCommentComposerParams {
	submitComment: (input: SubmitCommentInput) => Promise<boolean>;
}

export const useSpotDetailsCommentComposer = ({
	submitComment,
}: UseSpotDetailsCommentComposerParams): SpotDetailsCommentComposerState => {
	const { t } = useTranslation();
	const [isWritingComment, setIsWritingComment] = useState(false);
	const [draftAppreciation, setDraftAppreciation] = useState<
		CommentAppreciation | undefined
	>(undefined);
	const [draftComment, setDraftComment] = useState('');

	const handleStartComment = useCallback(() => {
		setIsWritingComment(true);
	}, []);

	const handleCancelComment = useCallback(() => {
		setIsWritingComment(false);
		setDraftAppreciation(undefined);
		setDraftComment('');
	}, []);

	const handleSubmitComment = useCallback(async () => {
		if (draftAppreciation === undefined) {
			toastUtils.error(
				t('comment.appreciationRequired'),
				t('comment.appreciationRequiredMessage')
			);
			return;
		}

		const submitted = await submitComment({
			appreciation: draftAppreciation,
			comment: draftComment,
		});

		if (submitted) {
			handleCancelComment();
		}
	}, [draftAppreciation, draftComment, handleCancelComment, submitComment, t]);

	return {
		isWritingComment,
		draftAppreciation,
		draftComment,
		onStartComment: handleStartComment,
		onCancelComment: handleCancelComment,
		onSubmitComment: handleSubmitComment,
		onAppreciationChange: setDraftAppreciation,
		onCommentChange: setDraftComment,
	};
};
