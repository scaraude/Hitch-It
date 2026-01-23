import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { useJourney } from '../context/JourneyContext';
import { JourneyStatus } from '../types';

export const JourneyRecordingButton = () => {
	const {
		activeJourney,
		isRecording,
		startRecording,
		stopRecording,
		pauseRecording,
		resumeRecording,
	} = useJourney();

	const isPaused = activeJourney?.status === JourneyStatus.Paused;
	const hasActiveJourney = activeJourney !== null;

	const handlePress = async () => {
		if (!hasActiveJourney) {
			await startRecording();
		} else if (isRecording) {
			await pauseRecording();
		} else if (isPaused) {
			await resumeRecording();
		}
	};

	const handleLongPress = async () => {
		if (hasActiveJourney) {
			await stopRecording();
		}
	};

	const getButtonStyle = () => {
		if (!hasActiveJourney) return styles.startButton;
		if (isRecording) return styles.recordingButton;
		return styles.pausedButton;
	};

	const getButtonText = () => {
		if (!hasActiveJourney) return 'Enregistrer';
		if (isRecording) return 'Pause';
		return 'Reprendre';
	};

	const getIcon = () => {
		if (!hasActiveJourney) return '🎬';
		if (isRecording) return '⏸️';
		return '▶️';
	};

	return (
		<View style={styles.container}>
			<Pressable
				style={[styles.button, getButtonStyle()]}
				onPress={handlePress}
				onLongPress={handleLongPress}
				delayLongPress={1000}
				accessibilityLabel={getButtonText()}
				accessibilityHint={
					hasActiveJourney
						? 'Appui long pour arrêter'
						: "Commencer l'enregistrement du trajet"
				}
			>
				<Text style={styles.icon}>{getIcon()}</Text>
				<Text style={styles.text}>{getButtonText()}</Text>
			</Pressable>
			{hasActiveJourney && (
				<Text style={styles.hint}>Appui long pour terminer</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING.lg,
		paddingVertical: SPACING.md,
		borderRadius: 30,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	startButton: {
		backgroundColor: COLORS.primary,
	},
	recordingButton: {
		backgroundColor: COLORS.error,
	},
	pausedButton: {
		backgroundColor: COLORS.warning,
	},
	icon: {
		fontSize: 20,
		marginRight: SPACING.sm,
	},
	text: {
		color: COLORS.textLight,
		fontSize: 16,
		fontWeight: '600',
	},
	hint: {
		marginTop: SPACING.xs,
		fontSize: 12,
		color: COLORS.textSecondary,
	},
});
