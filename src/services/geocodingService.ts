import type { Location } from '@/types';
import { logger } from '@/utils/logger';

const PHOTON_URL = 'https://photon.komoot.io/api';
const REQUEST_TIMEOUT = 5000;

export interface SearchSuggestion {
	id: string;
	name: string;
	description: string;
	location: Location;
}

interface PhotonFeature {
	properties: {
		name?: string;
		street?: string;
		housenumber?: string;
		country?: string;
		state?: string;
		city?: string;
		osm_id: number;
		osm_type: string;
	};
	geometry: {
		coordinates: [number, number];
	};
}

interface PhotonResponse {
	features: PhotonFeature[];
}

export async function searchPlaces(query: string): Promise<SearchSuggestion[]> {
	if (!query.trim()) {
		return [];
	}

	try {
		const params = new URLSearchParams({
			q: query,
			lang: 'fr',
			limit: '3',
		});

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

		const response = await fetch(`${PHOTON_URL}?${params.toString()}`, {
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			logger.app.warn('Photon API request failed', {
				status: response.status,
				query,
			});
			return [];
		}

		const data: PhotonResponse = await response.json();

		return data.features.map(feature => {
			const props = feature.properties;
			const [longitude, latitude] = feature.geometry.coordinates;

			const streetLabel = [props.housenumber, props.street]
				.filter(Boolean)
				.join(' ')
				.trim();
			const name = props.name || streetLabel || 'Lieu inconnu';
			const description = [props.city, props.state, props.country]
				.filter(Boolean)
				.join(', ');

			return {
				id: `${props.osm_type}-${props.osm_id}`,
				name,
				description,
				location: { latitude, longitude },
			};
		});
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			logger.app.warn('Photon API request timeout', { query });
		} else {
			logger.app.error('Geocoding search failed', error, { query });
		}
		return [];
	}
}
