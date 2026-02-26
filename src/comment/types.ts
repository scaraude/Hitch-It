import type { SpotId } from '../spot/types';

export type CommentId = string & { readonly brand: unique symbol };

export enum CommentAppreciation {
	Perfect = 'perfect',
	Good = 'good',
	Bad = 'bad',
}

export interface Comment {
	id: CommentId;
	spotId: SpotId;
	appreciation: CommentAppreciation;
	comment: string;
	waitingTimeMinutes?: number;
	createdAt: Date;
	updatedAt: Date;
	createdBy: string;
}
