import { Polyline } from 'react-native-maps';
import type { NavigationRoute } from '../types';

interface RoutePolylineProps {
	route: NavigationRoute;
}

const ROUTE_COLOR = '#4A90E2'; // Light blue (matches COLORS.secondary)
const ROUTE_WIDTH = 4;

export function RoutePolyline({ route }: RoutePolylineProps) {
	return (
		<Polyline
			coordinates={route.polyline}
			strokeColor={ROUTE_COLOR}
			strokeWidth={ROUTE_WIDTH}
			lineCap="round"
			lineJoin="round"
		/>
	);
}
