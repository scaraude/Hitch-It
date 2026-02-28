import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { COLORS, SPACING } from '../constants';
import { SIZES } from '../constants/sizes';
import { JourneyCard } from '../journey/components/JourneyCard';
import { useJourneyStats } from '../journey/hooks/useJourneyStats';
import * as journeyRepository from '../journey/services/journeyRepository';
import type { Journey, JourneyId, UserId } from '../journey/types';
import { JourneyStatus } from '../journey/types';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PROFILE_BACKGROUND_COLOR = '#C9A961';

export default function JourneyHistoryScreen() {
	const navigation = useNavigation<NavigationProp>();
	const { user } = useAuth();

	const [journeys, setJourneys] = useState<Journey[]>([]);
	const [isLoadingJourneys, setIsLoadingJourneys] = useState(true);
	const stats = useJourneyStats(user?.id as UserId | null);

	const loadJourneys = useCallback(async () => {
		if (!user?.id) {
			setJourneys([]);
			setIsLoadingJourneys(false);
			return;
		}

		setIsLoadingJourneys(true);
		try {
			const userJourneys = await journeyRepository.getJourneysByUserId(
				user.id as UserId
			);

			const completedJourneys = userJourneys.filter(
				j => j.status === JourneyStatus.Completed
			);

			const journeysWithPoints = await Promise.all(
				completedJourneys.map(async journey => {
					const fullJourney = await journeyRepository.getJourneyById(
						journey.id
					);
					return fullJourney ?? journey;
				})
			);

			setJourneys(journeysWithPoints);
		} catch {
			setJourneys([]);
		} finally {
			setIsLoadingJourneys(false);
		}
	}, [user?.id]);

	useFocusEffect(
		useCallback(() => {
			void loadJourneys();
		}, [loadJourneys])
	);

	const handleJourneyPress = (journeyId: JourneyId) => {
		navigation.navigate('JourneyDetail', { journeyId });
	};

	const handleAddJourney = () => {
		navigation.navigate('ManualJourneyEntry');
	};

	const renderJourneyItem = ({ item }: { item: Journey }) => (
		<JourneyCard journey={item} onPress={() => handleJourneyPress(item.id)} />
	);

	const renderHeader = () => (
		<View>
			<View style={styles.profileHeader}>
				<Text style={styles.username}>{user?.username}</Text>

				<View style={styles.statsContainer}>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{stats.totalJourneys}</Text>
						<Text style={styles.statLabel}>journeys</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{stats.totalDistanceKm}</Text>
						<Text style={styles.statLabel}>km</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{stats.totalVehicles}</Text>
						<Text style={styles.statLabel}>vehicles</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{stats.totalCountries}</Text>
						<Text style={styles.statLabel}>countries</Text>
					</View>
				</View>
			</View>

			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>Past Journeys</Text>
				<Pressable
					style={styles.addButton}
					onPress={handleAddJourney}
					accessibilityLabel="Add journey"
				>
					<Ionicons name="add" size={SIZES.iconMd} color={COLORS.primary} />
				</Pressable>
			</View>
		</View>
	);

	const renderEmptyState = () => (
		<View style={styles.emptyState}>
			<Ionicons name="map-outline" size={64} color={COLORS.textSecondary} />
			<Text style={styles.emptyStateText}>No journeys yet</Text>
			<Pressable style={styles.emptyStateButton} onPress={handleAddJourney}>
				<Text style={styles.emptyStateButtonText}>Add your first journey</Text>
			</Pressable>
		</View>
	);

	if (stats.isLoading || isLoadingJourneys) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.header}>
					<Pressable
						style={styles.backButton}
						onPress={() => navigation.goBack()}
					>
						<Ionicons
							name="arrow-back"
							size={SIZES.iconMd}
							color={COLORS.text}
						/>
					</Pressable>
					<Text style={styles.headerTitle}>Journey History</Text>
					<View style={styles.headerSpacer} />
				</View>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={COLORS.primary} />
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Pressable
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="arrow-back" size={SIZES.iconMd} color={COLORS.text} />
				</Pressable>
				<Text style={styles.headerTitle}>Journey History</Text>
				<View style={styles.headerSpacer} />
			</View>

			<FlatList
				data={journeys}
				renderItem={renderJourneyItem}
				keyExtractor={item => item.id}
				ListHeaderComponent={renderHeader}
				ListEmptyComponent={renderEmptyState}
				contentContainerStyle={styles.listContent}
				ItemSeparatorComponent={() => <View style={styles.separator} />}
			/>
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
		backgroundColor: COLORS.background,
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
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	listContent: {
		flexGrow: 1,
	},
	profileHeader: {
		backgroundColor: PROFILE_BACKGROUND_COLOR,
		paddingVertical: SPACING.xl,
		alignItems: 'center',
	},
	username: {
		fontSize: SIZES.font2Xl,
		fontWeight: '700',
		color: COLORS.text,
		marginBottom: SPACING.lg,
	},
	statsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		width: '100%',
		paddingHorizontal: SPACING.lg,
	},
	statItem: {
		alignItems: 'center',
	},
	statValue: {
		fontSize: SIZES.fontXl,
		fontWeight: '700',
		color: COLORS.text,
	},
	statLabel: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		marginTop: SPACING.xs,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: SPACING.lg,
		paddingVertical: SPACING.md,
		backgroundColor: COLORS.background,
	},
	sectionTitle: {
		fontSize: SIZES.fontLg,
		fontWeight: '700',
		color: COLORS.text,
	},
	addButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: COLORS.surface,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.primary,
	},
	separator: {
		height: SPACING.md,
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: SPACING.xxl,
		paddingHorizontal: SPACING.lg,
	},
	emptyStateText: {
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
		marginTop: SPACING.md,
		marginBottom: SPACING.lg,
	},
	emptyStateButton: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: SPACING.lg,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
	},
	emptyStateButtonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});
