import type React from 'react';
import { useRef } from 'react';
import {
	Animated,
	Pressable,
	type StyleProp,
	StyleSheet,
	type ViewStyle,
} from 'react-native';
import { COLORS } from '../../constants';

type ButtonSize = 'small' | 'medium';

interface MapControlButtonProps {
	icon: React.ReactNode;
	onPress: () => void;
	accessibilityLabel: string;
	size?: ButtonSize;
	active?: boolean;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

const BUTTON_SIZES: Record<ButtonSize, number> = {
	small: 40,
	medium: 48,
};

export const MapControlButton: React.FC<MapControlButtonProps> = ({
	icon,
	onPress,
	accessibilityLabel,
	size = 'medium',
	active = false,
	style,
	testID,
}) => {
	const scaleAnim = useRef(new Animated.Value(1)).current;
	const buttonSize = BUTTON_SIZES[size];

	const handlePressIn = () => {
		Animated.spring(scaleAnim, {
			toValue: 0.92,
			useNativeDriver: true,
			speed: 50,
			bounciness: 4,
		}).start();
	};

	const handlePressOut = () => {
		Animated.spring(scaleAnim, {
			toValue: 1,
			useNativeDriver: true,
			speed: 20,
			bounciness: 8,
		}).start();
	};

	return (
		<Animated.View
			style={[
				styles.container,
				{
					width: buttonSize,
					height: buttonSize,
					borderRadius: buttonSize / 2,
					transform: [{ scale: scaleAnim }],
				},
				style,
			]}
		>
			<Pressable
				onPress={onPress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				accessibilityLabel={accessibilityLabel}
				accessibilityRole="button"
				accessibilityState={{ selected: active }}
				testID={testID}
				style={[
					styles.button,
					{
						width: buttonSize,
						height: buttonSize,
						borderRadius: buttonSize / 2,
					},
					active && styles.buttonActive,
				]}
			>
				{icon}
			</Pressable>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		// Outer shadow layer for depth
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 6,
	},
	button: {
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		alignItems: 'center',
		justifyContent: 'center',
		// Subtle inner border for glass effect
		borderWidth: 0.5,
		borderColor: 'rgba(255, 255, 255, 0.8)',
	},
	buttonActive: {
		backgroundColor: COLORS.primary,
	},
});
