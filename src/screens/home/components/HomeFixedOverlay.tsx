import type React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	BottomNavBar,
	MapControls,
	SearchBarOverlay,
} from '../../../components';
import { APP_CONFIG } from '../../../constants';
import { NavigationHeader } from '../../../navigation/components';
import { useHomeScreenContext } from '../context/HomeScreenContext';
import { homeScreenStyles as styles } from '../homeScreenStyles';

const MAP_CONTROLS_OFFSET_WITH_BOTTOM_BAR = 110;
const MAP_CONTROLS_OFFSET_DEFAULT = 24;
const MAP_CONTROLS_OFFSET_WITH_NAVIGATION = 170;
const NAVIGATION_COMPARE_BUTTON_BOTTOM_OFFSET = 56;
const COMPARE_BUTTON_LABEL = 'Comparer direction conducteur';
const CLEAR_COMPARE_BUTTON_LABEL = 'Effacer comparaison';

export const HomeFixedOverlay: React.FC = () => {
	const {
		fixedOverlay: {
			isNavigationActive,
			navigationRoute,
			hasDriverComparison,
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
			onOpenDriverDirectionSheet,
			onClearDriverDirectionComparison,
			onLongPressEmbarquer,
			onTabPress,
		},
	} = useHomeScreenContext();

	const insets = useSafeAreaInsets();
	const controlsBottomOffset = isNavigationActive
		? MAP_CONTROLS_OFFSET_WITH_NAVIGATION + insets.bottom
		: shouldShowBottomBar
			? MAP_CONTROLS_OFFSET_WITH_BOTTOM_BAR + insets.bottom
			: MAP_CONTROLS_OFFSET_DEFAULT + insets.bottom;
	const shouldShowLongPressEmbarquer = !!longPressMarker && !isSearchOpen;
	const shouldShowBottomEmbarquer =
		!isNavigationActive &&
		(shouldShowLongPressEmbarquer || shouldShowSearchEmbarquer);
	const handleBottomEmbarquerPress = shouldShowLongPressEmbarquer
		? onLongPressEmbarquer
		: onSearchEmbarquer;
	const handleDriverDirectionPress = hasDriverComparison
		? onClearDriverDirectionComparison
		: onOpenDriverDirectionSheet;
	const driverDirectionLabel = hasDriverComparison
		? CLEAR_COMPARE_BUTTON_LABEL
		: COMPARE_BUTTON_LABEL;

	return (
		<View style={styles.nonMapOverlay} pointerEvents="box-none">
			{/* Navigation header (only when active) */}
			{isNavigationActive && navigationRoute && (
				<>
					<Pressable
						style={({ pressed }) => [
							styles.compareDriverDirectionButton,
							{
								bottom: NAVIGATION_COMPARE_BUTTON_BOTTOM_OFFSET + insets.bottom,
							},
							pressed && styles.compareDriverDirectionButtonPressed,
						]}
						onPress={handleDriverDirectionPress}
						accessibilityRole="button"
						accessibilityLabel={driverDirectionLabel}
						testID="compare-driver-direction-button"
					>
						<Text style={styles.compareDriverDirectionButtonText}>
							{driverDirectionLabel}
						</Text>
					</Pressable>

					<NavigationHeader
						destinationName={navigationRoute.destinationName}
						distanceKm={navigationRoute.distanceKm}
						onStop={onStopNavigation}
					/>
				</>
			)}

			{/* Search bar overlay (top left) - only when not navigating */}
			{!isNavigationActive && canUseSearch && (
				<SearchBarOverlay
					isExpanded={isSearchOpen}
					searchText={searchText}
					onSearchTextChange={onSearchTextChange}
					onLocationSelected={onSearchLocationSelected}
					onToggle={onSearchToggle}
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

			{/* Primary hitch action */}
			{shouldShowBottomEmbarquer && (
				<Pressable
					style={({ pressed }) => [
						styles.longPressEmbarquerButton,
						{ bottom: controlsBottomOffset },
						pressed && styles.longPressEmbarquerButtonPressed,
					]}
					onPress={handleBottomEmbarquerPress}
				>
					<Text style={styles.longPressEmbarquerButtonText}>
						{APP_CONFIG.name}
					</Text>
				</Pressable>
			)}

			{/* Bottom navigation bar - outside KeyboardAvoidingView */}
			{shouldShowBottomBar && (
				<BottomNavBar activeTab="home" onTabPress={onTabPress} />
			)}
		</View>
	);
};
