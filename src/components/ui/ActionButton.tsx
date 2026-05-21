import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from 'react-native-reanimated';
import { COLORS, FONTS, SIZES, SPACING } from '../../constants';

type ActionButtonVariant = 'default' | 'large';

interface ActionButtonProps {
	onPress: () => void;
	label: string;
	bottomOffset?: number;
	variant?: ActionButtonVariant;
	withContainer?: boolean;
	accessibilityLabel?: string;
	testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ActionButton: React.FC<ActionButtonProps> = ({
	onPress,
	label,
	bottomOffset,
	variant = 'default',
	withContainer = false,
	accessibilityLabel,
	testID,
}) => {
	const pulse = useSharedValue(1);

	useEffect(() => {
		pulse.value = withRepeat(
			withSequence(
				withTiming(1.03, { duration: 900 }),
				withTiming(1, { duration: 900 })
			),
			-1,
			true
		);
	}, [pulse]);

	const pulseStyle = useAnimatedStyle(() => ({
		transform: [{ scale: pulse.value }],
	}));

	const buttonStyle =
		variant === 'default' ? styles.button : styles.buttonLarge;
	const pressedStyle =
		variant === 'default' ? styles.buttonPressed : styles.buttonLargePressed;
	const textStyle =
		variant === 'default' ? styles.buttonText : styles.buttonTextLarge;
	const positionStyle =
		!withContainer && bottomOffset !== undefined
			? { bottom: bottomOffset }
			: undefined;

	const button = (
		<AnimatedPressable
			style={({ pressed }) => [
				buttonStyle,
				positionStyle,
				pulseStyle,
				pressed && pressedStyle,
			]}
			onPress={onPress}
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityRole="button"
			testID={testID}
		>
			<Ionicons
				name="thumbs-up"
				size={20}
				color={COLORS.onAction}
				style={styles.icon}
			/>
			<Text style={textStyle}>{label}</Text>
		</AnimatedPressable>
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
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: SPACING.sm + 2,
		borderRadius: SIZES.radiusPill,
		backgroundColor: COLORS.action,
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 4,
	},
	buttonPressed: {
		opacity: 0.85,
		transform: [{ scale: 0.98 }],
	},
	buttonText: {
		color: COLORS.onAction,
		fontFamily: FONTS.bodyBold,
		fontSize: SIZES.fontMd,
		letterSpacing: 0.3,
	},
	buttonLarge: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: SIZES.radiusPill,
		paddingVertical: SPACING.md + SPACING.xs,
		backgroundColor: COLORS.action,
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
		fontFamily: FONTS.bodyBold,
		fontSize: SIZES.font3Xl,
		color: COLORS.onAction,
	},
	icon: {
		marginRight: SPACING.xs,
	},
});
