import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetHeader, bottomSheetStyles } from '../../components/ui';
import { COLORS, SIZES, SPACING } from '../../constants';
import type { NavigationRoute, SpotOnRoute } from '../types';

interface NavigationCompleteSheetProps {
	route: NavigationRoute;
	spotsUsed: SpotOnRoute[];
	durationMinutes: number;
	onSave: () => void;
	onDiscard: () => void;
}

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
	return (
		<View style={[bottomSheetStyles.container, styles.container]}>
			<BottomSheetHeader style={styles.header} />

			<View style={styles.content}>
				<Text style={styles.title}>Navigation terminée !</Text>

				<View style={styles.stats}>
					<Text style={styles.route}>{route.destinationName}</Text>
					<Text style={styles.details}>
						{formatDuration(durationMinutes)} | {route.distanceKm} km
					</Text>
				</View>

				{spotsUsed.length > 0 && (
					<Text style={styles.spotsInfo}>
						{spotsUsed.length} spot{spotsUsed.length > 1 ? 's' : ''} sur le
						trajet
					</Text>
				)}

				<Text style={styles.question}>Voulez-vous sauvegarder ce voyage ?</Text>

				<View style={styles.buttons}>
					<Pressable
						style={({ pressed }) => [
							styles.primaryButton,
							pressed && styles.buttonPressed,
						]}
						onPress={onSave}
					>
						<Text style={styles.primaryButtonText}>Oui, sauvegarder</Text>
					</Pressable>
					<Pressable
						style={({ pressed }) => [
							styles.secondaryButton,
							pressed && styles.buttonPressed,
						]}
						onPress={onDiscard}
					>
						<Text style={styles.secondaryButtonText}>Non merci</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		zIndex: 900,
	},
	header: {
		paddingTop: SPACING.sm,
	},
	content: {
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.md,
		paddingBottom: SPACING.xl,
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
	buttons: {
		gap: SPACING.sm,
	},
	primaryButton: {
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
	},
	secondaryButton: {
		backgroundColor: COLORS.surface,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	buttonPressed: {
		opacity: 0.8,
	},
	primaryButtonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
	secondaryButtonText: {
		color: COLORS.text,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});
