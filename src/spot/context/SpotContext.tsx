import type React from 'react';
import { createContext, useContext } from 'react';
import type { MapBounds } from '../../types';
import type { UseSpotsReturn } from '../hooks/useSpots';
import { useSpots } from '../hooks/useSpots';

const SpotContext = createContext<UseSpotsReturn | null>(null);

interface SpotProviderProps {
	children: React.ReactNode;
	bounds: MapBounds | null;
	zoomLevel: number;
}

export const SpotProvider: React.FC<SpotProviderProps> = ({
	children,
	bounds,
	zoomLevel,
}) => {
	const spotsState = useSpots(bounds, zoomLevel);
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
