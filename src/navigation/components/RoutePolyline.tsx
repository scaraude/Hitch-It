import { Polyline } from 'react-native-maps';
import { COLORS } from '../../constants';
import type { NavigationRoute } from '../types';

interface RoutePolylineProps {
	route: NavigationRoute;
	strokeColor?: string;
	strokeWidth?: number;
	zIndex?: number;
}

const ROUTE_COLOR = COLORS.secondary;
const ROUTE_WIDTH = 4;

export function RoutePolyline({
	route,
	strokeColor = ROUTE_COLOR,
	strokeWidth = ROUTE_WIDTH,
	zIndex = 1,
}: RoutePolylineProps) {
	return (
		<Polyline
			coordinates={route.polyline}
			strokeColor={strokeColor}
			strokeWidth={strokeWidth}
			lineCap="round"
			lineJoin="round"
			zIndex={zIndex}
		/>
	);
}
