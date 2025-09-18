import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapViewComponent } from '../components';
import { Location, MarkerData } from '../types';
import { COLORS, SPACING } from '../constants';

const HomeScreen: React.FC = () => {
    const [markers, setMarkers] = useState<MarkerData[]>([
        {
            id: '1',
            coordinate: {
                latitude: 45.75500275139512,
                longitude: 4.840276964527021,
            },
            title: 'Test Marker',
            description: 'This is a description of the marker',
            color: COLORS.primary,
        },
    ]);

    const handleMarkerDragEnd = (coordinate: Location) => {
        Alert.alert(
            'Marker Moved',
            `New location: ${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`,
        );
    };

    const addMarker = () => {
        const newMarker: MarkerData = {
            id: Date.now().toString(),
            coordinate: {
                latitude: 45.75500275139512 + (Math.random() - 0.5) * 0.01,
                longitude: 4.840276964527021 + (Math.random() - 0.5) * 0.01,
            },
            title: `Marker ${markers.length + 1}`,
            description: 'A new marker',
            color: COLORS.secondary,
        };
        setMarkers([...markers, newMarker]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Hitch It</Text>
                <Text style={styles.subtitle}>Find your next ride</Text>
            </View>

            <View style={styles.mapContainer}>
                <MapViewComponent
                    markers={markers}
                    onMarkerDragEnd={handleMarkerDragEnd}
                />
            </View>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.button} onPress={addMarker}>
                    <Text style={styles.buttonText}>Add Marker</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SPACING.md,
        backgroundColor: COLORS.primary,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.background,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.background,
        textAlign: 'center',
        marginTop: SPACING.xs,
    },
    mapContainer: {
        flex: 1,
    },
    controls: {
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HomeScreen;
