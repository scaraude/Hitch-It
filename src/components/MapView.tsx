import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { MAP_CONFIG } from '../constants';
import { Location, MapRegion, MarkerData } from '../types';
import { toastUtils } from './ui';
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
    const handleMarkerDragEnd = useCallback(
        (event: {
            nativeEvent: {
                coordinate: {
                    latitude: number;
                    longitude: number;
                };
            };
        }, _markerId: string) => {
            const coordinate = event.nativeEvent.coordinate;

            if (!isValidLocation(coordinate)) {
                toastUtils.error('Invalid Location', 'Please select a valid location.');
                return;
            }

            onMarkerDragEnd?.(coordinate);
        },
        [onMarkerDragEnd],
    );

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
                    coordinate={marker.coordinate}
                    title={marker.title}
                    description={marker.description}
                    pinColor={marker.color || MAP_CONFIG.defaultMarkerColor}
                    draggable={true}
                    onDragEnd={(event) => handleMarkerDragEnd(event, marker.id)}
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
