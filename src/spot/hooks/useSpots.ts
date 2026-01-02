import { useEffect, useState } from 'react';
import { toastUtils } from '../../components/ui';
import { COLORS } from '../../constants';
import type { MapRegion } from '../../types';
import { createSpot, getAllSpots } from '../services';
import type { Location, Spot, SpotMarkerData } from '../types';
import { Appreciation, Direction } from '../types';
import { createSpotId } from '../utils';

export interface SpotFormData {
	appreciation: Appreciation;
	roadName: string;
	direction: Direction;
	destinations: string[];
}

export interface UseSpotsReturn {
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
	const [fullSpots, setFullSpots] = useState<Spot[]>([]);
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

	useEffect(() => {
		let isMounted = true;

		const loadSpots = async () => {
			try {
				const spots = await getAllSpots();
				if (isMounted) {
					setFullSpots(spots);
				}
			} catch (error) {
				if (isMounted) {
					toastUtils.error(
						'Chargement échoué',
						'Impossible de charger les spots hors ligne.'
					);
				}
			}
		};

		void loadSpots();

		return () => {
			isMounted = false;
		};
	}, []);

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

		const now = new Date();
		const newSpot: Spot = {
			id: createSpotId(Date.now().toString()),
			coordinates: pendingLocation,
			roadName: formData.roadName,
			appreciation: formData.appreciation,
			direction: formData.direction,
			destinations: formData.destinations,
			createdAt: now,
			updatedAt: now,
			createdBy: 'CurrentUser',
		};
		setIsShowingForm(false);
		setPendingLocation(null);

		void createSpot(newSpot)
			.then(() => {
				setFullSpots(previous => [...previous, newSpot]);
				toastUtils.success(
					'Spot créé',
					`Nouveau spot sur ${formData.roadName}`
				);
			})
			.catch(() => {
				toastUtils.error(
					'Création impossible',
					'Le spot n’a pas pu être enregistré.'
				);
			});
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
