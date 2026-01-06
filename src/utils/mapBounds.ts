import type { Location, MapBounds, MapRegion } from '../types';

export const regionToBounds = (region: MapRegion): MapBounds => ({
	north: region.latitude + region.latitudeDelta / 2,
	south: region.latitude - region.latitudeDelta / 2,
	east: region.longitude + region.longitudeDelta / 2,
	west: region.longitude - region.longitudeDelta / 2,
});

export const isFullyContained = (
	inner: MapBounds,
	outer: MapBounds
): boolean => {
	return (
		inner.north <= outer.north &&
		inner.south >= outer.south &&
		inner.east <= outer.east &&
		inner.west >= outer.west
	);
};

export const isSpotInBounds = (spot: Location, bounds: MapBounds): boolean => {
	return (
		spot.latitude <= bounds.north &&
		spot.latitude >= bounds.south &&
		spot.longitude <= bounds.east &&
		spot.longitude >= bounds.west
	);
};

export const expandBounds = (bounds: MapBounds, factor: number): MapBounds => {
	const latPadding = (bounds.north - bounds.south) * factor;
	const lngPadding = (bounds.east - bounds.west) * factor;

	return {
		north: bounds.north + latPadding,
		south: bounds.south - latPadding,
		east: bounds.east + lngPadding,
		west: bounds.west - lngPadding,
	};
};

export const calculateZoomLevel = (region: MapRegion): number => {
	const angle = region.longitudeDelta;
	return Math.round(Math.log(360 / angle) / Math.LN2);
};
