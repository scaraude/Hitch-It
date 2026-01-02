import { useState } from 'react';
import { toastUtils } from '../../components/ui';
import { COLORS, MAP_CONFIG } from '../../constants';
import type { MapRegion } from '../../types';
import type { Location, Spot, SpotMarkerData } from '../types';
import { Appreciation, Direction } from '../types';
import { createSpotId } from '../utils';

export interface SpotFormData {
	appreciation: Appreciation;
	roadName: string;
	direction: Direction;
	destinations: string[];
}

interface UseSpotsReturn {
	spots: SpotMarkerData[];
	fullSpots: Spot[];
	selectedSpot: Spot | null;
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	pendingLocation: Location | null;
	startPlacingSpot: () => void;
	confirmSpotPlacement: (region: MapRegion) => void;
	cancelSpotPlacement: () => void;
	submitSpotForm: (formData: SpotFormData) => void;
	cancelSpotForm: () => void;
	selectSpot: (spotId: string) => void;
	deselectSpot: () => void;
}

export const useSpots = (): UseSpotsReturn => {
	const [fullSpots, setFullSpots] = useState<Spot[]>([
		{
			id: createSpotId('1'),
			coordinates: {
				latitude: MAP_CONFIG.defaultRegion.latitude,
				longitude: MAP_CONFIG.defaultRegion.longitude,
			},
			roadName: 'A6 Paris-Lyon',
			appreciation: Appreciation.Good,
			direction: Direction.South,
			destinations: ['Lyon', 'Marseille'],
			createdAt: new Date('2025-01-15T10:30:00'),
			updatedAt: new Date('2025-01-15T10:30:00'),
			createdBy: 'User123',
		},
	]);
	const [isPlacingSpot, setIsPlacingSpot] = useState(false);
	const [isShowingForm, setIsShowingForm] = useState(false);
	const [pendingLocation, setPendingLocation] = useState<Location | null>(null);
	const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

	const spotMarkers: SpotMarkerData[] = fullSpots.map(spot => ({
		id: spot.id as string,
		coordinates: spot.coordinates,
		title: spot.roadName,
		description: `${spot.appreciation} - ${spot.direction}`,
		color: COLORS.secondary,
	}));

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

		const newSpot: Spot = {
			id: createSpotId(Date.now().toString()),
			coordinates: pendingLocation,
			roadName: formData.roadName,
			appreciation: formData.appreciation,
			direction: formData.direction,
			destinations: formData.destinations,
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: 'CurrentUser',
		};
		setFullSpots([...fullSpots, newSpot]);
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

	const selectSpot = (spotId: string) => {
		const spotIdBranded = createSpotId(spotId);
		const spot = fullSpots.find(s => s.id === spotIdBranded);
		if (spot) {
			setSelectedSpot(spot);
		}
	};

	const deselectSpot = () => {
		setSelectedSpot(null);
	};

	return {
		spots: spotMarkers,
		fullSpots,
		selectedSpot,
		isPlacingSpot,
		isShowingForm,
		pendingLocation,
		startPlacingSpot,
		confirmSpotPlacement,
		cancelSpotPlacement,
		submitSpotForm,
		cancelSpotForm,
		selectSpot,
		deselectSpot,
	};
};
