import type React from 'react';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	BottomNavBar,
	MapControls,
	SearchBarOverlay,
} from '../../../components';
import { APP_CONFIG } from '../../../constants';
import { NavigationHeader } from '../../../navigation/components';
import {
	useHomeMap,
	useHomeNav,
	useHomeSearch,
	useHomeSession,
	useHomeSpot,
} from '../context/HomeStateContext';
import { homeScreenStyles as styles } from '../homeScreenStyles';

type HomeTabId = 'home' | 'search' | 'add' | 'history' | 'profile';

const MAP_CONTROLS_OFFSET_WITH_BOTTOM_BAR = 110;
const MAP_CONTROLS_OFFSET_DEFAULT = 24;
const MAP_CONTROLS_OFFSET_WITH_NAVIGATION = 170;
const NAVIGATION_COMPARE_BUTTON_BOTTOM_OFFSET = 56;
const COMPARE_BUTTON_LABEL = 'Comparer direction conducteur';
const CLEAR_COMPARE_BUTTON_LABEL = 'Effacer comparaison';

export const HomeFixedOverlay: React.FC = () => {
	const nav = useHomeNav();
	const session = useHomeSession();
	const search = useHomeSearch();
	const map = useHomeMap();
	const spot = useHomeSpot();

	const insets = useSafeAreaInsets();

	const isNavigationActive = nav.navigation.isActive;
	const navigationRoute = nav.navigation.route;

	const controlsBottomOffset = isNavigationActive
		? MAP_CONTROLS_OFFSET_WITH_NAVIGATION + insets.bottom
		: search.shouldShowBottomBar
			? MAP_CONTROLS_OFFSET_WITH_BOTTOM_BAR + insets.bottom
			: MAP_CONTROLS_OFFSET_DEFAULT + insets.bottom;

	const shouldShowLongPressEmbarquer =
		!!map.longPressMarker && !search.isSearchOpen;
	const shouldShowBottomEmbarquer =
		!isNavigationActive &&
		(shouldShowLongPressEmbarquer || search.shouldShowSearchEmbarquer);

	const handleStopNavigation = useCallback(() => {
		void search.handleStopNavigationAndOpenSearch();
	}, [search.handleStopNavigationAndOpenSearch]);

	const handleLongPressEmbarquer = useCallback(() => {
		session.handleLongPressEmbarquer(map.longPressMarker);
		map.clearLongPressMarker();
	}, [
		map.clearLongPressMarker,
		map.longPressMarker,
		session.handleLongPressEmbarquer,
	]);

	const handleBottomEmbarquerPress = shouldShowLongPressEmbarquer
		? handleLongPressEmbarquer
		: search.handleSearchEmbarquer;

	const handleDriverDirectionPress = session.hasDriverComparison
		? session.handleDriverDirectionClear
		: session.openDriverDirectionSheet;

	const driverDirectionLabel = session.hasDriverComparison
		? CLEAR_COMPARE_BUTTON_LABEL
		: COMPARE_BUTTON_LABEL;

	const handleTabPress = useCallback(
		(tabId: HomeTabId) => {
			if (tabId === 'add') spot.startPlacingSpot();
			else if (tabId === 'search') search.handleSearchToggle();
		},
		[search.handleSearchToggle, spot.startPlacingSpot]
	);

	return (
		<View style={styles.nonMapOverlay} pointerEvents="box-none">
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
						onStop={handleStopNavigation}
					/>
				</>
			)}

			{!isNavigationActive && search.canUseSearch && (
				<SearchBarOverlay
					isExpanded={search.isSearchOpen}
					searchText={search.searchText}
					onSearchTextChange={search.handleSearchTextChange}
					onLocationSelected={search.handleSearchLocationSelected}
					onToggle={search.handleSearchToggle}
				/>
			)}

			{!spot.isPlacingSpot && !spot.isShowingForm && (
				<MapControls
					mapHeading={map.mapHeading}
					isFollowingUser={map.isFollowingUser}
					onResetHeading={map.handleResetHeading}
					onLocateUser={map.handleLocateUser}
					bottomOffset={controlsBottomOffset}
				/>
			)}

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

			{search.shouldShowBottomBar && (
				<BottomNavBar activeTab="home" onTabPress={handleTabPress} />
			)}
		</View>
	);
};
