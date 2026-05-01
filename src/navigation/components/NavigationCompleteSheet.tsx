import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetStyles } from '../../components/ui';
import { COLORS, SIZES, SPACING } from '../../constants';
import { useTranslation } from '../../i18n';
import type { NavigationRoute, SpotOnRoute } from '../types';

interface NavigationCompleteSheetProps {
	route: NavigationRoute;
	spotsUsed: SpotOnRoute[];
	durationMinutes: number;
	onSave: () => void;
	onDiscard: () => void;
}

const SNAP_POINTS: string[] = ['50%'];

function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes} min`;
	}
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	if (remainingMinutes === 0) {
		return `${hours}h`;
	}
	return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
}

export function NavigationCompleteSheet({
	route,
	spotsUsed,
	durationMinutes,
	onSave,
	onDiscard,
}: NavigationCompleteSheetProps) {
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();

	return (
		<BottomSheet
			index={0}
			snapPoints={SNAP_POINTS}
			enableDynamicSizing={false}
			enablePanDownToClose={false}
			style={sheetStyles.container}
			backgroundStyle={sheetStyles.background}
			handleIndicatorStyle={sheetStyles.defaultHandleIndicator}
		>
			<BottomSheetView
				style={[styles.content, { paddingBottom: insets.bottom + SPACING.lg }]}
			>
				<Text style={styles.title}>{t('navigation.complete')}</Text>

				<View style={styles.stats}>
					<Text style={styles.route}>{route.destinationName}</Text>
					<Text style={styles.details}>
						{formatDuration(durationMinutes)} | {route.distanceKm}{' '}
						{t('common.kmLabel')}
					</Text>
				</View>

				{spotsUsed.length > 0 && (
					<Text style={styles.spotsInfo}>
						{t('navigation.spotsOnRoute', {
							count: spotsUsed.length,
							plural: spotsUsed.length > 1 ? 's' : '',
						})}
					</Text>
				)}

				<Text style={styles.question}>
					{t('navigation.saveJourneyQuestion')}
				</Text>

				<View style={sheetStyles.buttonGroup}>
					<Pressable
						style={({ pressed }) => [
							sheetStyles.primaryButton,
							pressed && sheetStyles.buttonPressed,
						]}
						onPress={onSave}
					>
						<Text style={sheetStyles.primaryButtonText}>
							{t('common.yesSave')}
						</Text>
					</Pressable>
					<Pressable
						style={({ pressed }) => [
							sheetStyles.secondaryButton,
							pressed && sheetStyles.buttonPressed,
						]}
						onPress={onDiscard}
					>
						<Text style={sheetStyles.secondaryButtonText}>
							{t('common.noThanks')}
						</Text>
					</Pressable>
				</View>
			</BottomSheetView>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.md,
	},
	title: {
		fontSize: SIZES.font2Xl,
		fontWeight: 'bold',
		color: COLORS.text,
		textAlign: 'center',
		marginBottom: SPACING.md,
	},
	stats: {
		alignItems: 'center',
		marginBottom: SPACING.md,
	},
	route: {
		fontSize: SIZES.fontLg,
		fontWeight: '600',
		color: COLORS.primary,
		marginBottom: SPACING.xs,
	},
	details: {
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
	},
	spotsInfo: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		textAlign: 'center',
		marginBottom: SPACING.md,
	},
	question: {
		fontSize: SIZES.fontMd,
		color: COLORS.text,
		textAlign: 'center',
		marginBottom: SPACING.lg,
	},
});
