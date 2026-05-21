import type React from 'react';
import {
	ActivityIndicator,
	Pressable,
	type StyleProp,
	StyleSheet,
	Text,
	type ViewStyle,
} from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
	label: string;
	onPress: () => void;
	variant?: ButtonVariant;
	disabled?: boolean;
	loading?: boolean;
	style?: StyleProp<ViewStyle>;
	accessibilityLabel?: string;
	testID?: string;
}

const FOREGROUND: Record<ButtonVariant, string> = {
	primary: COLORS.onAction,
	secondary: COLORS.textLight,
	ghost: COLORS.accent,
};

export const Button: React.FC<ButtonProps> = ({
	label,
	onPress,
	variant = 'primary',
	disabled = false,
	loading = false,
	style,
	accessibilityLabel,
	testID,
}) => {
	const isDisabled = disabled || loading;

	return (
		<Pressable
			onPress={onPress}
			disabled={isDisabled}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityState={{ disabled: isDisabled, busy: loading }}
			testID={testID}
			style={({ pressed }) => [
				styles.base,
				styles[variant],
				pressed && !isDisabled && styles.pressed,
				isDisabled && styles.disabled,
				style,
			]}
		>
			{loading ? (
				<ActivityIndicator color={FOREGROUND[variant]} />
			) : (
				<Text style={[styles.label, { color: FOREGROUND[variant] }]}>
					{label}
				</Text>
			)}
		</Pressable>
	);
};

const styles = StyleSheet.create({
	base: {
		minHeight: SIZES.buttonHeight,
		paddingVertical: SPACING.sm,
		paddingHorizontal: SPACING.lg,
		borderRadius: SIZES.radiusMd,
		alignItems: 'center',
		justifyContent: 'center',
	},
	primary: {
		backgroundColor: COLORS.action,
	},
	secondary: {
		backgroundColor: COLORS.accent,
	},
	ghost: {
		backgroundColor: 'transparent',
		borderWidth: 1.5,
		borderColor: COLORS.accent,
	},
	label: {
		fontSize: SIZES.fontMd,
		fontWeight: '700',
		letterSpacing: 0.3,
	},
	pressed: {
		opacity: 0.9,
		transform: [{ scale: 0.98 }],
	},
	disabled: {
		opacity: 0.5,
	},
});
