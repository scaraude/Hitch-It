import type React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';

type ActionButtonVariant = 'default' | 'large';

interface ActionButtonProps {
	onPress: () => void;
	label: string;
	backgroundColor?: string;
	bottomOffset?: number;
	variant?: ActionButtonVariant;
	withContainer?: boolean;
	accessibilityLabel?: string;
	testID?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
	onPress,
	label,
	backgroundColor = COLORS.warning,
	bottomOffset,
	variant = 'default',
	withContainer = false,
	accessibilityLabel,
	testID,
}) => {
	const button = (
		<Pressable
			style={({ pressed }) => [
				variant === 'default' ? styles.button : styles.buttonLarge,
				{ backgroundColor },
				!withContainer &&
					bottomOffset !== undefined && { bottom: bottomOffset },
				pressed &&
					(variant === 'default'
						? styles.buttonPressed
						: styles.buttonLargePressed),
			]}
			onPress={onPress}
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityRole="button"
			testID={testID}
		>
			<Text
				style={
					variant === 'default' ? styles.buttonText : styles.buttonTextLarge
				}
			>
				{label}
			</Text>
		</Pressable>
	);

	if (withContainer) {
		return (
			<View
				style={[
					styles.container,
					bottomOffset !== undefined && { paddingBottom: bottomOffset },
				]}
			>
				{button}
			</View>
		);
	}

	return button;
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		paddingTop: SPACING.md,
		paddingHorizontal: SPACING.lg,
		backgroundColor: COLORS.background,
	},
	button: {
		position: 'absolute',
		left: SPACING.md,
		right: SPACING.md,
		paddingVertical: SPACING.sm + 2,
		borderRadius: SIZES.radiusXLarge,
		alignItems: 'center',
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 4,
	},
	buttonPressed: {
		opacity: 0.8,
	},
	buttonText: {
		color: COLORS.background,
		fontSize: SIZES.fontMd,
		fontWeight: '700',
		letterSpacing: 0.3,
	},
	buttonLarge: {
		borderRadius: SIZES.radiusXLarge,
		paddingVertical: SPACING.md + SPACING.xs,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.18,
		shadowRadius: 10,
		elevation: 6,
	},
	buttonLargePressed: {
		opacity: 0.9,
	},
	buttonTextLarge: {
		fontSize: SIZES.font3Xl,
		fontWeight: '700',
		color: COLORS.background,
	},
});
