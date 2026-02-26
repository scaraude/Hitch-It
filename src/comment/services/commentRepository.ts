import { supabase } from '@/lib/supabaseClient';
import type { SpotId } from '@/spot/types';
import { logger } from '@/utils';
import { type Comment, CommentAppreciation } from '../types';
import { createCommentId } from '../utils';

type CommentRow = {
	id: string;
	spot_id: string;
	appreciation: string;
	comment: string;
	wait_time_minutes?: number | null;
	created_by: string;
	created_at: string;
	updated_at: string;
};

const commentAppreciationValues = new Set(Object.values(CommentAppreciation));

const parseCommentAppreciation = (
	value: string,
	commentId: string
): Comment['appreciation'] => {
	if (commentAppreciationValues.has(value as CommentAppreciation)) {
		return value as Comment['appreciation'];
	}

	throw new Error(
		`Invalid comment appreciation "${value}" for comment "${commentId}"`
	);
};

const parseCommentText = (value: string, commentId: string): string => {
	const trimmedComment = value.trim();

	if (!trimmedComment) {
		throw new Error(`Comment "${commentId}" is missing a comment`);
	}

	return trimmedComment;
};

const parseWaitingTimeMinutes = (
	value: number | null | undefined,
	commentId: string
): number | undefined => {
	if (value === null || value === undefined) {
		return undefined;
	}

	if (!Number.isFinite(value) || value < 0) {
		throw new Error(
			`Invalid waiting time "${value}" for comment "${commentId}"`
		);
	}

	return Math.round(value);
};

const mapRowToComment = (row: CommentRow): Comment => ({
	id: createCommentId(row.id),
	spotId: row.spot_id as SpotId,
	appreciation: parseCommentAppreciation(row.appreciation, row.id),
	comment: parseCommentText(row.comment, row.id),
	waitingTimeMinutes: parseWaitingTimeMinutes(row.wait_time_minutes, row.id),
	createdAt: new Date(row.created_at),
	updatedAt: new Date(row.updated_at),
	createdBy: row.created_by,
});

export const getCommentsBySpotId = async (
	spotId: SpotId
): Promise<Comment[]> => {
	logger.repository.debug('Fetching comments by spot ID', { spotId });

	try {
		const { data, error } = await supabase
			.from('comments')
			.select('*')
			.eq('spot_id', spotId)
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		const comments = (data ?? []).map(row =>
			mapRowToComment(row as CommentRow)
		);

		logger.repository.info('Comments fetched successfully', {
			spotId,
			count: comments.length,
		});

		return comments;
	} catch (error) {
		logger.repository.error('Failed to fetch comments by spot ID', error, {
			spotId,
		});
		throw error;
	}
};

export const createComment = async (comment: Comment): Promise<void> => {
	logger.repository.info('Creating comment', {
		commentId: comment.id,
		spotId: comment.spotId,
		appreciation: comment.appreciation,
	});

	try {
		const { error } = await supabase.from('comments').insert({
			id: comment.id,
			spot_id: comment.spotId,
			appreciation: comment.appreciation,
			comment: comment.comment,
			created_by: comment.createdBy,
			created_at: comment.createdAt.toISOString(),
			updated_at: comment.updatedAt.toISOString(),
		});

		if (error) {
			throw error;
		}

		logger.repository.info('Comment created successfully', {
			commentId: comment.id,
		});
	} catch (error) {
		logger.repository.error('Failed to create comment', error, {
			commentId: comment.id,
		});
		throw error;
	}
};
