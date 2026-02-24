import type { RefObject } from 'react';
import { useEffect, useMemo } from 'react';
import type { MapViewRef } from '../../../components';
import type { NavigationRoute, SpotOnRoute } from '../../../navigation/types';
import type { SpotMarkerData } from '../../../spot/types';
import { polylineToRegion } from '../../../utils';

interface UseHomeNavigationMapDataArgs {
	isNavigationActive: boolean;
	navigationRoute: NavigationRoute | null;
	driverRoute: NavigationRoute | null;
	spotsOnRoute: SpotOnRoute[];
	commonSpotsOnRoute: SpotOnRoute[];
	spots: SpotMarkerData[];
	mapViewRef: RefObject<MapViewRef | null>;
}

interface UseHomeNavigationMapDataReturn {
	visibleSpots: SpotMarkerData[];
}

export const useHomeNavigationMapData = ({
	isNavigationActive,
	navigationRoute,
	driverRoute,
	spotsOnRoute,
	commonSpotsOnRoute,
	spots,
	mapViewRef,
}: UseHomeNavigationMapDataArgs): UseHomeNavigationMapDataReturn => {
	useEffect(() => {
		if (isNavigationActive && navigationRoute) {
			const polyline =
				driverRoute !== null
					? [...navigationRoute.polyline, ...driverRoute.polyline]
					: navigationRoute.polyline;
			const routeBounds = polylineToRegion(polyline);
			mapViewRef.current?.animateToRegion(routeBounds, 1000);
		}
	}, [driverRoute, isNavigationActive, mapViewRef, navigationRoute]);

	const visibleSpots = useMemo(
		() =>
			isNavigationActive
				? (driverRoute ? commonSpotsOnRoute : spotsOnRoute).map(({ spot }) => ({
						id: spot.id as string,
						coordinates: spot.coordinates,
						title: spot.roadName,
						description: `${spot.appreciation} - ${spot.direction}`,
					}))
				: spots,
		[commonSpotsOnRoute, driverRoute, isNavigationActive, spots, spotsOnRoute]
	);

	return { visibleSpots };
};
