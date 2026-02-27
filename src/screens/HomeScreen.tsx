import type React from 'react';
import { useState } from 'react';
import { View } from 'react-native';
import { JourneyProvider } from '../journey/context';
import { NavigationProvider } from '../navigation/context/NavigationContext';
import { SpotProvider } from '../spot/context';
import type { MapBounds, MapRegion } from '../types';
import { calculateZoomLevel, regionToBounds } from '../utils';
import { HomeFixedOverlay } from './home/components/HomeFixedOverlay';
import { HomeMapLayer } from './home/components/HomeMapLayer';
import { HomeSheetsOverlay } from './home/components/HomeSheetsOverlay';
import { HomeStateProvider } from './home/context/HomeStateContext';
import { homeScreenStyles as styles } from './home/homeScreenStyles';

interface HomeScreenContentProps {
	onRegionChange: (region: MapRegion) => void;
}

const HomeScreenContent: React.FC<HomeScreenContentProps> = ({
	onRegionChange,
}) => {
	return (
		<HomeStateProvider onRegionChange={onRegionChange}>
			<View style={styles.container}>
				<HomeMapLayer />
				<HomeFixedOverlay />
				<HomeSheetsOverlay />
			</View>
		</HomeStateProvider>
	);
};

const HomeScreen: React.FC = () => {
	const [bounds, setBounds] = useState<MapBounds | null>(null);
	const [zoomLevel, setZoomLevel] = useState<number>(0);

	const handleRegionChange = (region: MapRegion) => {
		setBounds(regionToBounds(region));
		setZoomLevel(calculateZoomLevel(region));
	};

	const content = (
		<SpotProvider bounds={bounds} zoomLevel={zoomLevel}>
			<HomeScreenContent onRegionChange={handleRegionChange} />
		</SpotProvider>
	);

	return (
		<JourneyProvider>
			<NavigationProvider>{content}</NavigationProvider>
		</JourneyProvider>
	);
};

export default HomeScreen;
