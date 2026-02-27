import type React from 'react';
import { useCallback } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ActionButtons } from '../../../components';
import { COLORS, SIZES, SPACING } from '../../../constants';
import {
	DriverDirectionSheet,
	EmbarquerSheet,
	NavigationCompleteSheet,
} from '../../../navigation/components';
import { SpotDetailsSheet, SpotForm } from '../../../spot/components';
import {
	useHomeLocation,
	useHomeMap,
	useHomeNav,
	useHomeSession,
	useHomeSpot,
} from '../context/HomeStateContext';
import { homeScreenStyles as homeStyles } from '../homeScreenStyles';
import type { NamedLocation } from '../types';

const SPOT_HITCH_BOTTOM_OFFSET = SPACING.sm;
const SPOT_HITCH_HORIZONTAL_PADDING = SPACING.lg;

export const HomeSheetsOverlay: React.FC = () => {
	const { userLocation } = useHomeLocation();
	const spot = useHomeSpot();
	const session = useHomeSession();
	const nav = useHomeNav();
	const map = useHomeMap();

	const insets = useSafeAreaInsets();

	const { selectedSpot } = spot;

	const shouldShowSpotHitchButton =
		!!selectedSpot &&
		!spot.isShowingForm &&
		!session.showEmbarquerSheet &&
		!session.isDriverDirectionSheetOpen &&
		!session.showCompletionSheet;

	const handleConfirmSpotPlacement = useCallback(() => {
		spot.confirmSpotPlacement(map.mapRegion);
	}, [map.mapRegion, spot.confirmSpotPlacement]);

	const handleEmbarquerStart = useCallback(
		(start: NamedLocation, destination: NamedLocation) => {
			void session.handleEmbarquerStart(start, destination);
		},
		[session.handleEmbarquerStart]
	);

	const handleSaveJourney = useCallback(() => {
		void session.handleSaveJourney();
	}, [session.handleSaveJourney]);

	const handleDiscardJourney = useCallback(() => {
		void session.handleDiscardJourney();
	}, [session.handleDiscardJourney]);

	return (
		<KeyboardAvoidingView
			style={homeStyles.nonMapOverlay}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={0}
			pointerEvents="box-none"
		>
			{spot.isPlacingSpot && (
				<ActionButtons
					onConfirm={handleConfirmSpotPlacement}
					onCancel={spot.cancelSpotPlacement}
				/>
			)}

			{spot.isShowingForm && (
				<SpotForm
					onSubmit={spot.submitSpotForm}
					onCancel={spot.cancelSpotForm}
				/>
			)}

			{selectedSpot && !spot.isShowingForm && (
				<SpotDetailsSheet
					key={selectedSpot.id as string}
					spot={selectedSpot}
					onClose={spot.deselectSpot}
				/>
			)}

			{session.showEmbarquerSheet && (
				<EmbarquerSheet
					initialStart={session.embarquerOrigin ?? undefined}
					initialDestination={session.embarquerDestination ?? undefined}
					currentPosition={userLocation}
					onStart={handleEmbarquerStart}
					onClose={session.handleEmbarquerClose}
				/>
			)}

			{session.isDriverDirectionSheetOpen && (
				<DriverDirectionSheet
					onCompare={session.handleDriverDirectionCompare}
					onClose={session.closeDriverDirectionSheet}
				/>
			)}

			{session.showCompletionSheet && nav.navigation.route && (
				<NavigationCompleteSheet
					route={nav.navigation.route}
					spotsUsed={nav.navigation.spotsOnRoute}
					durationMinutes={session.journeyDurationMinutes}
					onSave={handleSaveJourney}
					onDiscard={handleDiscardJourney}
				/>
			)}

			{shouldShowSpotHitchButton && selectedSpot && (
				<View
					style={[
						styles.spotHitchContainer,
						{ paddingBottom: insets.bottom + SPOT_HITCH_BOTTOM_OFFSET },
					]}
				>
					<Pressable
						style={({ pressed }) => [
							styles.spotHitchButton,
							pressed && styles.spotHitchButtonPressed,
						]}
						onPress={() => session.handleSpotEmbarquer(selectedSpot)}
						accessibilityLabel="Hitch from this spot"
						accessibilityRole="button"
						testID="spot-embarquer-button"
					>
						<Text style={styles.spotHitchButtonText}>Hitch it</Text>
					</Pressable>
				</View>
			)}

			<Toast />
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	spotHitchContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		paddingTop: SPACING.md,
		paddingHorizontal: SPOT_HITCH_HORIZONTAL_PADDING,
		backgroundColor: COLORS.background,
	},
	spotHitchButton: {
		backgroundColor: COLORS.warning,
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
	spotHitchButtonPressed: {
		opacity: 0.9,
	},
	spotHitchButtonText: {
		fontSize: SIZES.font3Xl,
		fontWeight: '700',
		color: COLORS.background,
	},
});
