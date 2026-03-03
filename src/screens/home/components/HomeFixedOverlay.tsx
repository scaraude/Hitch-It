import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type React from 'react';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../auth';
import {
	BottomNavBar,
	MapControls,
	SearchBarOverlay,
} from '../../../components';
import { APP_CONFIG } from '../../../constants';
import { useTranslation } from '../../../i18n';
import { NavigationHeader } from '../../../navigation/components';
import { useNavigationProgress } from '../../../navigation/hooks';
import type { RootStackParamList } from '../../../navigation/types';
import {
	useHomeLocation,
	useHomeMap,
	useHomeNav,
	useHomeSearch,
	useHomeSession,
	useHomeSpot,
} from '../context/HomeStateContext';
import { homeScreenStyles as styles } from '../homeScreenStyles';

type HomeTabId = 'home' | 'search' | 'add' | 'history' | 'profile';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MAP_CONTROLS_OFFSET_WITH_BOTTOM_BAR = 110;
const MAP_CONTROLS_OFFSET_DEFAULT = 24;
const MAP_CONTROLS_OFFSET_WITH_NAVIGATION = 170;
const NAVIGATION_COMPARE_BUTTON_BOTTOM_OFFSET = 56;

export const HomeFixedOverlay: React.FC = () => {
	const rootNavigation = useNavigation<NavigationProp>();
	const { isAuthenticated } = useAuth();
	const { t } = useTranslation();

	const { userLocation } = useHomeLocation();
	const nav = useHomeNav();
	const session = useHomeSession();
	const search = useHomeSearch();
	const map = useHomeMap();
	const spot = useHomeSpot();

	const { remainingDistanceKm } = useNavigationProgress({
		routePolyline: nav.navigation.route?.polyline ?? [],
		initialDistanceKm: nav.navigation.route?.distanceKm ?? 0,
		userLocation,
		spotsOnRoute: nav.navigation.spotsOnRoute,
	});

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
		? t('navigation.clearComparison')
		: t('navigation.compareDriverDirection');

	const handleTabPress = useCallback(
		(tabId: HomeTabId) => {
			if (tabId === 'add') spot.startPlacingSpot();
			else if (tabId === 'search') search.handleSearchToggle();
			else if (tabId === 'history') {
				if (isAuthenticated) {
					rootNavigation.navigate('JourneyHistory');
				} else {
					rootNavigation.navigate('Login');
				}
			} else if (tabId === 'profile') {
				if (isAuthenticated) {
					rootNavigation.navigate('Profile');
				} else {
					rootNavigation.navigate('Login');
				}
			}
		},
		[
			isAuthenticated,
			rootNavigation,
			search.handleSearchToggle,
			spot.startPlacingSpot,
		]
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

					<Pressable
						style={({ pressed }) => [
							styles.markStopButton,
							{
								bottom: NAVIGATION_COMPARE_BUTTON_BOTTOM_OFFSET + insets.bottom,
							},
							pressed && styles.markStopButtonPressed,
						]}
						onPress={session.handleMarkStop}
						accessibilityRole="button"
						accessibilityLabel={t('navigation.markStop')}
						testID="mark-stop-button"
					>
						<Text style={styles.markStopButtonText}>
							{t('navigation.markStop')}
						</Text>
					</Pressable>

					<NavigationHeader
						destinationName={navigationRoute.destinationName}
						distanceKm={remainingDistanceKm}
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
				<BottomNavBar
					activeTab="home"
					onTabPress={handleTabPress}
					isAuthenticated={isAuthenticated}
				/>
			)}
		</View>
	);
};
