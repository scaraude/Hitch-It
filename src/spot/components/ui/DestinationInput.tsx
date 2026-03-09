import type React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../../constants';
import { A11Y_LABELS } from '../../../constants/accessibility';

interface DestinationInputProps {
	value: string;
	onChangeText: (text: string) => void;
	onAdd: () => void;
	placeholder?: string;
}

export const DestinationInput: React.FC<DestinationInputProps> = ({
	value,
	onChangeText,
	onAdd,
	placeholder = 'Ex: Paris, Lyon...',
}) => {
	const isAddDisabled = value.trim().length === 0;
	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={COLORS.textSecondary}
				onSubmitEditing={onAdd}
				accessibilityLabel={A11Y_LABELS.destinationInput}
				accessibilityHint={A11Y_LABELS.destinationPlaceholder}
				testID="destination-input"
			/>
			<Pressable
				style={[styles.addButton, isAddDisabled && styles.addButtonDisabled]}
				onPress={onAdd}
				disabled={isAddDisabled}
				accessibilityLabel={A11Y_LABELS.addDestination}
				accessibilityHint={A11Y_LABELS.addDestinationHint}
				accessibilityRole="button"
				accessibilityState={{ disabled: isAddDisabled }}
				testID="destination-add-button"
			>
				<Text style={styles.addButtonText}>+</Text>
			</Pressable>
		</View>
	);
};

const DISABLED_BUTTON_OPACITY = 0.5;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		gap: SPACING.sm,
		alignItems: 'center',
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: COLORS.surface,
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		padding: SPACING.md,
		fontSize: SIZES.fontMd,
		color: COLORS.text,
	},
	addButton: {
		width: SIZES.buttonHeight,
		height: SIZES.buttonHeight,
		borderRadius: SIZES.radiusMedium,
		backgroundColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	addButtonDisabled: {
		opacity: DISABLED_BUTTON_OPACITY,
	},
	addButtonText: {
		fontSize: SIZES.font2Xl,
		color: COLORS.background,
		fontWeight: 'bold',
	},
});
