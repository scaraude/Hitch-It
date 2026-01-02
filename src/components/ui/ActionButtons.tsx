import type React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants';
import { A11Y_LABELS } from '../../constants/accessibility';
import { FloatingButton } from './FloatingButton';

interface ActionButtonsProps {
	onConfirm: () => void;
	onCancel: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
	onConfirm,
	onCancel,
}) => {
	return (
		<View style={styles.container}>
			<FloatingButton
				onPress={onCancel}
				icon="×"
				backgroundColor={COLORS.error}
				accessibilityLabel={A11Y_LABELS.cancelAction}
				accessibilityHint={A11Y_LABELS.cancelSpotHint}
			/>
			<FloatingButton
				onPress={onConfirm}
				icon="✓"
				backgroundColor={COLORS.success}
				accessibilityLabel={A11Y_LABELS.confirmSpot}
				accessibilityHint={A11Y_LABELS.confirmSpotHint}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 60,
		alignSelf: 'center',
		flexDirection: 'row',
		gap: 80,
	},
});
