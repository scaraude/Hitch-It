import type React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants';
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
			/>
			<FloatingButton
				onPress={onConfirm}
				icon="✓"
				backgroundColor={COLORS.success}
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
