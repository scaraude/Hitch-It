import type React from 'react';
import { useState } from 'react';
import {
	Alert,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';
import { useJourney } from '../context';
import type { UserId } from '../types';

export const JourneyControls: React.FC = () => {
	const {
		isTracking,
		currentJourney,
		startJourney,
		stopJourney,
		pauseJourney,
		resumeJourney,
	} = useJourney();
	const [showStartModal, setShowStartModal] = useState(false);
	const [origin, setOrigin] = useState('');
	const [destination, setDestination] = useState('');

	const handleStartJourney = async () => {
		if (!origin.trim() || !destination.trim()) {
			Alert.alert('Erreur', 'Veuillez renseigner le départ et la destination');
			return;
		}

		const userId = 'anonymous-user' as UserId;
		const success = await startJourney(
			origin.trim(),
			destination.trim(),
			userId
		);

		setShowStartModal(false);
		setOrigin('');
		setDestination('');
		if (!success) {
			Alert.alert(
				'Erreur',
				'Impossible de démarrer le trajet. Vérifiez les permissions de localisation.'
			);
		}
	};

	const handleStopJourney = () => {
		Alert.alert(
			'Terminer le trajet',
			'Voulez-vous vraiment terminer ce trajet ?',
			[
				{
					text: 'Annuler',
					style: 'cancel',
				},
				{
					text: 'Terminer',
					style: 'destructive',
					onPress: stopJourney,
				},
			]
		);
	};

	return (
		<>
			<View style={styles.container}>
				{!currentJourney ? (
					<TouchableOpacity
						style={[styles.button, styles.startButton]}
						onPress={() => setShowStartModal(true)}
					>
						<Text style={styles.buttonText}>🧭 Démarrer un trajet</Text>
					</TouchableOpacity>
				) : (
					<View style={styles.controlsRow}>
						{isTracking ? (
							<TouchableOpacity
								style={[styles.button, styles.pauseButton]}
								onPress={pauseJourney}
							>
								<Text style={styles.buttonText}>⏸️ Pause</Text>
							</TouchableOpacity>
						) : (
							<TouchableOpacity
								style={[styles.button, styles.resumeButton]}
								onPress={resumeJourney}
							>
								<Text style={styles.buttonText}>▶️ Reprendre</Text>
							</TouchableOpacity>
						)}
						<TouchableOpacity
							style={[styles.button, styles.stopButton]}
							onPress={handleStopJourney}
						>
							<Text style={styles.buttonText}>⏹️ Terminer</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>

			<Modal
				visible={showStartModal}
				animationType="slide"
				transparent={true}
				onRequestClose={() => setShowStartModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Nouveau trajet</Text>

						<Text style={styles.label}>Départ</Text>
						<TextInput
							style={styles.input}
							placeholder="Ex: Bordeaux"
							value={origin}
							onChangeText={setOrigin}
							autoCapitalize="words"
						/>

						<Text style={styles.label}>Destination</Text>
						<TextInput
							style={styles.input}
							placeholder="Ex: Bayonne"
							value={destination}
							onChangeText={setDestination}
							autoCapitalize="words"
						/>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[styles.modalButton, styles.cancelButton]}
								onPress={() => {
									setShowStartModal(false);
									setOrigin('');
									setDestination('');
								}}
							>
								<Text style={styles.cancelButtonText}>Annuler</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.modalButton, styles.confirmButton]}
								onPress={handleStartJourney}
							>
								<Text style={styles.confirmButtonText}>Démarrer</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 100,
		left: SPACING.md,
		zIndex: 10,
	},
	controlsRow: {
		flexDirection: 'column',
		gap: SPACING.sm,
	},
	button: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		borderRadius: SIZES.radiusMedium,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	startButton: {
		backgroundColor: COLORS.primary,
	},
	pauseButton: {
		backgroundColor: COLORS.warning,
	},
	resumeButton: {
		backgroundColor: COLORS.success,
	},
	stopButton: {
		backgroundColor: COLORS.danger,
	},
	buttonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		backgroundColor: COLORS.background,
		borderRadius: SIZES.radiusLarge,
		padding: SPACING.lg,
		width: '85%',
		maxWidth: 400,
	},
	modalTitle: {
		fontSize: SIZES.fontXl,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: SPACING.lg,
		textAlign: 'center',
	},
	label: {
		fontSize: SIZES.fontMd,
		color: COLORS.text,
		marginBottom: SPACING.xs,
		marginTop: SPACING.md,
	},
	input: {
		backgroundColor: COLORS.surface,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: SIZES.radiusMedium,
		padding: SPACING.md,
		fontSize: SIZES.fontMd,
		color: COLORS.text,
	},
	modalButtons: {
		flexDirection: 'row',
		gap: SPACING.md,
		marginTop: SPACING.lg,
	},
	modalButton: {
		flex: 1,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
	},
	cancelButton: {
		backgroundColor: COLORS.surface,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	confirmButton: {
		backgroundColor: COLORS.primary,
	},
	cancelButtonText: {
		color: COLORS.text,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
	confirmButtonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});
