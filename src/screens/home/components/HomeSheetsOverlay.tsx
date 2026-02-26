import type React from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
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
import type { NavigationRoute, SpotOnRoute } from '../../../navigation/types';
import { SpotDetailsSheet, SpotForm } from '../../../spot/components';
import type { Spot } from '../../../spot/types';
import type { Location } from '../../../types';
import { homeScreenStyles as homeStyles } from '../homeScreenStyles';
import type { NamedLocation } from '../types';

const SPOT_HITCH_BOTTOM_OFFSET = SPACING.sm;
const SPOT_HITCH_HORIZONTAL_PADDING = SPACING.lg;

interface HomeSheetsOverlayProps {
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	selectedSpot: Spot | null;
	showEmbarquerSheet: boolean;
	showDriverDirectionSheet: boolean;
	showCompletionSheet: boolean;
	navigationRoute: NavigationRoute | null;
	navigationSpotsOnRoute: SpotOnRoute[];
	journeyDurationMinutes: number;
	embarquerOrigin: NamedLocation | null;
	embarquerDestination: NamedLocation | null;
	userLocation: Location | null;
	onConfirmSpotPlacement: () => void;
	onCancelSpotPlacement: () => void;
	onSubmitSpotForm: React.ComponentProps<typeof SpotForm>['onSubmit'];
	onCancelSpotForm: () => void;
	onCloseSpotDetails: () => void;
	onSpotEmbarquer: (spot: Spot) => void;
	onEmbarquerStart: React.ComponentProps<typeof EmbarquerSheet>['onStart'];
	onDriverDirectionCompare: React.ComponentProps<
		typeof DriverDirectionSheet
	>['onCompare'];
	onCloseDriverDirectionSheet: () => void;
	onEmbarquerClose: () => void;
	onSaveJourney: () => void;
	onDiscardJourney: () => void;
}

export const HomeSheetsOverlay: React.FC<HomeSheetsOverlayProps> = ({
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
}) => {
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
				<Pressable
					style={({ pressed }) => [
						styles.spotHitchButton,
						{ bottom: insets.bottom + SPOT_HITCH_BOTTOM_OFFSET },
						pressed && styles.spotHitchButtonPressed,
					]}
					onPress={() => onSpotEmbarquer(selectedSpot)}
					accessibilityLabel="Hitch from this spot"
					accessibilityRole="button"
					testID="spot-embarquer-button"
				>
					<Text style={styles.spotHitchButtonText}>Hitch it</Text>
				</Pressable>
			) : null}

			<Toast />
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	spotHitchButton: {
		position: 'absolute',
		left: SPOT_HITCH_HORIZONTAL_PADDING,
		right: SPOT_HITCH_HORIZONTAL_PADDING,
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
