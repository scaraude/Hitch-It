import type { CommentAppreciation } from '../comment/types';
import type { Direction } from './types';

export interface SpotFormData {
	appreciation: CommentAppreciation;
	comment: string;
	roadName: string;
	direction: Direction;
	destinations: string[];
}
