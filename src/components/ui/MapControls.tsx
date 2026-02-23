import type React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { COLORS, SPACING } from '../../constants';
import { MapControlButton } from './MapControlButton';

interface MapControlsProps {
	/** Current map heading in degrees (0-360, 0 = north) */
	mapHeading?: number;
	/** Whether the map is currently following user location */
	isFollowingUser?: boolean;
	/** Called when compass is pressed to reset heading to north */
	onResetHeading: () => void;
	/** Called when locate button is pressed */
	onLocateUser: () => void;
	/** Bottom offset to position above navbar */
	bottomOffset?: number;
}

// Animated SVG components
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const LOCATE_ICON_COLOR = '#626262';

const CompassIcon: React.FC<{ heading: number }> = ({ heading }) => {
	const rotateAnim = useRef(new Animated.Value(-heading)).current;

	useEffect(() => {
		Animated.spring(rotateAnim, {
			toValue: -heading,
			useNativeDriver: true,
			speed: 12,
			bounciness: 2,
		}).start();
	}, [heading, rotateAnim]);

	const rotation = rotateAnim.interpolate({
		inputRange: [-360, 360],
		outputRange: ['-360deg', '360deg'],
	});

	return (
		<AnimatedSvg
			width={22}
			height={22}
			viewBox="0 0 24 24"
			style={{ transform: [{ rotate: rotation }] }}
		>
			{/* North pointer - red */}
			<Polygon points="12,2 15,12 12,10 9,12" fill="#E74C3C" />
			{/* South pointer - dark gray */}
			<Polygon points="12,22 9,12 12,14 15,12" fill="#5D6D7E" />
		</AnimatedSvg>
	);
};

const LocateIcon: React.FC<{ active?: boolean }> = ({ active }) => (
	<Svg width={22} height={22} viewBox="0 0 24 24">
		{/* Crosshair */}
		<Path
			d="M12 2v3M12 19v3M2 12h3M19 12h3"
			stroke={active ? COLORS.background : LOCATE_ICON_COLOR}
			strokeWidth={2}
			strokeLinecap="round"
		/>
		{/* Center circle */}
		<Circle
			cx={12}
			cy={12}
			r={4}
			fill={active ? COLORS.background : LOCATE_ICON_COLOR}
		/>
		{/* Outer ring */}
		<Circle
			cx={12}
			cy={12}
			r={7}
			fill="none"
			stroke={active ? COLORS.background : LOCATE_ICON_COLOR}
			strokeWidth={1.5}
		/>
	</Svg>
);

export const MapControls: React.FC<MapControlsProps> = ({
	mapHeading = 0,
	isFollowingUser = false,
	onResetHeading,
	onLocateUser,
	bottomOffset = 120,
}) => {
	// Only show compass when map is rotated (not facing north)
	const isRotated = Math.abs(mapHeading) > 5;

	return (
		<View style={[styles.container, { bottom: bottomOffset }]}>
			{/* Compass - only visible when rotated */}
			{isRotated && (
				<MapControlButton
					icon={<CompassIcon heading={mapHeading} />}
					onPress={onResetHeading}
					accessibilityLabel="Réorienter la carte vers le nord"
					size="medium"
					testID="map-control-compass"
					style={styles.compassButton}
				/>
			)}

			{/* Locate user button */}
			<MapControlButton
				icon={<LocateIcon active={isFollowingUser} />}
				onPress={onLocateUser}
				accessibilityLabel="Centrer sur ma position"
				size="medium"
				active={isFollowingUser}
				testID="map-control-locate"
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		right: SPACING.md,
		alignItems: 'center',
		gap: SPACING.sm,
	},
	compassButton: {
		marginBottom: SPACING.xs,
	},
});
