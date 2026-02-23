import { useCallback, useEffect, useMemo, useState } from 'react';
import { toastUtils } from '../../../components/ui';
import { logger } from '../../../utils';

interface UseHomeJourneySessionArgs {
	hasArrived: boolean;
	isNavigationActive: boolean;
	isRecording: boolean;
	stopNavigation: () => void;
	stopRecording: () => Promise<void>;
}

interface EndSessionOptions {
	hideCompletionSheet?: boolean;
	resetJourneyStart?: boolean;
}

interface UseHomeJourneySessionReturn {
	showCompletionSheet: boolean;
	journeyDurationMinutes: number;
	markJourneyStarted: () => void;
	handleStopNavigation: () => Promise<void>;
	handleSaveJourney: () => Promise<void>;
	handleDiscardJourney: () => Promise<void>;
}

export const useHomeJourneySession = ({
	hasArrived,
	isNavigationActive,
	isRecording,
	stopNavigation,
	stopRecording,
}: UseHomeJourneySessionArgs): UseHomeJourneySessionReturn => {
	const [showCompletionSheet, setShowCompletionSheet] = useState(false);
	const [journeyStartTime, setJourneyStartTime] = useState<Date | null>(null);

	useEffect(() => {
		if (hasArrived && isNavigationActive) {
			setShowCompletionSheet(true);
		}
	}, [hasArrived, isNavigationActive]);

	const endNavigationSession = useCallback(
		async ({
			hideCompletionSheet = true,
			resetJourneyStart = true,
		}: EndSessionOptions = {}) => {
			if (hideCompletionSheet) {
				setShowCompletionSheet(false);
			}

			stopNavigation();

			if (isRecording) {
				await stopRecording();
			}

			if (resetJourneyStart) {
				setJourneyStartTime(null);
			}
		},
		[isRecording, stopNavigation, stopRecording]
	);

	const handleStopNavigation = useCallback(async () => {
		await endNavigationSession({ hideCompletionSheet: false });
		logger.navigation.info('Navigation and journey recording stopped');
	}, [endNavigationSession]);

	const handleSaveJourney = useCallback(async () => {
		await endNavigationSession();
		toastUtils.success('Voyage sauvegardé', 'Votre voyage a été enregistré');
	}, [endNavigationSession]);

	const handleDiscardJourney = useCallback(async () => {
		await endNavigationSession();
	}, [endNavigationSession]);

	const markJourneyStarted = useCallback(() => {
		setJourneyStartTime(new Date());
	}, []);

	const journeyDurationMinutes = useMemo(
		() =>
			journeyStartTime
				? Math.round((Date.now() - journeyStartTime.getTime()) / 60000)
				: 0,
		[journeyStartTime]
	);

	return {
		showCompletionSheet,
		journeyDurationMinutes,
		markJourneyStarted,
		handleStopNavigation,
		handleSaveJourney,
		handleDiscardJourney,
	};
};
