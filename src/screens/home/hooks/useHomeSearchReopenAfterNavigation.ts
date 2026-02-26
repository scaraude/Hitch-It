import { useCallback, useEffect, useState } from 'react';

interface UseHomeSearchReopenAfterNavigationArgs {
	canUseSearch: boolean;
	handleSearchOpen: () => void;
	handleStopNavigation: () => Promise<void>;
}

interface UseHomeSearchReopenAfterNavigationReturn {
	handleStopNavigationAndOpenSearch: () => Promise<void>;
}

export const useHomeSearchReopenAfterNavigation = ({
	canUseSearch,
	handleSearchOpen,
	handleStopNavigation,
}: UseHomeSearchReopenAfterNavigationArgs): UseHomeSearchReopenAfterNavigationReturn => {
	const [
		shouldOpenSearchAfterNavigationStop,
		setShouldOpenSearchAfterNavigationStop,
	] = useState(false);

	const handleStopNavigationAndOpenSearch = useCallback(async () => {
		setShouldOpenSearchAfterNavigationStop(true);
		await handleStopNavigation();
	}, [handleStopNavigation]);

	useEffect(() => {
		if (!shouldOpenSearchAfterNavigationStop || !canUseSearch) {
			return;
		}

		handleSearchOpen();
		setShouldOpenSearchAfterNavigationStop(false);
	}, [canUseSearch, handleSearchOpen, shouldOpenSearchAfterNavigationStop]);

	return { handleStopNavigationAndOpenSearch };
};
