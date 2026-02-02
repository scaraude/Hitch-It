import type { Location, MapBounds, MapRegion } from '../types';

export const regionToBounds = (region: MapRegion): MapBounds => ({
	north: region.latitude + region.latitudeDelta / 2,
	south: region.latitude - region.latitudeDelta / 2,
	east: region.longitude + region.longitudeDelta / 2,
	west: region.longitude - region.longitudeDelta / 2,
});

type LatLng = { latitude: number; longitude: number };

const getPolylineExtents = (polyline: LatLng[]) => {
	if (polyline.length === 0) return null;

	let minLat = polyline[0].latitude;
	let maxLat = polyline[0].latitude;
	let minLng = polyline[0].longitude;
	let maxLng = polyline[0].longitude;

	for (const point of polyline) {
		minLat = Math.min(minLat, point.latitude);
		maxLat = Math.max(maxLat, point.latitude);
		minLng = Math.min(minLng, point.longitude);
		maxLng = Math.max(maxLng, point.longitude);
	}

	return { minLat, maxLat, minLng, maxLng };
};

export const polylineToBounds = (
	polyline: LatLng[],
	paddingDegrees = 0.01
): MapBounds => {
	const extents = getPolylineExtents(polyline);
	if (!extents) {
		return { north: 0, south: 0, east: 0, west: 0 };
	}

	return {
		north: extents.maxLat + paddingDegrees,
		south: extents.minLat - paddingDegrees,
		east: extents.maxLng + paddingDegrees,
		west: extents.minLng - paddingDegrees,
	};
};

export const polylineToRegion = (
	polyline: LatLng[],
	paddingFactor = 0.3,
	minDelta = 0.01
): MapRegion => {
	const extents = getPolylineExtents(polyline);
	if (!extents) {
		return {
			latitude: 0,
			longitude: 0,
			latitudeDelta: 0.1,
			longitudeDelta: 0.1,
		};
	}

	const latDelta = (extents.maxLat - extents.minLat) * (1 + paddingFactor);
	const lngDelta = (extents.maxLng - extents.minLng) * (1 + paddingFactor);

	return {
		latitude: (extents.minLat + extents.maxLat) / 2,
		longitude: (extents.minLng + extents.maxLng) / 2,
		latitudeDelta: Math.max(latDelta, minDelta),
		longitudeDelta: Math.max(lngDelta, minDelta),
	};
};

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
