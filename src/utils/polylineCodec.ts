export interface PolylinePoint {
	latitude: number;
	longitude: number;
}

const POLYLINE_PRECISION = 1e5;
const POLYLINE_ENCODING_OFFSET = 63;
const POLYLINE_CHUNK_MASK = 0x1f;
const POLYLINE_CONTINUATION_BIT = 0x20;
const POLYLINE_SHIFT = 5;

function encodeSignedValue(value: number): string {
	let shifted = value < 0 ? ~(value << 1) : value << 1;
	let encoded = '';

	while (shifted >= POLYLINE_CONTINUATION_BIT) {
		encoded += String.fromCharCode(
			(shifted & POLYLINE_CHUNK_MASK) +
				POLYLINE_CONTINUATION_BIT +
				POLYLINE_ENCODING_OFFSET
		);
		shifted >>= POLYLINE_SHIFT;
	}

	encoded += String.fromCharCode(shifted + POLYLINE_ENCODING_OFFSET);
	return encoded;
}

/**
 * Encode route points using Google's polyline algorithm.
 */
export function encodePolyline(points: readonly PolylinePoint[]): string {
	if (points.length === 0) {
		return '';
	}

	let previousLat = 0;
	let previousLng = 0;
	let encoded = '';

	for (const point of points) {
		const lat = Math.round(point.latitude * POLYLINE_PRECISION);
		const lng = Math.round(point.longitude * POLYLINE_PRECISION);

		const deltaLat = lat - previousLat;
		const deltaLng = lng - previousLng;

		encoded += encodeSignedValue(deltaLat);
		encoded += encodeSignedValue(deltaLng);

		previousLat = lat;
		previousLng = lng;
	}

	return encoded;
}

/**
 * Decode an encoded polyline into coordinates.
 */
export function decodePolyline(encoded: string): PolylinePoint[] {
	const points: PolylinePoint[] = [];
	let index = 0;
	let latitude = 0;
	let longitude = 0;

	while (index < encoded.length) {
		let shift = 0;
		let result = 0;
		let byte = 0;

		do {
			byte = encoded.charCodeAt(index++) - POLYLINE_ENCODING_OFFSET;
			result |= (byte & POLYLINE_CHUNK_MASK) << shift;
			shift += POLYLINE_SHIFT;
		} while (byte >= POLYLINE_CONTINUATION_BIT);

		const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
		latitude += deltaLat;

		shift = 0;
		result = 0;

		do {
			byte = encoded.charCodeAt(index++) - POLYLINE_ENCODING_OFFSET;
			result |= (byte & POLYLINE_CHUNK_MASK) << shift;
			shift += POLYLINE_SHIFT;
		} while (byte >= POLYLINE_CONTINUATION_BIT);

		const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
		longitude += deltaLng;

		points.push({
			latitude: latitude / POLYLINE_PRECISION,
			longitude: longitude / POLYLINE_PRECISION,
		});
	}

	return points;
}
