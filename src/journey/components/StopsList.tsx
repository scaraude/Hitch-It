import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { SIZES } from '../../constants/sizes';
import { useTranslation } from '../../i18n';
import type { ManualStop } from '../hooks/useManualJourneyFlow';

const STOP_MARKER_COLOR = '#333333';

interface StopsListProps {
	stops: ManualStop[];
	onSelectStop: (id: string) => void;
}

export const StopsList: React.FC<StopsListProps> = ({
	stops,
	onSelectStop,
}) => {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			{stops.map((stop, index) => (
				<Pressable
					key={stop.id}
					style={styles.item}
					onPress={() => onSelectStop(stop.id)}
				>
					<View style={styles.dot} />
					<View style={styles.content}>
						<Text style={styles.itemTitle}>
							{t('journey.stopLabel', { number: index + 1 })}
						</Text>
						{stop.waitTimeMinutes != null && (
							<Text style={styles.itemDetail}>
								{t('journey.minuteWait', { minutes: stop.waitTimeMinutes })}
							</Text>
						)}
					</View>
					<Ionicons
						name="chevron-forward"
						size={18}
						color={COLORS.textSecondary}
					/>
				</Pressable>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: SPACING.xs,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		padding: SPACING.sm,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: STOP_MARKER_COLOR,
		marginRight: SPACING.sm,
	},
	content: {
		flex: 1,
	},
	itemTitle: {
		fontSize: SIZES.fontMd,
		fontWeight: '500',
		color: COLORS.text,
	},
	itemDetail: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
	},
});
