import { Polyline } from 'react-native-maps';
import { COLORS } from '../../constants';
import type { NavigationRoute, RoutePoint } from '../types';

interface RoutePolylineProps {
	route?: NavigationRoute;
	coordinates?: RoutePoint[];
	strokeColor?: string;
	strokeWidth?: number;
	zIndex?: number;
}

const ROUTE_COLOR = COLORS.secondary;
const ROUTE_WIDTH = 4;

export function RoutePolyline({
	route,
	coordinates,
	strokeColor = ROUTE_COLOR,
	strokeWidth = ROUTE_WIDTH,
	zIndex = 1,
}: RoutePolylineProps) {
	const polylineCoordinates = coordinates ?? route?.polyline ?? [];

	if (polylineCoordinates.length < 2) {
		return null;
	}

	return (
		<Polyline
			coordinates={polylineCoordinates}
			strokeColor={strokeColor}
			strokeWidth={strokeWidth}
			lineCap="round"
			lineJoin="round"
			zIndex={zIndex}
		/>
	);
}
