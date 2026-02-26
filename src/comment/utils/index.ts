import * as Crypto from 'expo-crypto';
import type { CommentId } from '../types';

export const createCommentId = (id: string): CommentId => id as CommentId;
export const generateCommentId = (): CommentId =>
	Crypto.randomUUID() as CommentId;
