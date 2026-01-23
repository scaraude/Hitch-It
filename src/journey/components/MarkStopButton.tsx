import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { useJourney } from '../context/JourneyContext';

export const MarkStopButton = () => {
	const { activeJourney, isRecording, markStop, currentLocation } =
		useJourney();

	// Only show when actively recording
	if (!activeJourney || !isRecording) return null;

	const canMarkStop = currentLocation !== null;

	const handlePress = () => {
		if (canMarkStop) {
			markStop();
		}
	};

	return (
		<Pressable
			style={[styles.button, !canMarkStop && styles.buttonDisabled]}
			onPress={handlePress}
			disabled={!canMarkStop}
			accessibilityLabel="Marquer un arrêt"
			accessibilityHint="Enregistre votre position actuelle comme un arrêt"
		>
			<Text style={styles.icon}>📍</Text>
			<Text style={styles.text}>Arrêt</Text>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.success,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		borderRadius: 20,
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
	},
	buttonDisabled: {
		backgroundColor: COLORS.border,
	},
	icon: {
		fontSize: 16,
		marginRight: SPACING.xs,
	},
	text: {
		color: COLORS.textLight,
		fontSize: 14,
		fontWeight: '600',
	},
});
