import type React from 'react';
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { COLORS, SPACING } from '../../../constants';

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
	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={COLORS.textSecondary}
				onSubmitEditing={onAdd}
			/>
			<TouchableOpacity style={styles.addButton} onPress={onAdd}>
				<Text style={styles.addButtonText}>+</Text>
			</TouchableOpacity>
		</View>
	);
};

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
		borderRadius: 8,
		padding: SPACING.md,
		fontSize: 16,
		color: COLORS.text,
	},
	addButton: {
		width: 48,
		height: 48,
		borderRadius: 8,
		backgroundColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	addButtonText: {
		fontSize: 24,
		color: COLORS.background,
		fontWeight: 'bold',
	},
});
