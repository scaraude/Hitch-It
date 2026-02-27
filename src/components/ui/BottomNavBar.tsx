import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING } from '../../constants';

type TabId = 'home' | 'search' | 'add' | 'history' | 'profile';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
	id: TabId;
	label: string;
	icon: IconName;
	activeIcon: IconName;
}

const TABS: TabConfig[] = [
	{ id: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
	{
		id: 'search',
		label: 'Search',
		icon: 'search-outline',
		activeIcon: 'search',
	},
	{ id: 'add', label: '', icon: 'add', activeIcon: 'add' },
	{
		id: 'history',
		label: 'History',
		icon: 'time-outline',
		activeIcon: 'time',
	},
	{
		id: 'profile',
		label: 'Profile',
		icon: 'person-outline',
		activeIcon: 'person',
	},
];

function getProfileLabel(isAuthenticated: boolean): string {
	return isAuthenticated ? 'Profile' : 'Log in';
}

interface BottomNavBarProps {
	activeTab?: TabId;
	onTabPress: (tabId: TabId) => void;
	isAuthenticated?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
	activeTab = 'home',
	onTabPress,
	isAuthenticated = false,
}) => {
	const insets = useSafeAreaInsets();

	return (
		<View style={styles.wrapper}>
			{/* Floating add button - positioned above the nav bar */}
			<Pressable
				style={({ pressed }) => [
					styles.addButton,
					pressed && styles.addButtonPressed,
				]}
				onPress={() => onTabPress('add')}
				accessibilityLabel="Ajouter un spot"
				accessibilityRole="button"
				testID="bottom-nav-add"
			>
				<Ionicons
					name="add"
					size={36}
					color={COLORS.background}
					pointerEvents="none"
					style={styles.addButtonIcon}
				/>
			</Pressable>

			{/* Nav bar background */}
			<View
				style={[
					styles.container,
					{ paddingBottom: Math.max(insets.bottom, SPACING.sm) },
				]}
			>
				<View style={styles.tabRow}>
					{TABS.map(tab => {
						const isActive = activeTab === tab.id;
						const isAddButton = tab.id === 'add';

						// Render a spacer for the add button position
						if (isAddButton) {
							return <View key={tab.id} style={styles.addButtonSpacer} />;
						}

						return (
							<Pressable
								key={tab.id}
								style={({ pressed }) => [
									styles.tab,
									pressed && styles.tabPressed,
								]}
								onPress={() => onTabPress(tab.id)}
								accessibilityLabel={tab.label}
								accessibilityRole="tab"
								accessibilityState={{ selected: isActive }}
								testID={`bottom-nav-${tab.id}`}
							>
								<Ionicons
									name={isActive ? tab.activeIcon : tab.icon}
									size={SIZES.iconMd}
									color={isActive ? PRIMARY_BLUE : TEXT_GRAY}
									pointerEvents="none"
									style={styles.tabIcon}
								/>
								<Text
									style={[styles.tabLabel, isActive && styles.tabLabelActive]}
								>
									{tab.id === 'profile'
										? getProfileLabel(isAuthenticated)
										: tab.label}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</View>
		</View>
	);
};

const PRIMARY_BLUE = '#539DF3';
const TEXT_GRAY = '#484C52';

const ADD_BUTTON_SIZE = 64;
const ADD_BUTTON_OVERFLOW = 28; // How much the button extends above the nav bar

const styles = StyleSheet.create({
	wrapper: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
	},
	container: {
		backgroundColor: COLORS.background,
		borderTopWidth: 1,
		borderTopColor: '#E0E0E0',
	},
	tabRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'space-around',
		paddingTop: SPACING.sm,
	},
	tab: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: SPACING.xs,
	},
	tabPressed: {
		opacity: 0.7,
	},
	tabIcon: {
		marginBottom: SPACING.xs,
	},
	tabLabel: {
		fontSize: SIZES.fontMd,
		color: TEXT_GRAY,
	},
	tabLabelActive: {
		color: PRIMARY_BLUE,
		fontWeight: '500',
	},
	addButtonSpacer: {
		flex: 1,
	},
	addButton: {
		position: 'absolute',
		top: -ADD_BUTTON_OVERFLOW,
		left: '50%',
		marginLeft: -(ADD_BUTTON_SIZE / 2),
		zIndex: 1,
		width: ADD_BUTTON_SIZE,
		height: ADD_BUTTON_SIZE,
		borderRadius: ADD_BUTTON_SIZE / 2,
		backgroundColor: PRIMARY_BLUE,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 4,
		borderColor: COLORS.background,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 4,
	},
	addButtonPressed: {
		opacity: 0.9,
		transform: [{ scale: 0.95 }],
	},
	addButtonIcon: {
		fontWeight: '500',
	},
});
