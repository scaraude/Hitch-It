import type { RefObject } from 'react';
import { useEffect, useMemo } from 'react';
import type { MapViewRef } from '../../../components';
import type { NavigationRoute, SpotOnRoute } from '../../../navigation/types';
import type { SpotMarkerData } from '../../../spot/types';
import { polylineToRegion } from '../../../utils';

interface UseHomeNavigationMapDataArgs {
	isNavigationActive: boolean;
	navigationRoute: NavigationRoute | null;
	spotsOnRoute: SpotOnRoute[];
	spots: SpotMarkerData[];
	mapViewRef: RefObject<MapViewRef | null>;
}

interface UseHomeNavigationMapDataReturn {
	visibleSpots: SpotMarkerData[];
}

export const useHomeNavigationMapData = ({
	isNavigationActive,
	navigationRoute,
	spotsOnRoute,
	spots,
	mapViewRef,
}: UseHomeNavigationMapDataArgs): UseHomeNavigationMapDataReturn => {
	useEffect(() => {
		if (isNavigationActive && navigationRoute) {
			const routeBounds = polylineToRegion(navigationRoute.polyline);
			mapViewRef.current?.animateToRegion(routeBounds, 1000);
		}
	}, [isNavigationActive, mapViewRef, navigationRoute]);

	const visibleSpots = useMemo(
		() =>
			isNavigationActive
				? spotsOnRoute.map(({ spot }) => ({
						id: spot.id as string,
						coordinates: spot.coordinates,
						title: spot.roadName,
						description: `${spot.appreciation} - ${spot.direction}`,
					}))
				: spots,
		[isNavigationActive, spots, spotsOnRoute]
	);

	return { visibleSpots };
};
