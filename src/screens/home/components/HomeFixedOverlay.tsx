import type React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	BottomNavBar,
	MapControls,
	SearchBarOverlay,
} from '../../../components';
import { NavigationHeader } from '../../../navigation/components';
import type { NavigationRoute } from '../../../navigation/types';
import type { Location } from '../../../types';
import { homeScreenStyles as styles } from '../homeScreenStyles';
import type { HomeTabId } from '../types';

interface HomeFixedOverlayProps {
	isNavigationActive: boolean;
	navigationRoute: NavigationRoute | null;
	canUseSearch: boolean;
	isSearchOpen: boolean;
	searchText: string;
	shouldShowSearchEmbarquer: boolean;
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	mapHeading: number;
	isFollowingUser: boolean;
	shouldShowBottomBar: boolean;
	longPressMarker: Location | null;
	onStopNavigation: () => void;
	onSearchTextChange: (text: string) => void;
	onSearchLocationSelected: (location: Location, name: string) => void;
	onSearchToggle: () => void;
	onSearchEmbarquer: () => void;
	onResetHeading: () => void;
	onLocateUser: () => void;
	onLongPressEmbarquer: () => void;
	onTabPress: (tabId: HomeTabId) => void;
}

export const HomeFixedOverlay: React.FC<HomeFixedOverlayProps> = ({
	isNavigationActive,
	navigationRoute,
	canUseSearch,
	isSearchOpen,
	searchText,
	shouldShowSearchEmbarquer,
	isPlacingSpot,
	isShowingForm,
	mapHeading,
	isFollowingUser,
	shouldShowBottomBar,
	longPressMarker,
	onStopNavigation,
	onSearchTextChange,
	onSearchLocationSelected,
	onSearchToggle,
	onSearchEmbarquer,
	onResetHeading,
	onLocateUser,
	onLongPressEmbarquer,
	onTabPress,
}) => {
	const insets = useSafeAreaInsets();
	const controlsBottomOffset = shouldShowBottomBar
		? 110 + insets.bottom
		: 24 + insets.bottom;

	return (
		<View style={styles.nonMapOverlay} pointerEvents="box-none">
			{/* Navigation header (only when active) */}
			{isNavigationActive && navigationRoute && (
				<NavigationHeader
					destinationName={navigationRoute.destinationName}
					distanceKm={navigationRoute.distanceKm}
					onStop={onStopNavigation}
				/>
			)}

			{/* Search bar overlay (top left) - only when not navigating */}
			{!isNavigationActive && canUseSearch && (
				<SearchBarOverlay
					isExpanded={isSearchOpen}
					searchText={searchText}
					onSearchTextChange={onSearchTextChange}
					onLocationSelected={onSearchLocationSelected}
					onToggle={onSearchToggle}
					onEmbarquer={onSearchEmbarquer}
					showEmbarquer={shouldShowSearchEmbarquer}
				/>
			)}

			{/* Map controls (compass + locate) */}
			{!isPlacingSpot && !isShowingForm && (
				<MapControls
					mapHeading={mapHeading}
					isFollowingUser={isFollowingUser}
					onResetHeading={onResetHeading}
					onLocateUser={onLocateUser}
					bottomOffset={controlsBottomOffset}
				/>
			)}

			{/* Long press embarquer button */}
			{longPressMarker && !isNavigationActive && !isSearchOpen && (
				<Pressable
					style={({ pressed }) => [
						styles.longPressEmbarquerButton,
						{ bottom: controlsBottomOffset },
						pressed && styles.longPressEmbarquerButtonPressed,
					]}
					onPress={onLongPressEmbarquer}
				>
					<Text style={styles.longPressEmbarquerButtonText}>Embarquer</Text>
				</Pressable>
			)}

			{/* Bottom navigation bar - outside KeyboardAvoidingView */}
			{shouldShowBottomBar && (
				<BottomNavBar activeTab="home" onTabPress={onTabPress} />
			)}
		</View>
	);
};
