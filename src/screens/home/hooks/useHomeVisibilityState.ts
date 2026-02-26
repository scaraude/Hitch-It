import { useMemo } from 'react';
import type { Spot } from '../../../spot/types';

interface UseHomeVisibilityStateArgs {
	isNavigationActive: boolean;
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	showEmbarquerSheet: boolean;
	selectedSpot: Spot | null;
	showCompletionSheet: boolean;
}

interface UseHomeVisibilityStateReturn {
	canUseSearch: boolean;
	shouldShowBottomBar: boolean;
}

export const useHomeVisibilityState = ({
	isNavigationActive,
	isPlacingSpot,
	isShowingForm,
	showEmbarquerSheet,
	selectedSpot,
	showCompletionSheet,
}: UseHomeVisibilityStateArgs): UseHomeVisibilityStateReturn => {
	return useMemo(() => {
		const isOverlayBlocking =
			isPlacingSpot ||
			isShowingForm ||
			showEmbarquerSheet ||
			Boolean(selectedSpot) ||
			showCompletionSheet;
		const canUseSearch = !isNavigationActive && !isOverlayBlocking;

		return {
			canUseSearch,
			shouldShowBottomBar: !isNavigationActive && !isOverlayBlocking,
		};
	}, [
		isNavigationActive,
		isPlacingSpot,
		isShowingForm,
		selectedSpot,
		showCompletionSheet,
		showEmbarquerSheet,
	]);
};
