import type { Spot } from '../types';

const TITLE_COORDINATE_DECIMALS = 3;
const GOOGLE_DRIVING_MODE = 'driving';
const WAITING_MINUTES_FALLBACK = '-';

export const EMPTY_MAIN_ROAD = '';
export const EMPTY_DESTINATIONS = '-';

const truncateCoordinate = (value: number, decimals: number): string => {
	const factor = 10 ** decimals;
	const truncatedValue =
		value < 0
			? Math.ceil(value * factor) / factor
			: Math.floor(value * factor) / factor;

	return truncatedValue.toFixed(decimals);
};

export const getSpotCoordinatesTitle = (spot: Spot): string => {
	const latitude = truncateCoordinate(
		spot.coordinates.latitude,
		TITLE_COORDINATE_DECIMALS
	);
	const longitude = truncateCoordinate(
		spot.coordinates.longitude,
		TITLE_COORDINATE_DECIMALS
	);

	return `${latitude}, ${longitude}`;
};

export const buildGoogleStreetViewUrl = (spot: Spot): string => {
	const { latitude, longitude } = spot.coordinates;
	return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`;
};

export const buildGoogleItineraryUrl = (spot: Spot): string => {
	const { latitude, longitude } = spot.coordinates;
	return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${GOOGLE_DRIVING_MODE}`;
};

export const getWaitingTimeLabels = () => ({
	waitingTimeLabel: WAITING_MINUTES_FALLBACK,
	waitingRecordsLabel: '0 records',
});
