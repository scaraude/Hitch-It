import type React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { ActionButtons } from '../../../components';
import {
	DriverDirectionSheet,
	EmbarquerSheet,
	NavigationCompleteSheet,
} from '../../../navigation/components';
import type { NavigationRoute, SpotOnRoute } from '../../../navigation/types';
import { SpotDetailsSheet, SpotForm } from '../../../spot/components';
import type { Spot } from '../../../spot/types';
import type { Location } from '../../../types';
import { homeScreenStyles as styles } from '../homeScreenStyles';
import type { NamedLocation } from '../types';

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
	onSpotEmbarquer: NonNullable<
		React.ComponentProps<typeof SpotDetailsSheet>['onEmbarquer']
	>;
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

			<Toast />
		</KeyboardAvoidingView>
	);
};
