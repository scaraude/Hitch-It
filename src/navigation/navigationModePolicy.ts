export const NAVIGATION_MODES = {
	HITCHHIKING: 'hitchhiking',
} as const;

export type NavigationMode =
	(typeof NAVIGATION_MODES)[keyof typeof NAVIGATION_MODES];

export interface NavigationModePolicy {
	turnByTurnVoiceInstructionsEnabled: boolean;
	driverDirectionComparisonEnabled: boolean;
}

export const DEFAULT_NAVIGATION_MODE: NavigationMode =
	NAVIGATION_MODES.HITCHHIKING;

export const NAVIGATION_MODE_POLICIES: Record<
	NavigationMode,
	NavigationModePolicy
> = {
	[NAVIGATION_MODES.HITCHHIKING]: {
		// Hitchhiking mode is tracking-first, so guidance playback stays off.
		turnByTurnVoiceInstructionsEnabled: false,
		driverDirectionComparisonEnabled: false,
	},
};

export const getNavigationModePolicy = (
	mode: NavigationMode
): NavigationModePolicy => NAVIGATION_MODE_POLICIES[mode];
