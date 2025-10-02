import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { MAP_CONFIG } from '../constants';
import type { SpotMarkerData } from '../spot/types';
import { MapRegion } from '../types';

interface MapViewComponentProps {
    initialRegion?: MapRegion;
    markers?: SpotMarkerData[];
    onRegionChange?: (region: Region) => void;
    showUserLocation?: boolean;
    followUserLocation?: boolean;
}

const MapViewComponent: React.FC<MapViewComponentProps> = ({
    initialRegion = MAP_CONFIG.defaultRegion,
    markers = [],
    onRegionChange,
    showUserLocation = true,
    followUserLocation = false,
}) => {
    const handleRegionChangeComplete = useCallback(
        (newRegion: Region) => {
            onRegionChange?.(newRegion);
        },
        [onRegionChange],
    );

    return (
        <MapView
            style={styles.map}
            initialRegion={initialRegion}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation={showUserLocation}
            followsUserLocation={followUserLocation}
            showsMyLocationButton={true}
            showsCompass={true}
            showsScale={true}
            mapType="standard"
            moveOnMarkerPress={false}
            pitchEnabled={true}
            rotateEnabled={true}
            scrollEnabled={true}
            zoomEnabled={true}
        >
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    coordinate={marker.coordinates}
                    title={marker.title}
                    description={marker.description}
                    pinColor={marker.color || MAP_CONFIG.defaultMarkerColor}
                    tracksViewChanges={false}
                />
            ))}
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
});

export default MapViewComponent;
