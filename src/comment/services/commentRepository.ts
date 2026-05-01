import type { UserId } from '@/auth/types';
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
	created_by_user_id: string;
	created_at: string;
	updated_at: string;
	author?:
		| Array<{
				username: string | null;
		  }>
		| {
				username: string | null;
		  }
		| null;
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


const resolveAuthorUsername = (author: CommentRow['author']): string | null => {
	if (!author) {
		return null;
	}

	if (Array.isArray(author)) {
		return author[0]?.username ?? null;
	}

	return author.username ?? null;
};

const mapRowToComment = (row: CommentRow): Comment => ({
	id: createCommentId(row.id),
	spotId: row.spot_id as SpotId,
	appreciation: parseCommentAppreciation(row.appreciation, row.id),
	comment: parseCommentText(row.comment, row.id),
	createdAt: new Date(row.created_at),
	updatedAt: new Date(row.updated_at),
	createdBy: row.created_by_user_id as UserId,
	authorUsername: resolveAuthorUsername(row.author),
});

const fetchCommentRows = async (spotId: SpotId): Promise<CommentRow[]> => {
	const joinedQuery = await supabase
		.from('comments')
		.select(
			'id, spot_id, appreciation, comment, created_by_user_id, created_at, updated_at, author:profiles!comments_created_by_user_id_fkey(username)'
		)
		.eq('spot_id', spotId)
		.order('created_at', { ascending: false });

	if (!joinedQuery.error) {
		return (joinedQuery.data ?? []) as CommentRow[];
	}

	logger.repository.warn(
		'Failed to fetch comments with author join, retrying without author profile',
		{ spotId, error: joinedQuery.error }
	);

	const fallbackQuery = await supabase
		.from('comments')
		.select(
			'id, spot_id, appreciation, comment, created_by_user_id, created_at, updated_at'
		)
		.eq('spot_id', spotId)
		.order('created_at', { ascending: false });

	if (fallbackQuery.error) {
		throw fallbackQuery.error;
	}

	return (fallbackQuery.data ?? []) as CommentRow[];
};

export const getCommentsBySpotId = async (
	spotId: SpotId
): Promise<Comment[]> => {
	logger.repository.debug('Fetching comments by spot ID', { spotId });

	try {
		const rows = await fetchCommentRows(spotId);
		const comments = rows.map(mapRowToComment);

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
			created_by_user_id: comment.createdBy,
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
