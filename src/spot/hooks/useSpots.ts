import { useEffect, useState } from 'react';
import { toastUtils } from '../../components/ui';
import { COLORS } from '../../constants';
import type { MapRegion } from '../../types';
import { logger } from '../../utils';
import { createSpot, getAllSpots } from '../services';
import type {
	Appreciation,
	Direction,
	Location,
	Spot,
	SpotMarkerData,
} from '../types';
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
			logger.spot.info('Loading spots on mount');
			try {
				const spots = await getAllSpots();
				if (isMounted) {
					setFullSpots(spots);
					logger.spot.info('Spots loaded successfully', {
						count: spots.length,
					});
				}
			} catch (error) {
				logger.spot.error('Failed to load spots', error);
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
		logger.spot.info('User started placing spot');
		setIsPlacingSpot(true);
	};

	const confirmSpotPlacement = (region: MapRegion) => {
		const location: Location = {
			latitude: region.latitude,
			longitude: region.longitude,
		};
		logger.spot.info('Spot placement confirmed', {
			latitude: location.latitude,
			longitude: location.longitude,
		});
		setPendingLocation(location);
		setIsPlacingSpot(false);
		setIsShowingForm(true);
	};

	const submitSpotForm = (formData: SpotFormData) => {
		if (!pendingLocation) {
			logger.spot.warn('Submit spot form called without pending location');
			return;
		}

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

		logger.spot.info('Submitting spot form', {
			roadName: formData.roadName,
			direction: formData.direction,
			appreciation: formData.appreciation,
			destinationsCount: formData.destinations.length,
		});

		setIsShowingForm(false);
		setPendingLocation(null);

		void createSpot(newSpot)
			.then(() => {
				setFullSpots(previous => [...previous, newSpot]);
				logger.spot.info('Spot created and added to state', { id: newSpot.id });
				toastUtils.success(
					'Spot créé',
					`Nouveau spot sur ${formData.roadName}`
				);
			})
			.catch(error => {
				logger.spot.error('Failed to create spot in database', error);
				toastUtils.error(
					'Création impossible',
					"Le spot n'a pas pu être enregistré."
				);
			});
	};

	const cancelSpotPlacement = () => {
		logger.spot.info('User cancelled spot placement');
		setIsPlacingSpot(false);
		setPendingLocation(null);
	};

	const cancelSpotForm = () => {
		logger.spot.info('User cancelled spot form');
		setIsShowingForm(false);
		setPendingLocation(null);
	};

	const selectSpot = (spotId: string) => {
		const spotIdBranded = createSpotId(spotId);
		const spot = fullSpots.find(s => s.id === spotIdBranded);
		if (spot) {
			logger.spot.info('Spot selected', { spotId });
			setSelectedSpot(spot);
		} else {
			logger.spot.warn('Spot not found for selection', { spotId });
		}
	};

	const deselectSpot = () => {
		logger.spot.info('Spot deselected');
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
