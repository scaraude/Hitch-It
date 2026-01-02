import type React from 'react';
import { createContext, useContext } from 'react';
import type { UseSpotsReturn } from '../hooks/useSpots';
import { useSpots } from '../hooks/useSpots';

const SpotContext = createContext<UseSpotsReturn | null>(null);

export const SpotProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const spotsState = useSpots();
	return (
		<SpotContext.Provider value={spotsState}>{children}</SpotContext.Provider>
	);
};

export const useSpotContext = (): UseSpotsReturn => {
	const context = useContext(SpotContext);
	if (!context) {
		throw new Error('useSpotContext must be used within SpotProvider');
	}
	return context;
};
