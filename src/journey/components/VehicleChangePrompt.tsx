import type React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';

interface VehicleChangePromptProps {
	visible: boolean;
	onConfirm: () => void;
	onDismiss: () => void;
}

export const VehicleChangePrompt: React.FC<VehicleChangePromptProps> = ({
	visible,
	onConfirm,
	onDismiss,
}) => {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onDismiss}
		>
			<View style={styles.backdrop}>
				<View style={styles.container}>
					<View style={styles.iconContainer}>
						<Text style={styles.icon}>🚗</Text>
					</View>

					<Text style={styles.title}>Nouveau véhicule détecté ?</Text>
					<Text style={styles.message}>
						Il semble que vous ayez changé de véhicule. Voulez-vous enregistrer
						cette étape ?
					</Text>

					<View style={styles.actions}>
						<TouchableOpacity
							style={[styles.button, styles.dismissButton]}
							onPress={onDismiss}
							activeOpacity={0.8}
						>
							<Text style={styles.dismissButtonText}>Ignorer</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.button, styles.confirmButton]}
							onPress={onConfirm}
							activeOpacity={0.8}
						>
							<Text style={styles.confirmButtonText}>Confirmer</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: SPACING.md,
	},
	container: {
		backgroundColor: COLORS.background,
		borderRadius: 16,
		padding: SPACING.lg,
		width: '100%',
		maxWidth: 400,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	iconContainer: {
		alignItems: 'center',
		marginBottom: SPACING.md,
	},
	icon: {
		fontSize: 48,
	},
	title: {
		fontSize: SIZES.fontXl,
		fontWeight: 'bold',
		color: COLORS.text,
		textAlign: 'center',
		marginBottom: SPACING.sm,
	},
	message: {
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
		textAlign: 'center',
		marginBottom: SPACING.lg,
		lineHeight: 22,
	},
	actions: {
		flexDirection: 'row',
		gap: SPACING.sm,
	},
	button: {
		flex: 1,
		paddingVertical: SPACING.md,
		borderRadius: 8,
		alignItems: 'center',
	},
	dismissButton: {
		backgroundColor: COLORS.surface,
	},
	dismissButtonText: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
	},
	confirmButton: {
		backgroundColor: COLORS.primary,
	},
	confirmButtonText: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.background,
	},
});
