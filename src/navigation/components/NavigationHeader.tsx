import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING } from '../../constants';

interface NavigationHeaderProps {
	destinationName: string;
	distanceKm: number;
	onStop: () => void;
}

export function NavigationHeader({
	destinationName,
	distanceKm,
	onStop,
}: NavigationHeaderProps) {
	const insets = useSafeAreaInsets();

	return (
		<View
			style={[styles.header, { paddingBottom: insets.bottom + SPACING.sm }]}
		>
			<View style={styles.leftSection}>
				<Text style={styles.destination} numberOfLines={1}>
					Vers {destinationName}
				</Text>
				<Text style={styles.distance}>{distanceKm} km</Text>
			</View>
			<Pressable
				style={({ pressed }) => [
					styles.stopButton,
					pressed && styles.stopButtonPressed,
				]}
				onPress={onStop}
			>
				<Text style={styles.stopText}>Stop</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 2000,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: SPACING.md,
		paddingTop: SPACING.md,
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		borderTopLeftRadius: SIZES.radiusXLarge,
		borderTopRightRadius: SIZES.radiusXLarge,
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 5,
	},
	leftSection: {
		flex: 1,
		marginRight: SPACING.md,
	},
	destination: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.primary,
	},
	distance: {
		fontSize: 14,
		color: COLORS.textSecondary,
		marginTop: 2,
	},
	stopButton: {
		paddingVertical: SPACING.sm,
		paddingHorizontal: SPACING.md,
		borderRadius: 8,
		backgroundColor: COLORS.error,
	},
	stopButtonPressed: {
		opacity: 0.8,
	},
	stopText: {
		color: COLORS.textLight,
		fontWeight: '600',
		fontSize: 14,
	},
});
