/**
 * Root navigation stack parameter list
 * Defines the screens and their params for type-safe navigation
 */
export type RootStackParamList = {
	Home: undefined;
	// Future screens can be added here:
	// SpotDetails: { spotId: SpotId };
	// Profile: { userId: string };
	// Settings: undefined;
};

/**
 * Type helpers for navigation props
 */
declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}
