import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useCallback } from 'react';
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { SIZES } from '../../constants/sizes';
import { useTranslation } from '../../i18n';
import type { ManualStop } from '../hooks/useManualJourneyFlow';

interface StopEditorProps {
	stop: ManualStop;
	stopNumber: number;
	onUpdate: (updates: Partial<ManualStop>) => void;
	onRemove: () => void;
	onDone: () => void;
}

export const StopEditor: React.FC<StopEditorProps> = ({
	stop,
	stopNumber,
	onUpdate,
	onRemove,
	onDone,
}) => {
	const { t } = useTranslation();

	const handleWaitTimeChange = useCallback(
		(text: string) => {
			const minutes = Number.parseInt(text, 10);
			onUpdate({
				waitTimeMinutes: Number.isNaN(minutes) ? undefined : minutes,
			});
		},
		[onUpdate]
	);

	const handleNotesChange = useCallback(
		(text: string) => {
			onUpdate({ notes: text || undefined });
		},
		[onUpdate]
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>
					{t('journey.stopLabel', { number: stopNumber })}
				</Text>
				<Pressable
					onPress={onRemove}
					accessibilityLabel={t('journey.removeStop')}
				>
					<Ionicons name="trash-outline" size={20} color={COLORS.error} />
				</Pressable>
			</View>

			<TextInput
				style={styles.input}
				placeholder={t('journey.waitTimePlaceholder')}
				value={stop.waitTimeMinutes?.toString() ?? ''}
				onChangeText={handleWaitTimeChange}
				keyboardType="numeric"
				placeholderTextColor={COLORS.textSecondary}
			/>

			<TextInput
				style={[styles.input, styles.notesInput]}
				placeholder={t('common.notesLabelOptional')}
				value={stop.notes ?? ''}
				onChangeText={handleNotesChange}
				multiline
				numberOfLines={2}
				placeholderTextColor={COLORS.textSecondary}
			/>

			<Pressable style={styles.doneButton} onPress={onDone}>
				<Text style={styles.doneButtonText}>{t('common.done')}</Text>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		padding: SPACING.md,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: SPACING.sm,
	},
	title: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
	},
	input: {
		backgroundColor: COLORS.background,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: SIZES.radiusMedium,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		fontSize: SIZES.fontMd,
		color: COLORS.text,
		marginBottom: SPACING.sm,
	},
	notesInput: {
		minHeight: 60,
		textAlignVertical: 'top',
	},
	doneButton: {
		alignItems: 'center',
		paddingVertical: SPACING.sm,
	},
	doneButtonText: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.primary,
	},
});
