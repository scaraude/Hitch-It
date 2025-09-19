import { Location } from '@shared-types/index';

/**
 * Calculate distance between two coordinates in kilometers
 */
export const calculateDistance = (
    coord1: Location,
    coord2: Location,
): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const lat1 = toRad(coord1.latitude);
    const lat2 = toRad(coord2.latitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

/**
 * Convert degrees to radians
 */
const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
};

/**
 * Format distance for display
 */
export const formatDistance = (distance: number): string => {
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
};

/**
 * Check if location is valid
 */
export const isValidLocation = (location: Location): boolean => {
    return (
        typeof location.latitude === 'number' &&
        typeof location.longitude === 'number' &&
        !isNaN(location.latitude) &&
        !isNaN(location.longitude) &&
        location.latitude >= -90 &&
        location.latitude <= 90 &&
        location.longitude >= -180 &&
        location.longitude <= 180
    );
};
