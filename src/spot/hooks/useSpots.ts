import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth';
import { createComment } from '../../comment/services';
import { generateCommentId } from '../../comment/utils';
import { toastUtils } from '../../components/ui';
import { COLORS } from '../../constants';
import { useTranslation } from '../../i18n/useTranslation';
import type { MapBounds, MapRegion } from '../../types';
import { logger } from '../../utils';
import { createSpot, deleteSpot, getSpotsInBounds } from '../services';
import type { SpotFormData } from '../spotFormTypes';
import type { Location, Spot, SpotMarkerData } from '../types';
import { generateSpotId } from '../utils';

export interface UseSpotsReturn {
	spots: SpotMarkerData[];
	fullSpots: Spot[];
	selectedSpot: Spot | null;
	isLoadingSpots: boolean;
	areSpotsHiddenByZoom: boolean;
	isPlacingSpot: boolean;
	isShowingForm: boolean;
	pendingLocation: Location | null;
	showSpotsAtCurrentZoom: () => void;
	startPlacingSpot: () => void;
	confirmSpotPlacement: (region: MapRegion) => void;
	cancelSpotPlacement: () => void;
	submitSpotForm: (formData: SpotFormData) => void;
	cancelSpotForm: () => void;
	selectSpot: (spotId: string) => void;
	selectSpotEntity: (spot: Spot) => void;
	deselectSpot: () => void;
	canDeleteSpot: (spot: Spot) => boolean;
	deleteSpotById: (spotId: string) => Promise<void>;
}

const MIN_ZOOM_LEVEL = 8;
const DEFAULT_SPOT_MARKER_COLOR = COLORS.secondary;
const SELECTED_SPOT_MARKER_COLOR = COLORS.error;

const normalizeUsername = (username: string): string =>
	username.trim().toLowerCase();

