import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants';

interface StartNavigationButtonProps {
	onPress: () => void;
	isLoading?: boolean;
}

export function StartNavigationButton({
	onPress,
	isLoading = false,
}: StartNavigationButtonProps) {
	return (
		<View style={styles.container}>
			<Pressable
				style={({ pressed }) => [
					styles.button,
					pressed && styles.buttonPressed,
					isLoading && styles.buttonDisabled,
				]}
				onPress={onPress}
				disabled={isLoading}
			>
				<Text style={styles.text}>{isLoading ? 'Calcul...' : 'Embarquer'}</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 20,
		left: SPACING.md,
		right: SPACING.md,
		zIndex: 100,
	},
	button: {
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.md,
		borderRadius: 8,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	buttonPressed: {
		opacity: 0.9,
		transform: [{ scale: 0.98 }],
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	text: {
		color: COLORS.textLight,
		fontSize: 18,
		fontWeight: '600',
	},
});
