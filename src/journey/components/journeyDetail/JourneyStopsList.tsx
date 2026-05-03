import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../../constants';
import { useTranslation } from '../../../i18n';
import type { JourneyStop } from '../../types';

interface JourneyStopsListProps {
	stops: JourneyStop[];
}

export function JourneyStopsList({ stops }: JourneyStopsListProps) {
	const { t } = useTranslation();

	if (stops.length === 0) return null;

	return (
		<View style={styles.stopsSection}>
			<Text style={styles.stopsTitle}>{t('journey.stopsLabel')}</Text>
			{stops.map((stop, index) => (
				<View key={stop.id} style={styles.stopItem}>
					<View style={styles.stopNumber}>
						<Text style={styles.stopNumberText}>{index + 1}</Text>
					</View>
					<View style={styles.stopDetails}>
						<Text style={styles.stopTime}>
							{stop.timestamp.toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</Text>
						{stop.waitTimeMinutes !== undefined && (
							<Text style={styles.stopWaitTime}>
								{t('journey.waitTime', { minutes: stop.waitTimeMinutes })}
							</Text>
						)}
						{stop.notes && <Text style={styles.stopNotes}>{stop.notes}</Text>}
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
