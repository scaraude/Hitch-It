import type React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { useTranslation } from '../../i18n/useTranslation';

interface LoadingSpinnerProps {
	message?: string;
	size?: 'small' | 'large';
	color?: string;
	variant?: 'fullscreen' | 'inline';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	message,
	size = 'large',
	color = COLORS.primary,
	variant = 'fullscreen',
}) => {
	const { t } = useTranslation();
	const displayMessage = message ?? t('common.loading');
	const isInline = variant === 'inline';

	return (
		<View style={[styles.container, isInline ? styles.inlineContainer : null]}>
			<ActivityIndicator size={size} color={color} />
			{displayMessage && (
				<Text style={[styles.message, isInline ? styles.inlineMessage : null]}>
					{displayMessage}
				</Text>
			)}
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
	inlineContainer: {
		flex: 0,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		borderRadius: SPACING.md,
		borderWidth: 1,
		borderColor: COLORS.border,
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 4,
		elevation: 2,
	},
	message: {
		marginTop: SPACING.md,
		fontSize: 16,
		color: COLORS.text,
		textAlign: 'center',
	},
	inlineMessage: {
		marginTop: SPACING.sm,
		fontSize: 14,
	},
});
