import { Marker } from 'react-native-maps';
import type { RoutePoint } from '../types';

interface DestinationMarkerProps {
	location: RoutePoint;
	name: string;
}

export function DestinationMarker({ location, name }: DestinationMarkerProps) {
	return (
		<Marker
			coordinate={location}
			title={name}
			pinColor="green"
			identifier="destination-marker"
		/>
	);
}
