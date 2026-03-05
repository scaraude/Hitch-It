import type React from 'react';
import { useCallback } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ActionButton } from '../../../components';
import { SPACING } from '../../../constants';
import { useTranslation } from '../../../i18n';
import {
	DriverDirectionSheet,
	NavigationCompleteSheet,
	EmbarquerSheet as NavigationSetupSheet,
} from '../../../navigation/components';
import {
	SpotDetailsSheet,
	SpotForm,
	SpotPlacementOverlay,
} from '../../../spot/components';
import {
	useHomeLocation,
	useHomeMap,
	useHomeSession,
	useHomeSpot,
} from '../context/HomeStateContext';
import { homeScreenStyles as homeStyles } from '../homeScreenStyles';
import type { NamedLocation } from '../types';

const SPOT_HITCH_BOTTOM_OFFSET = SPACING.sm;

export const HomeSheetsOverlay: React.FC = () => {
	const { userLocation } = useHomeLocation();
	const spot = useHomeSpot();
	const session = useHomeSession();
	const map = useHomeMap();
	const { t } = useTranslation();

	const insets = useSafeAreaInsets();

	const { selectedSpot } = spot;

	const shouldShowSpotHitchButton =
		!!selectedSpot &&
		!spot.isShowingForm &&
		!session.showNavigationSetupSheet &&
		!session.isDriverDirectionSheetOpen &&
		!session.showCompletionSheet;

	const handleConfirmSpotPlacement = useCallback(() => {
		spot.confirmSpotPlacement(map.mapRegion);
	}, [map.mapRegion, spot.confirmSpotPlacement]);

	const handleNavigationSetupStart = useCallback(
		(start: NamedLocation, destination: NamedLocation) => {
			void session.handleNavigationSetupStart(start, destination);
		},
		[session.handleNavigationSetupStart]
	);

	const handleSaveJourney = useCallback(() => {
		void session.handleSaveJourney();
	}, [session.handleSaveJourney]);

	const handleDiscardJourney = useCallback(() => {
		void session.handleDiscardJourney();
	}, [session.handleDiscardJourney]);

	return (
		<View style={homeStyles.nonMapOverlay} pointerEvents="box-none">
			{spot.isPlacingSpot && (
				<SpotPlacementOverlay
					onConfirm={handleConfirmSpotPlacement}
					onCancel={spot.cancelSpotPlacement}
				/>
			)}

			{spot.isShowingForm && (
				<KeyboardAvoidingView
					style={homeStyles.nonMapOverlay}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					keyboardVerticalOffset={0}
					pointerEvents="box-none"
				>
					<SpotForm
						onSubmit={spot.submitSpotForm}
						onCancel={spot.cancelSpotForm}
					/>
				</KeyboardAvoidingView>
			)}

			{selectedSpot && !spot.isShowingForm && (
				<SpotDetailsSheet
					key={selectedSpot.id as string}
					spot={selectedSpot}
					onClose={spot.deselectSpot}
				/>
			)}

			{session.showNavigationSetupSheet && (
				<NavigationSetupSheet
					initialStart={session.navigationSetupOrigin ?? undefined}
					initialDestination={session.navigationSetupDestination ?? undefined}
					currentPosition={userLocation}
					onStart={handleNavigationSetupStart}
					onClose={session.handleNavigationSetupClose}
				/>
			)}

			{session.isDriverDirectionSheetOpen && (
				<DriverDirectionSheet
					onCompare={session.handleDriverDirectionCompare}
					onClose={session.closeDriverDirectionSheet}
				/>
			)}

			{session.showCompletionSheet && session.completionRoute && (
				<NavigationCompleteSheet
					route={session.completionRoute}
					spotsUsed={session.completionSpotsUsed}
					durationMinutes={session.journeyDurationMinutes}
					onSave={handleSaveJourney}
					onDiscard={handleDiscardJourney}
				/>
			)}

			{shouldShowSpotHitchButton && selectedSpot && (
				<ActionButton
					label={t('navigation.hitchIt')}
					onPress={() => session.handleSpotNavigationSetup(selectedSpot)}
					bottomOffset={insets.bottom + SPOT_HITCH_BOTTOM_OFFSET}
					variant="large"
					withContainer
					accessibilityLabel={t('spots.hitchFromSpot')}
					testID="spot-navigation-setup-button"
				/>
			)}

			<Toast />
		</View>
	);
};
