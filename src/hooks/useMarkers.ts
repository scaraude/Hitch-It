import { useState } from 'react';
import { toastUtils } from '../components/ui';
import { COLORS, MAP_CONFIG } from '../constants';
import { MapRegion, MarkerData } from '../types';

interface UseMarkersReturn {
    markers: MarkerData[];
    isPlacingMarker: boolean;
    startPlacingMarker: () => void;
    confirmMarkerPlacement: (region: MapRegion) => void;
    cancelMarkerPlacement: () => void;
}

export const useMarkers = (): UseMarkersReturn => {
    const [markers, setMarkers] = useState<MarkerData[]>([
        {
            id: '1',
            coordinate: {
                latitude: MAP_CONFIG.defaultRegion.latitude,
                longitude: MAP_CONFIG.defaultRegion.longitude,
            },
            title: 'Test Marker',
            description: 'This is a description of the marker',
            color: COLORS.primary,
        },
    ]);
    const [isPlacingMarker, setIsPlacingMarker] = useState(false);


    const startPlacingMarker = () => {
        setIsPlacingMarker(true);
    };

    const confirmMarkerPlacement = (region: MapRegion) => {
        const newMarker: MarkerData = {
            id: Date.now().toString(),
            coordinate: {
                latitude: region.latitude,
                longitude: region.longitude,
            },
            title: `Marker ${markers.length + 1}`,
            description: 'A new marker',
            color: COLORS.secondary,
        };
        setMarkers([...markers, newMarker]);
        setIsPlacingMarker(false);
        toastUtils.success('Marker Added', `New marker saved at ${region.latitude.toFixed(6)}, ${region.longitude.toFixed(6)}`);
    };

    const cancelMarkerPlacement = () => {
        setIsPlacingMarker(false);
    };

    return {
        markers,
        isPlacingMarker,
        startPlacingMarker,
        confirmMarkerPlacement,
        cancelMarkerPlacement,
    };
};