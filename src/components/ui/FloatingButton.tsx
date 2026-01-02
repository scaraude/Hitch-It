import type React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../constants';

interface FloatingButtonProps {
	onPress: () => void;
	icon: string;
	backgroundColor?: string;
	position?: 'center' | 'right' | 'left';
	accessibilityLabel: string;
	accessibilityHint?: string;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
	onPress,
	icon,
	backgroundColor = COLORS.primary,
	position = 'center',
	accessibilityLabel,
	accessibilityHint,
}) => {
	return (
		<TouchableOpacity
			style={[
				styles.button,
				{ backgroundColor },
				position === 'center' && styles.center,
				position === 'right' && styles.right,
				position === 'left' && styles.left,
			]}
			onPress={onPress}
			accessibilityLabel={accessibilityLabel}
			accessibilityHint={accessibilityHint}
			accessibilityRole="button"
		>
			<Text style={styles.icon}>{icon}</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		width: SIZES.fabSize + 4,
		height: SIZES.fabSize + 4,
		borderRadius: SIZES.radiusRound,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 8,
	},
	center: {
		alignSelf: 'center',
	},
	right: {
		right: SIZES.radiusXLarge,
	},
	left: {
		left: SIZES.radiusXLarge,
	},
	icon: {
		color: COLORS.background,
		fontSize: 40,
		fontWeight: 'bold',
		textAlign: 'center',
	},
});
