import type React from 'react';
import { useCallback } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import {
	ArrivalPromptSheet,
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

export const HomeSheetsOverlay: React.FC = () => {
	const { userLocation } = useHomeLocation();
	const spot = useHomeSpot();
	const session = useHomeSession();
	const map = useHomeMap();

	const { selectedSpot } = spot;

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

	const handleArrivalPromptFinish = useCallback(() => {
		void session.handleArrivalPromptFinish();
	}, [session.handleArrivalPromptFinish]);

	return (
		<View style={homeStyles.nonMapOverlay} pointerEvents="box-none">
			{spot.isPlacingSpot && (
				<SpotPlacementOverlay
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
					onDeleteSpot={spot.deleteSpotById}
					canDeleteSpot={spot.canDeleteSpot(selectedSpot)}
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

			{session.showArrivalPromptSheet && (
				<ArrivalPromptSheet
					destinationName={session.arrivalPromptDestinationName}
					onFinish={handleArrivalPromptFinish}
					onContinue={session.handleArrivalPromptContinue}
				/>
			)}

			<Toast />
		</View>
	);
};
