import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { MapViewComponent } from '../components';
import { COLORS, MAP_CONFIG, SPACING } from '../constants';
import { Location as LocationType, MapRegion, MarkerData } from '../types';

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
    const [currentRegion, setCurrentRegion] = useState<MapRegion>(MAP_CONFIG.defaultRegion);
    const [_userLocation, setUserLocation] = useState<LocationType | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required to show your current location on the map.',
                    [
                        { text: 'OK', onPress: () => setLocationLoading(false) }
                    ]
                );
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const userCoordinate: LocationType = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            setUserLocation(userCoordinate);
            const newRegion = {
                latitude: userCoordinate.latitude,
                longitude: userCoordinate.longitude,
                latitudeDelta: MAP_CONFIG.defaultRegion.latitudeDelta,
                longitudeDelta: MAP_CONFIG.defaultRegion.longitudeDelta,
            };
            setCurrentRegion(newRegion);
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert(
                'Location Error',
                'Unable to get your current location. Using default location.',
                [
                    { text: 'OK', onPress: () => setLocationLoading(false) }
                ]
            );
        } finally {
            setLocationLoading(false);
        }
    };

    const handleMarkerDragEnd = (coordinate: LocationType) => {
        Alert.alert(
            'Marker Moved',
            `New location: ${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`,
        );
    };

    const showToast = (message: string) => {
        Toast.show({
            type: 'success',
            text1: 'Marker Added',
            text2: message,
            position: 'top',
            visibilityTime: 3000,
        });
    };

    const handleRegionChange = (region: MapRegion) => {
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

    const cancelMarkerPlacement = () => {
        setIsPlacingMarker(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Hitch It</Text>
                <Text style={styles.subtitle}>Find your next ride</Text>
            </View>

            <View style={styles.mapContainer}>
                {locationLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Getting your location...</Text>
                    </View>
                ) : (
                    <>
                        <MapViewComponent
                            initialRegion={currentRegion}
                            markers={markers}
                            onMarkerDragEnd={handleMarkerDragEnd}
                            onRegionChange={handleRegionChange}
                        />
                        {isPlacingMarker && (
                            <View style={styles.centerMarker}>
                                <View style={styles.markerPin} />
                            </View>
                        )}
                    </>
                )}
            </View>

            {isPlacingMarker ? (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={cancelMarkerPlacement}
                    >
                        <Text style={styles.plusIcon}>×</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.confirmButton]}
                        onPress={confirmMarkerPlacement}
                    >
                        <Text style={styles.plusIcon}>✓</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={startPlacingMarker}
                >
                    <Text style={styles.plusIcon}>+</Text>
                </TouchableOpacity>
            )}
            <Toast />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
    },
    loadingText: {
        marginTop: SPACING.md,
        fontSize: 16,
        color: COLORS.text,
        textAlign: 'center',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 60,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 80,
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
    actionButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'space-around',
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
    cancelButton: {
        backgroundColor: COLORS.error,
    },
    confirmButton: {
        backgroundColor: COLORS.success,
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
