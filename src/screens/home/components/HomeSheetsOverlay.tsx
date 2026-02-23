import type React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { ActionButtons } from '../../../components';
import {
	EmbarquerSheet,
	NavigationCompleteSheet,
} from '../../../navigation/components';
import type { NavigationRoute, SpotOnRoute } from '../../../navigation/types';
import { SpotDetailsSheet, SpotForm } from '../../../spot/components';
import type { Spot } from '../../../spot/types';
import { homeScreenStyles as styles } from '../homeScreenStyles';
import type { NamedLocation } from '../types';

interface HomeSheetsOverlayProps {
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	selectedSpot: Spot | null;
	showEmbarquerSheet: boolean;
	showCompletionSheet: boolean;
	navigationRoute: NavigationRoute | null;
	navigationSpotsOnRoute: SpotOnRoute[];
	journeyDurationMinutes: number;
	embarquerOrigin: NamedLocation | null;
	embarquerDestination: NamedLocation | null;
	onConfirmSpotPlacement: () => void;
	onCancelSpotPlacement: () => void;
	onSubmitSpotForm: React.ComponentProps<typeof SpotForm>['onSubmit'];
	onCancelSpotForm: () => void;
	onCloseSpotDetails: () => void;
	onSpotEmbarquer: NonNullable<
		React.ComponentProps<typeof SpotDetailsSheet>['onEmbarquer']
	>;
	onEmbarquerStart: React.ComponentProps<typeof EmbarquerSheet>['onStart'];
	onEmbarquerClose: () => void;
	onSaveJourney: () => void;
	onDiscardJourney: () => void;
}

export const HomeSheetsOverlay: React.FC<HomeSheetsOverlayProps> = ({
	isPlacingSpot,
	isShowingForm,
	selectedSpot,
	showEmbarquerSheet,
	showCompletionSheet,
	navigationRoute,
	navigationSpotsOnRoute,
	journeyDurationMinutes,
	embarquerOrigin,
	embarquerDestination,
	onConfirmSpotPlacement,
	onCancelSpotPlacement,
	onSubmitSpotForm,
	onCancelSpotForm,
	onCloseSpotDetails,
	onSpotEmbarquer,
	onEmbarquerStart,
	onEmbarquerClose,
	onSaveJourney,
	onDiscardJourney,
}) => {
	return (
		<KeyboardAvoidingView
			style={styles.nonMapOverlay}
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
					spot={selectedSpot}
					onClose={onCloseSpotDetails}
					onEmbarquer={onSpotEmbarquer}
				/>
			)}

			{/* Embarquer sheet */}
			{showEmbarquerSheet && (
				<EmbarquerSheet
					initialStart={embarquerOrigin ?? undefined}
					initialDestination={embarquerDestination ?? undefined}
					onStart={onEmbarquerStart}
					onClose={onEmbarquerClose}
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

			<Toast />
		</KeyboardAvoidingView>
	);
};
