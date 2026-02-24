import { useCallback, useState } from 'react';
import { toastUtils } from '../../../components/ui';
import type { NavigationRoute } from '../../../navigation/types';
import { logger } from '../../../utils';
import type { NamedLocation } from '../types';

interface CompareResult {
	success: boolean;
	message?: string;
}

interface UseHomeDriverDirectionArgs {
	driverRoute: NavigationRoute | null;
	compareWithDriverDirection: (
		driverDestinationLocation: NamedLocation['location'],
		driverDestinationName: string
	) => Promise<CompareResult>;
	clearDriverComparison: () => void;
}

interface UseHomeDriverDirectionReturn {
	isDriverDirectionSheetOpen: boolean;
	hasDriverComparison: boolean;
	openDriverDirectionSheet: () => void;
	closeDriverDirectionSheet: () => void;
	handleDriverDirectionCompare: (
		driverDestination: NamedLocation
	) => Promise<void>;
	handleDriverDirectionClear: () => void;
}

const DRIVER_DIRECTION_ERROR_TITLE = 'Erreur';
const DRIVER_DIRECTION_ERROR_MESSAGE = 'Comparaison impossible';

export const useHomeDriverDirection = ({
	driverRoute,
	compareWithDriverDirection,
	clearDriverComparison,
}: UseHomeDriverDirectionArgs): UseHomeDriverDirectionReturn => {
	const [isDriverDirectionSheetOpen, setIsDriverDirectionSheetOpen] =
		useState(false);

	const openDriverDirectionSheet = useCallback(() => {
		setIsDriverDirectionSheetOpen(true);
	}, []);

	const closeDriverDirectionSheet = useCallback(() => {
		setIsDriverDirectionSheetOpen(false);
	}, []);

	const handleDriverDirectionCompare = useCallback(
		async (driverDestination: NamedLocation) => {
			const result = await compareWithDriverDirection(
				driverDestination.location,
				driverDestination.name
			);

			if (!result.success) {
				toastUtils.error(
					DRIVER_DIRECTION_ERROR_TITLE,
					result.message ?? DRIVER_DIRECTION_ERROR_MESSAGE
				);
				return;
			}

			logger.navigation.info('Driver direction comparison applied', {
				driverDestination: driverDestination.name,
			});
			setIsDriverDirectionSheetOpen(false);
		},
		[compareWithDriverDirection]
	);

	const handleDriverDirectionClear = useCallback(() => {
		clearDriverComparison();
	}, [clearDriverComparison]);

	return {
		isDriverDirectionSheetOpen,
		hasDriverComparison: driverRoute !== null,
		openDriverDirectionSheet,
		closeDriverDirectionSheet,
		handleDriverDirectionCompare,
		handleDriverDirectionClear,
	};
};
