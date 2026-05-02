import type { CachedJourneyId, UserId } from '../../types';

/**
 * State machine for a cached live-recording session.
 *
 * Modeled as a discriminated union so TypeScript enforces transitions at
 * compile time: e.g. `finalize(recordingState)` is rejected because
 * `finalize` only accepts a `Stopped` state. Cumulative timestamps stay
 * coherent with the status they imply.
 */

interface Common {
	id: CachedJourneyId;
	userId: UserId;
	startedAt: Date;
}

export interface RecordingState extends Common {
	status: 'recording';
}

export interface PausedState extends Common {
	status: 'paused';
}

export interface StoppedState extends Common {
	status: 'stopped';
	stoppedAt: Date;
}

export interface FinalizedState extends Common {
	status: 'finalized';
	stoppedAt: Date;
	finalizedAt: Date;
}

export type CachedJourneyState =
	| RecordingState
	| PausedState
	| StoppedState
	| FinalizedState;

// =============================================================================
// Transitions — the only allowed way to mutate a cached journey state
// =============================================================================

export const startRecording = (input: {
	id: CachedJourneyId;
	userId: UserId;
	startedAt: Date;
}): RecordingState => ({
	status: 'recording',
	id: input.id,
	userId: input.userId,
	startedAt: input.startedAt,
});

export const pause = (state: RecordingState): PausedState => ({
	status: 'paused',
	id: state.id,
	userId: state.userId,
	startedAt: state.startedAt,
});

export const resume = (state: PausedState): RecordingState => ({
	status: 'recording',
	id: state.id,
	userId: state.userId,
	startedAt: state.startedAt,
});

export const stop = (
	state: RecordingState | PausedState,
	stoppedAt: Date
): StoppedState => ({
	status: 'stopped',
	id: state.id,
	userId: state.userId,
	startedAt: state.startedAt,
	stoppedAt,
});

export const finalize = (
	state: StoppedState,
	finalizedAt: Date
): FinalizedState => ({
	status: 'finalized',
	id: state.id,
	userId: state.userId,
	startedAt: state.startedAt,
	stoppedAt: state.stoppedAt,
	finalizedAt,
});

// =============================================================================
// SQLite row serialization — kept here so the only producers/consumers of
// raw rows go through the state machine.
// =============================================================================

export interface CachedJourneyRow {
	id: string;
	user_id: string;
	status: string;
	started_at: string;
	stopped_at: string | null;
	finalized_at: string | null;
}

export const toRow = (state: CachedJourneyState): CachedJourneyRow => {
	const base = {
		id: state.id as string,
		user_id: state.userId as string,
		status: state.status,
		started_at: state.startedAt.toISOString(),
	};

	if (state.status === 'finalized') {
		return {
			...base,
			stopped_at: state.stoppedAt.toISOString(),
			finalized_at: state.finalizedAt.toISOString(),
		};
	}

	if (state.status === 'stopped') {
		return {
			...base,
			stopped_at: state.stoppedAt.toISOString(),
			finalized_at: null,
		};
	}

	return { ...base, stopped_at: null, finalized_at: null };
};

class InconsistentCachedJourneyRowError extends Error {
	constructor(reason: string, row: CachedJourneyRow) {
		super(
			`Inconsistent cached_journeys row (id=${row.id}): ${reason}. ` +
				`Row: ${JSON.stringify(row)}`
		);
		this.name = 'InconsistentCachedJourneyRowError';
	}
}

export const fromRow = (row: CachedJourneyRow): CachedJourneyState => {
	const id = row.id as CachedJourneyId;
	const userId = row.user_id as UserId;
	const startedAt = new Date(row.started_at);

	switch (row.status) {
		case 'recording':
		case 'paused':
			if (row.stopped_at !== null || row.finalized_at !== null) {
				throw new InconsistentCachedJourneyRowError(
					`status='${row.status}' must have null stopped_at and finalized_at`,
					row
				);
			}
			return { status: row.status, id, userId, startedAt };

		case 'stopped':
			if (row.stopped_at === null) {
				throw new InconsistentCachedJourneyRowError(
					"status='stopped' requires stopped_at",
					row
				);
			}
			if (row.finalized_at !== null) {
				throw new InconsistentCachedJourneyRowError(
					"status='stopped' must have null finalized_at",
					row
				);
			}
			return {
				status: 'stopped',
				id,
				userId,
				startedAt,
				stoppedAt: new Date(row.stopped_at),
			};

		case 'finalized':
			if (row.stopped_at === null || row.finalized_at === null) {
				throw new InconsistentCachedJourneyRowError(
					"status='finalized' requires both stopped_at and finalized_at",
					row
				);
			}
			return {
				status: 'finalized',
				id,
				userId,
				startedAt,
				stoppedAt: new Date(row.stopped_at),
				finalizedAt: new Date(row.finalized_at),
			};

		default:
			throw new InconsistentCachedJourneyRowError(
				`unknown status '${row.status}'`,
				row
			);
	}
};

export { InconsistentCachedJourneyRowError };
