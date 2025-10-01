import { useState } from 'react';
import { toastUtils } from '../../components/ui';
import { COLORS, MAP_CONFIG } from '../../constants';
import { MapRegion, MarkerData } from '../../types';

interface UseSpotsReturn {
    spots: MarkerData[];
    isPlacingSpot: boolean;
    startPlacingSpot: () => void;
    confirmSpotPlacement: (region: MapRegion) => void;
    cancelSpotPlacement: () => void;
}

export const useSpots = (): UseSpotsReturn => {
    const [spots, setSpots] = useState<MarkerData[]>([
        {
            id: '1',
            coordinate: {
                latitude: MAP_CONFIG.defaultRegion.latitude,
                longitude: MAP_CONFIG.defaultRegion.longitude,
            },
            title: 'Test Spot',
            description: 'This is a description of the spot',
            color: COLORS.primary,
        },
    ]);
    const [isPlacingSpot, setIsPlacingSpot] = useState(false);


    const startPlacingSpot = () => {
        setIsPlacingSpot(true);
    };

    const confirmSpotPlacement = (region: MapRegion) => {
        const newSpot: MarkerData = {
            id: Date.now().toString(),
            coordinate: {
                latitude: region.latitude,
                longitude: region.longitude,
            },
            title: `Spot ${spots.length + 1}`,
            description: 'A new spot',
            color: COLORS.secondary,
        };
        setSpots([...spots, newSpot]);
        setIsPlacingSpot(false);
        toastUtils.success('Spot Added', `New spot saved at ${region.latitude.toFixed(6)}, ${region.longitude.toFixed(6)}`);
    };

    const cancelSpotPlacement = () => {
        setIsPlacingSpot(false);
    };

    return {
        spots,
        isPlacingSpot,
        startPlacingSpot,
        confirmSpotPlacement,
        cancelSpotPlacement,
    };
};