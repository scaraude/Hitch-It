import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants';

interface CenterMapMarkerProps {
	color?: string;
}

/**
 * A marker fixed at the center of the map view.
 * Used during location selection to show where the user is positioning.
 */
export const CenterMapMarker: React.FC<CenterMapMarkerProps> = ({
	color = COLORS.error,
}) => {
	return (
		<View style={styles.container} pointerEvents="none">
			<View style={styles.markerContainer}>
				<Ionicons name="location" size={40} color={color} />
				{/* Shadow/ground indicator */}
				<View style={[styles.groundShadow, { backgroundColor: color }]} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
	},
	markerContainer: {
		alignItems: 'center',
		// Offset to account for marker's visual center being at the bottom point
		marginBottom: 40,
	},
	groundShadow: {
		width: 8,
		height: 4,
		borderRadius: 4,
		opacity: 0.3,
		marginTop: -4,
	},
});
