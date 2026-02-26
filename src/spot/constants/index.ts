import { Direction } from '../types';

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

export const DIRECTIONS = Object.values(Direction);
