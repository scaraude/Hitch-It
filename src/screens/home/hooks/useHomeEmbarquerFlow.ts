import { useCallback, useState } from 'react';
import { toastUtils } from '../../../components/ui';
import type { Spot } from '../../../spot/types';
import type { Location } from '../../../types';
import { logger } from '../../../utils';
import type { NamedLocation } from '../types';

interface NavigationStartResult {
	success: boolean;
	message?: string;
}

interface UseHomeEmbarquerFlowArgs {
	startNavigationWithRoute: (
		startLocation: Location,
		destinationLocation: Location,
		destinationName: string
	) => Promise<NavigationStartResult>;
	startRecording: () => Promise<boolean>;
	markJourneyStarted: () => void;
	onDeselectSpot: () => void;
}

interface UseHomeEmbarquerFlowReturn {
	showEmbarquerSheet: boolean;
	embarquerOrigin: NamedLocation | null;
	embarquerDestination: NamedLocation | null;
	handleEmbarquerFromSearch: (destination: NamedLocation) => void;
	handleLongPressEmbarquer: (location: Location | null) => void;
	handleSpotEmbarquer: (spot: Spot) => void;
	handleEmbarquerStart: (
		start: NamedLocation,
		destination: NamedLocation
	) => Promise<void>;
	handleEmbarquerClose: () => void;
}

export const useHomeEmbarquerFlow = ({
	startNavigationWithRoute,
	startRecording,
	markJourneyStarted,
	onDeselectSpot,
}: UseHomeEmbarquerFlowArgs): UseHomeEmbarquerFlowReturn => {
	const [showEmbarquerSheet, setShowEmbarquerSheet] = useState(false);
	const [embarquerOrigin, setEmbarquerOrigin] = useState<NamedLocation | null>(
		null
	);
	const [embarquerDestination, setEmbarquerDestination] =
		useState<NamedLocation | null>(null);

	const clearEmbarquerState = useCallback(() => {
		setShowEmbarquerSheet(false);
		setEmbarquerOrigin(null);
		setEmbarquerDestination(null);
	}, []);

	const handleEmbarquerFromSearch = useCallback(
		(destination: NamedLocation) => {
			setEmbarquerOrigin(null);
			setEmbarquerDestination(destination);
			setShowEmbarquerSheet(true);
		},
		[]
	);

	const handleLongPressEmbarquer = useCallback((location: Location | null) => {
		if (!location) return;

		setEmbarquerOrigin(null);
		setEmbarquerDestination({
			location,
			name: 'Position sélectionnée',
		});
		setShowEmbarquerSheet(true);
	}, []);

	const handleSpotEmbarquer = useCallback(
		(spot: Spot) => {
			onDeselectSpot();
			setEmbarquerOrigin({
				location: spot.coordinates,
				name: spot.roadName,
			});
			setShowEmbarquerSheet(true);
		},
		[onDeselectSpot]
	);

	const handleEmbarquerStart = useCallback(
		async (start: NamedLocation, destination: NamedLocation) => {
			clearEmbarquerState();

			const result = await startNavigationWithRoute(
				start.location,
				destination.location,
				destination.name
			);

			if (!result.success) {
				toastUtils.error('Erreur', result.message ?? 'Navigation impossible');
				return;
			}

			const journeyStarted = await startRecording();
			if (journeyStarted) {
				markJourneyStarted();
				logger.navigation.info('Journey recording started with custom route');
			}
		},
		[
			clearEmbarquerState,
			markJourneyStarted,
			startNavigationWithRoute,
			startRecording,
		]
	);

	return {
		showEmbarquerSheet,
		embarquerOrigin,
		embarquerDestination,
		handleEmbarquerFromSearch,
		handleLongPressEmbarquer,
		handleSpotEmbarquer,
		handleEmbarquerStart,
		handleEmbarquerClose: clearEmbarquerState,
	};
};
