import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { COLORS, SPACING } from '../constants';
import { SIZES } from '../constants/sizes';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
	const navigation = useNavigation<NavigationProp>();
	const { user, logout } = useAuth();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		await logout();
		setIsLoggingOut(false);
		navigation.navigate('Home');
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Pressable
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="arrow-back" size={SIZES.iconMd} color={COLORS.text} />
				</Pressable>
				<Text style={styles.headerTitle}>Profile</Text>
				<View style={styles.headerSpacer} />
			</View>

			<View style={styles.content}>
				<View style={styles.avatarContainer}>
					<View style={styles.avatar}>
						<Ionicons name="person" size={48} color={COLORS.textLight} />
					</View>
				</View>

				<View style={styles.infoSection}>
					<Text style={styles.username}>{user?.username}</Text>
					<Text style={styles.email}>{user?.email}</Text>
				</View>

				<View style={styles.actions}>
					<Pressable
						style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]}
						onPress={handleLogout}
						disabled={isLoggingOut}
					>
						<Ionicons
							name="log-out-outline"
							size={SIZES.iconSm}
							color={COLORS.error}
						/>
						<Text style={styles.logoutText}>
							{isLoggingOut ? 'Logging out...' : 'Log Out'}
						</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		flex: 1,
		fontSize: SIZES.fontLg,
		fontWeight: '600',
		color: COLORS.text,
		textAlign: 'center',
	},
	headerSpacer: {
		width: 40,
	},
	content: {
		flex: 1,
		padding: SPACING.lg,
	},
	avatarContainer: {
		alignItems: 'center',
		marginBottom: SPACING.xl,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: COLORS.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	infoSection: {
		alignItems: 'center',
		marginBottom: SPACING.xxl,
	},
	username: {
		fontSize: SIZES.font2Xl,
		fontWeight: '700',
		color: COLORS.text,
		marginBottom: SPACING.xs,
	},
	email: {
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
	},
	actions: {
		marginTop: 'auto',
	},
	logoutButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: SPACING.sm,
		backgroundColor: COLORS.surface,
		borderWidth: 1,
		borderColor: COLORS.error,
		height: SIZES.buttonHeight,
		borderRadius: SIZES.radiusMedium,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	logoutText: {
		color: COLORS.error,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});
