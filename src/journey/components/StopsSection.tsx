import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { SIZES } from '../../constants/sizes';
import { useTranslation } from '../../i18n';
import type { ManualStop } from '../hooks/useManualJourneyFlow';
import { StopEditor } from './StopEditor';
import { StopsList } from './StopsList';

interface StopsSectionProps {
	stops: ManualStop[];
	selectedStop: ManualStop | undefined;
	isAddingStop: boolean;
	onToggleAddStop: () => void;
	onSelectStop: (id: string | null) => void;
	onUpdateStop: (id: string, updates: Partial<ManualStop>) => void;
	onRemoveStop: (id: string) => void;
}

export const StopsSection: React.FC<StopsSectionProps> = ({
	stops,
	selectedStop,
	isAddingStop,
	onToggleAddStop,
	onSelectStop,
	onUpdateStop,
	onRemoveStop,
}) => {
	const { t } = useTranslation();
	const selectedStopNumber = selectedStop
		? stops.findIndex(s => s.id === selectedStop.id) + 1
		: 0;

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.label}>
					{t('journey.stopsCount', { count: stops.length })}
				</Text>
				<Pressable
					style={[styles.addButton, isAddingStop && styles.addButtonActive]}
					onPress={onToggleAddStop}
				>
					<Ionicons
						name={isAddingStop ? 'close' : 'add'}
						size={18}
						color={isAddingStop ? COLORS.error : COLORS.primary}
					/>
					<Text
						style={[
							styles.addButtonText,
							isAddingStop && styles.addButtonTextActive,
						]}
					>
						{isAddingStop ? t('common.cancel') : t('journey.addStop')}
					</Text>
				</Pressable>
			</View>

			{selectedStop ? (
				<StopEditor
					stop={selectedStop}
					stopNumber={selectedStopNumber}
					onUpdate={updates => onUpdateStop(selectedStop.id, updates)}
					onRemove={() => onRemoveStop(selectedStop.id)}
					onDone={() => onSelectStop(null)}
				/>
			) : (
				stops.length > 0 && (
					<StopsList stops={stops} onSelectStop={onSelectStop} />
				)
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: SPACING.md,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: SPACING.sm,
	},
	label: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.text,
	},
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING.xs,
		paddingHorizontal: SPACING.sm,
		paddingVertical: SPACING.xs,
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		borderWidth: 1,
		borderColor: COLORS.primary,
	},
	addButtonActive: {
		borderColor: COLORS.error,
		backgroundColor: 'rgba(244, 67, 54, 0.1)',
	},
	addButtonText: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.primary,
	},
	addButtonTextActive: {
		color: COLORS.error,
	},
});
