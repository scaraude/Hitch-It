import type { Comment, CommentAppreciation } from '../../comment/types';
import type { Spot } from '../types';

export interface SpotDetailsSheetProps {
	spot: Spot;
	onClose: () => void;
}

export interface SpotDetailsHeaderSectionProps {
	spotTitle: string;
	streetViewIcon: number;
	onOpenStreetView: () => void;
	onOpenItinerary: () => void;
}

export interface SpotDetailsSummarySectionProps {
	directionHeading: number;
	directionLabel: string;
	waitingTimeLabel: string;
	waitingRecordsLabel: string;
	destinationsLabel: string;
}

export interface SpotDetailsCommentComposerState {
	isWritingComment: boolean;
	draftAppreciation: CommentAppreciation | undefined;
	draftComment: string;
	onStartComment: () => void;
	onCancelComment: () => void;
	onSubmitComment: () => Promise<void>;
	onAppreciationChange: (value: CommentAppreciation | undefined) => void;
	onCommentChange: (value: string) => void;
}

export interface SpotDetailsCommentComposerModel
	extends SpotDetailsCommentComposerState {
	isSubmitting: boolean;
}

export interface SpotDetailsCommentsSectionProps {
	isLoading: boolean;
	comments: Comment[];
	composer: SpotDetailsCommentComposerModel;
}
