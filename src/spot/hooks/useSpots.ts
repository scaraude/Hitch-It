import { useState } from 'react';
import { toastUtils } from '../../components/ui';
import { COLORS, MAP_CONFIG } from '../../constants';
import type { MapRegion } from '../../types';
import type { Appreciation, Direction, Location, SpotMarkerData } from '../types';

export interface SpotFormData {
    appreciation: Appreciation;
    roadName: string;
    direction: Direction;
    destinations: string[];
}

interface UseSpotsReturn {
    spots: SpotMarkerData[];
    isPlacingSpot: boolean;
    isShowingForm: boolean;
    pendingLocation: Location | null;
    startPlacingSpot: () => void;
    confirmSpotPlacement: (region: MapRegion) => void;
    cancelSpotPlacement: () => void;
    submitSpotForm: (formData: SpotFormData) => void;
    cancelSpotForm: () => void;
}

export const useSpots = (): UseSpotsReturn => {
    const [spotMarkers, setSpotMarkers] = useState<SpotMarkerData[]>([
        {
            id: '1',
            coordinates: {
                latitude: MAP_CONFIG.defaultRegion.latitude,
                longitude: MAP_CONFIG.defaultRegion.longitude,
            },
            title: 'Test Spot',
            description: 'This is a description of the spot',
            color: COLORS.primary,
        },
    ]);
    const [isPlacingSpot, setIsPlacingSpot] = useState(false);
    const [isShowingForm, setIsShowingForm] = useState(false);
    const [pendingLocation, setPendingLocation] = useState<Location | null>(null);

    const startPlacingSpot = () => {
        setIsPlacingSpot(true);
    };

    const confirmSpotPlacement = (region: MapRegion) => {
        const location: Location = {
            latitude: region.latitude,
            longitude: region.longitude,
        };
        setPendingLocation(location);
        setIsPlacingSpot(false);
        setIsShowingForm(true);
    };

    const submitSpotForm = (formData: SpotFormData) => {
        if (!pendingLocation) return;

        const newSpotMarker: SpotMarkerData = {
            id: Date.now().toString(),
            coordinates: pendingLocation,
            title: formData.roadName,
            description: `${formData.appreciation} - ${formData.direction}`,
            color: COLORS.secondary,
        };
        setSpotMarkers([...spotMarkers, newSpotMarker]);
        setIsShowingForm(false);
        setPendingLocation(null);
        toastUtils.success('Spot créé', `Nouveau spot sur ${formData.roadName}`);
    };

    const cancelSpotPlacement = () => {
        setIsPlacingSpot(false);
        setPendingLocation(null);
    };

    const cancelSpotForm = () => {
        setIsShowingForm(false);
        setPendingLocation(null);
    };

    return {
        spots: spotMarkers,
        isPlacingSpot,
        isShowingForm,
        pendingLocation,
        startPlacingSpot,
        confirmSpotPlacement,
        cancelSpotPlacement,
        submitSpotForm,
        cancelSpotForm,
    };
};