import { COLORS } from '../../constants';
import { Appreciation, Direction } from '../types';

export const APPRECIATION_CONFIG: Record<
	Appreciation,
	{ label: string; color: string; emoji: string }
> = {
	[Appreciation.Perfect]: {
		label: 'Parfait',
		color: COLORS.success,
		emoji: '🎯',
	},
	[Appreciation.Good]: { label: 'Bon', color: COLORS.primary, emoji: '👍' },
	[Appreciation.Bad]: { label: 'Mauvais', color: COLORS.error, emoji: '👎' },
};

export const DIRECTION_CONFIG: Record<Direction, { emoji: string }> = {
	[Direction.North]: { emoji: '⬆️' },
	[Direction.NorthEast]: { emoji: '↗️' },
	[Direction.East]: { emoji: '➡️' },
	[Direction.SouthEast]: { emoji: '↘️' },
	[Direction.South]: { emoji: '⬇️' },
	[Direction.SouthWest]: { emoji: '↙️' },
	[Direction.West]: { emoji: '⬅️' },
	[Direction.NorthWest]: { emoji: '↖️' },
};

export const APPRECIATIONS = Object.values(Appreciation);
export const DIRECTIONS = Object.values(Direction);
