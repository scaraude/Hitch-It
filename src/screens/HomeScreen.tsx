import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Alert,
    ToastAndroid,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapViewComponent } from '../components';
import { Location, MarkerData } from '../types';
import { COLORS, MAP_CONFIG, SPACING } from '../constants';

const HomeScreen: React.FC = () => {
    const [markers, setMarkers] = useState<MarkerData[]>([
        {
            id: '1',
            coordinate: {
                latitude: MAP_CONFIG.defaultRegion.latitude,
                longitude: MAP_CONFIG.defaultRegion.longitude,
            },
            title: 'Test Marker',
            description: 'This is a description of the marker',
            color: COLORS.primary,
        },
    ]);
    const [isPlacingMarker, setIsPlacingMarker] = useState(false);
    const [currentRegion, setCurrentRegion] = useState(MAP_CONFIG.defaultRegion);

    const handleMarkerDragEnd = (coordinate: Location) => {
        Alert.alert(
            'Marker Moved',
            `New location: ${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`,
        );
    };

    const showToast = (message: string) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Success', message);
        }
    };

    const handleRegionChange = (region: any) => {
        setCurrentRegion(region);
    };

    const startPlacingMarker = () => {
        setIsPlacingMarker(true);
    };

    const confirmMarkerPlacement = () => {
        const newMarker: MarkerData = {
            id: Date.now().toString(),
            coordinate: {
                latitude: currentRegion.latitude,
                longitude: currentRegion.longitude,
            },
            title: `Marker ${markers.length + 1}`,
            description: 'A new marker',
            color: COLORS.secondary,
        };
        setMarkers([...markers, newMarker]);
        setIsPlacingMarker(false);
        showToast(`New marker saved at ${currentRegion.latitude.toFixed(6)}, ${currentRegion.longitude.toFixed(6)}`);
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
                    onRegionChange={handleRegionChange}
                />
                {isPlacingMarker && (
                    <View style={styles.centerMarker}>
                        <View style={styles.markerPin} />
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={isPlacingMarker ? confirmMarkerPlacement : startPlacingMarker}
            >
                <Text style={styles.plusIcon}>{isPlacingMarker ? '✓' : '+'}</Text>
            </TouchableOpacity>
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
    floatingButton: {
        position: 'absolute',
        bottom: 60,
        alignSelf: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    plusIcon: {
        color: COLORS.background,
        fontSize: 40,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    centerMarker: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: -9,
        marginTop: -9,
        alignItems: 'center',
    },
    markerPin: {
        width: 18,
        height: 18,
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: COLORS.background,
    }
});

export default HomeScreen;
