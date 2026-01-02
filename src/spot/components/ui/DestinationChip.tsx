import type React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING } from '../../../constants';

interface DestinationChipProps {
	destination: string;
	onRemove?: () => void;
}

export const DestinationChip: React.FC<DestinationChipProps> = ({
	destination,
	onRemove,
}) => {
	return (
		<View style={styles.chip}>
			<Text style={styles.text}>{destination}</Text>
			{onRemove && (
				<TouchableOpacity onPress={onRemove}>
					<Text style={styles.removeButton}>✕</Text>
				</TouchableOpacity>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	chip: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.secondary,
		paddingVertical: SPACING.sm,
		paddingHorizontal: SPACING.md,
		borderRadius: 20,
		gap: SPACING.sm,
	},
	text: {
		fontSize: 14,
		color: COLORS.background,
		fontWeight: '500',
	},
	removeButton: {
		fontSize: 16,
		color: COLORS.background,
		fontWeight: 'bold',
	},
});
