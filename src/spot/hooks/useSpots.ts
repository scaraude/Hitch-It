import { useState } from 'react';
import { toastUtils } from '../../components/ui';
import { COLORS, MAP_CONFIG } from '../../constants';
import type { MapRegion } from '../../types';
import type { SpotMarkerData } from '../types';

interface UseSpotsReturn {
    spots: SpotMarkerData[];
    isPlacingSpot: boolean;
    startPlacingSpot: () => void;
    confirmSpotPlacement: (region: MapRegion) => void;
    cancelSpotPlacement: () => void;
}

export const useSpots = (): UseSpotsReturn => {
    const [spotMarkers, setSpotMarkers] = useState<SpotMarkerData[]>([
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
        const newSpotMarker: SpotMarkerData = {
            id: Date.now().toString(),
            coordinate: {
                latitude: region.latitude,
                longitude: region.longitude,
            },
            title: `Spot ${spotMarkers.length + 1}`,
            description: 'A new spot',
            color: COLORS.secondary,
        };
        setSpotMarkers([...spotMarkers, newSpotMarker]);
        setIsPlacingSpot(false);
        toastUtils.success('Spot Added', `New spot saved at ${region.latitude.toFixed(6)}, ${region.longitude.toFixed(6)}`);
    };

    const cancelSpotPlacement = () => {
        setIsPlacingSpot(false);
    };

    return {
        spots: spotMarkers,
        isPlacingSpot,
        startPlacingSpot,
        confirmSpotPlacement,
        cancelSpotPlacement,
    };
};