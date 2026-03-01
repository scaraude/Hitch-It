import type React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { useTranslation } from '../../i18n/useTranslation';

interface LoadingSpinnerProps {
	message?: string;
	size?: 'small' | 'large';
	color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	message,
	size = 'large',
	color = COLORS.primary,
}) => {
	const { t } = useTranslation();
	const displayMessage = message ?? t('common.loading');

	return (
		<View style={styles.container}>
			<ActivityIndicator size={size} color={color} />
			{displayMessage && <Text style={styles.message}>{displayMessage}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLORS.surface,
	},
	message: {
		marginTop: SPACING.md,
		fontSize: 16,
		color: COLORS.text,
		textAlign: 'center',
	},
});
