import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MapViewRef } from '../../../components';
import type { Location, MapRegion } from '../../../types';

interface UseHomeMapControlsArgs {
	userLocation: Location | null;
	mapViewRef: RefObject<MapViewRef | null>;
}

interface UseHomeMapControlsReturn {
	mapHeading: number;
	isFollowingUser: boolean;
	handleHeadingChange: (heading: number) => void;
	handleResetHeading: () => void;
	handleLocateUser: () => void;
}

export const useHomeMapControls = ({
	userLocation,
	mapViewRef,
}: UseHomeMapControlsArgs): UseHomeMapControlsReturn => {
	const [mapHeading, setMapHeading] = useState(0);
	const [isFollowingUser, setIsFollowingUser] = useState(false);
	const followUserTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);

	const handleHeadingChange = useCallback((heading: number) => {
		setMapHeading(heading);
	}, []);

	const handleResetHeading = useCallback(() => {
		mapViewRef.current?.animateToBearing(0);
		setMapHeading(0);
	}, [mapViewRef]);

	const handleLocateUser = useCallback(() => {
		if (!userLocation) return;

		const region: MapRegion = {
			latitude: userLocation.latitude,
			longitude: userLocation.longitude,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01,
		};

		mapViewRef.current?.animateToRegion(region, 500);
		setIsFollowingUser(true);

		if (followUserTimeoutRef.current) {
			clearTimeout(followUserTimeoutRef.current);
		}

		// Reset following state after user moves the map
		followUserTimeoutRef.current = setTimeout(() => {
			setIsFollowingUser(false);
			followUserTimeoutRef.current = null;
		}, 3000);
	}, [mapViewRef, userLocation]);

	useEffect(() => {
		return () => {
			if (followUserTimeoutRef.current) {
				clearTimeout(followUserTimeoutRef.current);
			}
		};
	}, []);

	return {
		mapHeading,
		isFollowingUser,
		handleHeadingChange,
		handleResetHeading,
		handleLocateUser,
	};
};
