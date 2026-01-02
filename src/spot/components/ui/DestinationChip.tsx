import type React from 'react';
import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../../constants';

interface DestinationChipProps {
	destination: string;
	onRemove?: () => void;
}

const DestinationChipComponent: React.FC<DestinationChipProps> = ({
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

export const DestinationChip = memo(DestinationChipComponent);

const styles = StyleSheet.create({
	chip: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.secondary,
		paddingVertical: SPACING.sm,
		paddingHorizontal: SPACING.md,
		borderRadius: SIZES.radiusXLarge,
		gap: SPACING.sm,
	},
	text: {
		fontSize: SIZES.fontSm,
		color: COLORS.background,
		fontWeight: '500',
	},
	removeButton: {
		fontSize: SIZES.fontMd,
		color: COLORS.background,
		fontWeight: 'bold',
	},
});
