import type React from 'react';
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
import { useHomeScreenContext } from '../context/HomeScreenContext';
import { homeScreenStyles as homeStyles } from '../homeScreenStyles';

const SPOT_HITCH_BOTTOM_OFFSET = SPACING.sm;
const SPOT_HITCH_HORIZONTAL_PADDING = SPACING.lg;

export const HomeSheetsOverlay: React.FC = () => {
	const {
		sheetsOverlay: {
			isPlacingSpot,
			isShowingForm,
			selectedSpot,
			showEmbarquerSheet,
			showDriverDirectionSheet,
			showCompletionSheet,
			navigationRoute,
			navigationSpotsOnRoute,
			journeyDurationMinutes,
			embarquerOrigin,
			embarquerDestination,
			userLocation,
			onConfirmSpotPlacement,
			onCancelSpotPlacement,
			onSubmitSpotForm,
			onCancelSpotForm,
			onCloseSpotDetails,
			onSpotEmbarquer,
			onEmbarquerStart,
			onDriverDirectionCompare,
			onCloseDriverDirectionSheet,
			onEmbarquerClose,
			onSaveJourney,
			onDiscardJourney,
		},
	} = useHomeScreenContext();

	const insets = useSafeAreaInsets();
	const shouldShowSpotHitchButton =
		!!selectedSpot &&
		!isShowingForm &&
		!showEmbarquerSheet &&
		!showDriverDirectionSheet &&
		!showCompletionSheet;

	return (
		<KeyboardAvoidingView
			style={homeStyles.nonMapOverlay}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={0}
			pointerEvents="box-none"
		>
			{isPlacingSpot ? (
				<ActionButtons
					onConfirm={onConfirmSpotPlacement}
					onCancel={onCancelSpotPlacement}
				/>
			) : null}

			{isShowingForm && (
				<SpotForm onSubmit={onSubmitSpotForm} onCancel={onCancelSpotForm} />
			)}

			{selectedSpot && !isShowingForm && (
				<SpotDetailsSheet
					key={selectedSpot.id as string}
					spot={selectedSpot}
					onClose={onCloseSpotDetails}
				/>
			)}

			{/* Embarquer sheet */}
			{showEmbarquerSheet && (
				<EmbarquerSheet
					initialStart={embarquerOrigin ?? undefined}
					initialDestination={embarquerDestination ?? undefined}
					currentPosition={userLocation}
					onStart={onEmbarquerStart}
					onClose={onEmbarquerClose}
				/>
			)}

			{showDriverDirectionSheet && (
				<DriverDirectionSheet
					onCompare={onDriverDirectionCompare}
					onClose={onCloseDriverDirectionSheet}
				/>
			)}

			{/* Navigation complete sheet */}
			{showCompletionSheet && navigationRoute && (
				<NavigationCompleteSheet
					route={navigationRoute}
					spotsUsed={navigationSpotsOnRoute}
					durationMinutes={journeyDurationMinutes}
					onSave={onSaveJourney}
					onDiscard={onDiscardJourney}
				/>
			)}

			{shouldShowSpotHitchButton && selectedSpot ? (
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
						onPress={() => onSpotEmbarquer(selectedSpot)}
						accessibilityLabel="Hitch from this spot"
						accessibilityRole="button"
						testID="spot-embarquer-button"
					>
						<Text style={styles.spotHitchButtonText}>Hitch it</Text>
					</Pressable>
				</View>
			) : null}

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