export const useSpots = (
	bounds: MapBounds | null,
	zoomLevel: number
): UseSpotsReturn => {
	const { user, isAuthenticated } = useAuth();
	const { t } = useTranslation();
	const [fullSpots, setFullSpots] = useState<Spot[]>([]);
	const [isLoadingSpots, setIsLoadingSpots] = useState(false);
	const [isPlacingSpot, setIsPlacingSpot] = useState(false);
	const [isShowingForm, setIsShowingForm] = useState(false);
	const [pendingLocation, setPendingLocation] = useState<Location | null>(null);
	const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
	const [hasZoomOverride, setHasZoomOverride] = useState(false);
	const areSpotsHiddenByZoom = zoomLevel < MIN_ZOOM_LEVEL && !hasZoomOverride;

	const spotMarkers: SpotMarkerData[] = useMemo(
		() =>
			fullSpots.map(spot => ({
				id: spot.id as string,
				coordinates: spot.coordinates,
				title: spot.roadName,
				description: spot.direction,
				color:
					selectedSpot?.id === spot.id
						? SELECTED_SPOT_MARKER_COLOR
						: DEFAULT_SPOT_MARKER_COLOR,
			})),
		[fullSpots, selectedSpot]
	);

	useEffect(() => {
		if (areSpotsHiddenByZoom) {
			setFullSpots([]);
			setIsLoadingSpots(false);
			logger.spot.debug('Zoom level too low, clearing spots', { zoomLevel });
			return;
		}

		if (!bounds) {
			return;
		}

		let isMounted = true;

		const loadSpotsInView = async () => {
			setIsLoadingSpots(true);
			logger.spot.info('Loading spots for viewport', {
				zoomLevel,
				bounds,
			});
			try {
				const spots = await getSpotsInBounds(bounds);
				if (isMounted) {
					setFullSpots(spots);
					logger.spot.info('Spots loaded successfully', {
						count: spots.length,
					});
				}
			} catch (error) {
				logger.spot.error('Failed to load spots', error);
				if (isMounted) {
					if (zoomLevel < MIN_ZOOM_LEVEL) {
						setHasZoomOverride(false);
					}
					toastUtils.error(t('spots.loadError'), t('spots.loadErrorMessage'));
				}
			} finally {
				if (isMounted) {
					setIsLoadingSpots(false);
				}
			}
		};

		void loadSpotsInView();

		return () => {
			isMounted = false;
		};
	}, [areSpotsHiddenByZoom, bounds, t, zoomLevel]);

	useEffect(() => {
		if (zoomLevel >= MIN_ZOOM_LEVEL && hasZoomOverride) {
			setHasZoomOverride(false);
		}
	}, [hasZoomOverride, zoomLevel]);

	const showSpotsAtCurrentZoom = () => {
		if (!bounds || isLoadingSpots || !areSpotsHiddenByZoom) {
			return;
		}

		setHasZoomOverride(true);
		setIsLoadingSpots(true);
	};

	const startPlacingSpot = () => {
		if (!isAuthenticated || !user) {
			logger.spot.warn('Unauthenticated user attempted to create a spot');
			toastUtils.error(t('spots.authRequired'), t('spots.authRequiredMessage'));
			return;
		}
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
		if (!isAuthenticated || !user) {
			logger.spot.warn('Unauthenticated user attempted to create a spot');
			toastUtils.error(t('spots.createError'), t('spots.authRequiredMessage'));
			return;
		}

		const authorUsername = user.username.trim();
		if (!authorUsername) {
			logger.spot.error(
				'Authenticated user has no username, blocking spot creation',
				{
					userId: user.id,
				}
			);
			toastUtils.error(
				t('spots.createError'),
				t('spots.usernameUnavailableMessage')
			);
			return;
		}

		const now = new Date();
		const newSpot: Spot = {
			id: generateSpotId(),
			coordinates: pendingLocation,
			roadName: formData.roadName,
			direction: formData.direction,
			destinations: formData.destinations,
			createdAt: now,
			updatedAt: now,
			createdBy: authorUsername,
		};
		const newComment = {
			id: generateCommentId(),
			spotId: newSpot.id,
			appreciation: formData.appreciation,
			comment: formData.comment.trim(),
			createdAt: now,
			updatedAt: now,
			createdBy: authorUsername,
		};

		logger.spot.info('Submitting spot form', {
			roadName: formData.roadName,
			direction: formData.direction,
			commentAppreciation: formData.appreciation,
			destinationsCount: formData.destinations.length,
		});

		setIsShowingForm(false);
		setPendingLocation(null);

		void createSpot(newSpot)
			.then(async () => {
				setFullSpots(previous => [...previous, newSpot]);
				logger.spot.info('Spot created and added to state', { id: newSpot.id });

				try {
					await createComment(newComment);
					toastUtils.success(
						t('spots.createSuccess'),
						t('spots.createSuccessMessage', {
							roadName: formData.roadName,
						})
					);
				} catch (error) {
					logger.spot.error('Spot created but comment creation failed', error, {
						spotId: newSpot.id,
					});
					toastUtils.info(
						t('spots.createSuccess'),
						t('spots.createSuccessCommentFailedMessage')
					);
				}
			})
			.catch(error => {
				logger.spot.error('Failed to create spot in database', error);
				toastUtils.error(t('spots.createError'), t('spots.createErrorMessage'));
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
		const spot = fullSpots.find(s => s.id === spotId);
		if (spot) {
			logger.spot.info('Spot selected', { spotId });
			setSelectedSpot(spot);
		} else {
			logger.spot.warn('Spot not found for selection', { spotId });
		}
	};

	const selectSpotEntity = (spot: Spot) => {
		logger.spot.info('Spot entity selected', { spotId: spot.id });
		setSelectedSpot(spot);
	};

	const canDeleteSpot = (spot: Spot): boolean => {
		if (!isAuthenticated || !user) {
			return false;
		}

		return (
			normalizeUsername(user.username) === normalizeUsername(spot.createdBy)
		);
	};

	const deleteSpotById = async (spotId: string): Promise<void> => {
		const spotToDelete = fullSpots.find(spot => spot.id === spotId);
		if (!spotToDelete) {
			logger.spot.warn('Spot not found for deletion', { spotId });
			return;
		}

		if (!canDeleteSpot(spotToDelete)) {
			logger.spot.warn('User attempted to delete spot without ownership', {
				spotId,
				spotOwner: spotToDelete.createdBy,
				currentUser: user?.username ?? null,
			});
			toastUtils.error(
				t('spots.deleteForbidden'),
				t('spots.deleteForbiddenMessage')
			);
			return;
		}

		try {
			await deleteSpot(spotId);
			setFullSpots(previous => previous.filter(spot => spot.id !== spotId));
			setSelectedSpot(previous => (previous?.id === spotId ? null : previous));
			toastUtils.success(
				t('spots.deleteSuccess'),
				t('spots.deleteSuccessMessage')
			);
		} catch (error) {
			logger.spot.error('Failed to delete owned spot', error, { spotId });
			toastUtils.error(t('spots.deleteError'), t('spots.deleteErrorMessage'));
			throw error;
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
		isLoadingSpots,
		areSpotsHiddenByZoom,
		isPlacingSpot,
		isShowingForm,
		pendingLocation,
		showSpotsAtCurrentZoom,
		startPlacingSpot,
		confirmSpotPlacement,
		cancelSpotPlacement,
		submitSpotForm,
		cancelSpotForm,
		selectSpot,
		selectSpotEntity,
		deselectSpot,
		canDeleteSpot,
		deleteSpotById,
	};
};
