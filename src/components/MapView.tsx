import React, { useState, useCallback } from 'react';
import { StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Location, MarkerData, MapRegion } from '../types';
import { MAP_CONFIG, COLORS } from '../constants';
import { isValidLocation } from '../utils';

interface MapViewComponentProps {
    initialRegion?: MapRegion;
    markers?: MarkerData[];
    onMarkerDragEnd?: (coordinate: Location) => void;
    onRegionChange?: (region: Region) => void;
    showUserLocation?: boolean;
    followUserLocation?: boolean;
}

const MapViewComponent: React.FC<MapViewComponentProps> = ({
    initialRegion = MAP_CONFIG.defaultRegion,
    markers = [],
    onMarkerDragEnd,
    onRegionChange,
    showUserLocation = true,
    followUserLocation = false,
}) => {
    const [region, setRegion] = useState<MapRegion>(initialRegion);

    const handleMarkerDragEnd = useCallback(
        (event: any, markerId: string) => {
            const coordinate = event.nativeEvent.coordinate;

            if (!isValidLocation(coordinate)) {
                Alert.alert('Invalid Location', 'Please select a valid location.');
                return;
            }

            onMarkerDragEnd?.(coordinate);
        },
        [onMarkerDragEnd],
    );

    const handleRegionChange = useCallback(
        (newRegion: Region) => {
            setRegion(newRegion);
            onRegionChange?.(newRegion);
        },
        [onRegionChange],
    );

    return (
        <MapView
            style={styles.map}
            region={region}
            onRegionChange={handleRegionChange}
            showsUserLocation={showUserLocation}
            followsUserLocation={followUserLocation}
            showsMyLocationButton={true}
            showsCompass={true}
            showsScale={true}
            mapType="standard"
        >
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    coordinate={marker.coordinate}
                    title={marker.title}
                    description={marker.description}
                    pinColor={marker.color || MAP_CONFIG.defaultMarkerColor}
                    draggable={true}
                    onDragEnd={(event) => handleMarkerDragEnd(event, marker.id)}
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
