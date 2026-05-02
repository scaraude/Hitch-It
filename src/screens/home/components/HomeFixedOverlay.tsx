import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type React from 'react';
import { useCallback } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../auth';
import {
	ActionButton,
	BottomNavBar,
	MapControls,
	SearchBarOverlay,
} from '../../../components';
import { COLORS } from '../../../constants';
import { useTranslation } from '../../../i18n';
import { useJourney } from '../../../journey/context';
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
import { RecordingBadge } from './RecordingBadge';

type HomeTabId = 'home' | 'search' | 'add' | 'history' | 'profile';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MAP_CONTROLS_OFFSET_WITH_BOTTOM_BAR = 110;
const MAP_CONTROLS_OFFSET_DEFAULT = 24;
const MAP_CONTROLS_OFFSET_WITH_NAVIGATION = 170;
const NAVIGATION_COMPARE_BUTTON_BOTTOM_OFFSET = 72;

export const HomeFixedOverlay: React.FC = () => {
	const rootNavigation = useNavigation<NavigationProp>();
	const { isAuthenticated } = useAuth();
	const { t } = useTranslation();
	const { isRecording } = useJourney();

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

	const shouldShowLongPressNavigationSetup =
		!!map.longPressMarker && !search.isSearchOpen;
	const shouldShowBottomNavigationSetup =
		!isNavigationActive &&
		(shouldShowLongPressNavigationSetup ||
			search.shouldShowSearchNavigationSetup);

	const handleStopNavigation = useCallback(() => {
		Alert.alert(t('navigation.complete'), t('navigation.saveJourneyQuestion'), [
			{
				text: t('common.cancel'),
				style: 'cancel',
			},
			{
				text: t('common.noThanks'),
				onPress: () => {
					void session.handleDiscardJourney();
				},
			},
			{
				text: t('common.yesSave'),
				onPress: () => {
					void search.handleStopNavigationAndOpenSearch();
				},
			},
		]);
	}, [
		search.handleStopNavigationAndOpenSearch,
		session.handleDiscardJourney,
		t,
	]);

	const handleLongPressNavigationSetup = useCallback(() => {
		session.handleLongPressNavigationSetup(map.longPressMarker);
		map.clearLongPressMarker();
	}, [
		map.clearLongPressMarker,
		map.longPressMarker,
		session.handleLongPressNavigationSetup,
	]);

	const handleBottomNavigationSetupPress = shouldShowLongPressNavigationSetup
		? handleLongPressNavigationSetup
		: search.handleSearchNavigationSetup;

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
					<RecordingBadge
						isVisible={isRecording}
						safeAreaTopInset={insets.top}
					/>

					<Pressable
						style={({ pressed }) => [
							styles.compareDriverDirectionButton,
							session.hasDriverComparison &&
								styles.compareDriverDirectionButtonActive,
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
						{session.hasDriverComparison ? (
							<Ionicons
								name="close-circle"
								size={18}
								color={COLORS.textLight}
							/>
						) : (
							<MaterialIcons
								name="fork-right"
								size={18}
								color={COLORS.primary}
							/>
						)}
						<Text
							style={[
								styles.compareDriverDirectionButtonLabel,
								session.hasDriverComparison &&
									styles.compareDriverDirectionButtonLabelActive,
							]}
						>
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
					onBackPress={search.handleSearchClear}
				/>
			)}

			{!spot.isPlacingSpot && !spot.isShowingForm && (
				<MapControls
					mapHeading={map.mapHeading}
					isFollowingUser={map.isFollowingUser}
					onResetHeading={map.handleResetHeading}
					onLocateUser={map.centerMapOnUser}
					bottomOffset={controlsBottomOffset}
				/>
			)}

			{shouldShowBottomNavigationSetup && (
				<ActionButton
					label={t('navigation.hitchIt')}
					onPress={handleBottomNavigationSetupPress}
					bottomOffset={controlsBottomOffset}
					testID="bottom-navigation-setup-button"
				/>
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
