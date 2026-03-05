import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../../constants';
import { useTranslation } from '../../../i18n';
import type { JourneyPoint } from '../../types';

interface JourneyStopsListProps {
	stopPoints: JourneyPoint[];
}

export function JourneyStopsList({ stopPoints }: JourneyStopsListProps) {
	const { t } = useTranslation();

	if (stopPoints.length === 0) return null;

	return (
		<View style={styles.stopsSection}>
			<Text style={styles.stopsTitle}>{t('journey.stopsLabel')}</Text>
			{stopPoints.map((point, index) => (
				<View key={point.id} style={styles.stopItem}>
					<View style={styles.stopNumber}>
						<Text style={styles.stopNumberText}>{index + 1}</Text>
					</View>
					<View style={styles.stopDetails}>
						<Text style={styles.stopTime}>
							{point.timestamp.toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</Text>
						{point.waitTimeMinutes !== undefined && (
							<Text style={styles.stopWaitTime}>
								{t('journey.waitTime', { minutes: point.waitTimeMinutes })}
							</Text>
						)}
						{point.notes && <Text style={styles.stopNotes}>{point.notes}</Text>}
					</View>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	stopsSection: {
		marginTop: SPACING.lg,
	},
	stopsTitle: {
		fontSize: SIZES.fontLg,
		fontWeight: '700',
		color: COLORS.text,
		marginBottom: SPACING.md,
	},
	stopItem: {
		flexDirection: 'row',
		marginBottom: SPACING.md,
		paddingBottom: SPACING.md,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	stopNumber: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: COLORS.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: SPACING.md,
	},
	stopNumberText: {
		fontSize: SIZES.fontSm,
		fontWeight: '700',
		color: COLORS.textLight,
	},
	stopDetails: {
		flex: 1,
	},
	stopTime: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: SPACING.xs,
	},
	stopWaitTime: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		marginBottom: SPACING.xs,
	},
	stopNotes: {
		fontSize: SIZES.fontSm,
		color: COLORS.text,
		fontStyle: 'italic',
	},
});
