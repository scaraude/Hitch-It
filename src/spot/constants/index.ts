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

export const DIRECTION_HEADING_DEGREES: Record<Direction, number> = {
	[Direction.North]: 0,
	[Direction.NorthEast]: 45,
	[Direction.East]: 90,
	[Direction.SouthEast]: 135,
	[Direction.South]: 180,
	[Direction.SouthWest]: 225,
	[Direction.West]: 270,
	[Direction.NorthWest]: 315,
};

export const DIRECTIONS = Object.values(Direction);
