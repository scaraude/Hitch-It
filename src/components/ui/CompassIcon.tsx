import type React from 'react';
import { useEffect, useRef } from 'react';
import {
	Animated,
	type StyleProp,
	StyleSheet,
	type ViewStyle,
} from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { COLORS } from '../../constants';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const COMPASS_VIEWBOX_SIZE = 24;
const COMPASS_DEFAULT_SIZE = 22;
const COMPASS_ANIMATION_SPEED = 12;
const COMPASS_ANIMATION_BOUNCINESS = 2;

interface CompassIconProps {
	heading: number;
	size?: number;
	animated?: boolean;
	style?: StyleProp<ViewStyle>;
}

export const CompassIcon: React.FC<CompassIconProps> = ({
	heading,
	size = COMPASS_DEFAULT_SIZE,
	animated = false,
	style,
}) => {
	const rotateAnim = useRef(new Animated.Value(-heading)).current;

	useEffect(() => {
		if (!animated) {
			rotateAnim.setValue(-heading);
			return;
		}

		Animated.spring(rotateAnim, {
			toValue: -heading,
			useNativeDriver: true,
			speed: COMPASS_ANIMATION_SPEED,
			bounciness: COMPASS_ANIMATION_BOUNCINESS,
		}).start();
	}, [animated, heading, rotateAnim]);

	const rotation = rotateAnim.interpolate({
		inputRange: [-360, 360],
		outputRange: ['-360deg', '360deg'],
	});

	return (
		<AnimatedSvg
			width={size}
			height={size}
			viewBox={`0 0 ${COMPASS_VIEWBOX_SIZE} ${COMPASS_VIEWBOX_SIZE}`}
			style={[styles.base, style, { transform: [{ rotate: rotation }] }]}
		>
			<Polygon points="12,2 15,12 12,10 9,12" fill={COLORS.error} />
			<Polygon points="12,22 9,12 12,14 15,12" fill={COLORS.border} />
		</AnimatedSvg>
	);
};

const styles = StyleSheet.create({
	base: {},
});
