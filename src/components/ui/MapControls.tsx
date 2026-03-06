import type React from 'react';
import { StyleSheet, View } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { COLORS, SPACING } from '../../constants';
import { useTranslation } from '../../i18n';
import { CompassIcon } from './CompassIcon';
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

const LOCATE_ICON_COLOR = '#626262';

export const MapControls: React.FC<MapControlsProps> = ({
	mapHeading = 0,
	isFollowingUser = false,
	onResetHeading,
	onLocateUser,
	bottomOffset = 120,
}) => {
	const { t } = useTranslation();
	// Only show compass when map is rotated (not facing north)
	const isRotated = Math.abs(mapHeading) > 5;

	return (
		<View style={[styles.container, { bottom: bottomOffset }]}>
			{/* Compass - only visible when rotated */}
			{isRotated && (
				<MapControlButton
					icon={<CompassIcon heading={-mapHeading} animated />}
					onPress={onResetHeading}
					accessibilityLabel={t('map.resetHeading')}
					size="medium"
					testID="map-control-compass"
					style={styles.compassButton}
				/>
			)}

			{/* Locate user button */}
			<MapControlButton
				icon={
					<AntDesign
						name="aim"
						size={22}
						color={isFollowingUser ? COLORS.background : LOCATE_ICON_COLOR}
					/>
				}
				onPress={onLocateUser}
				accessibilityLabel={t('map.locateUser')}
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
