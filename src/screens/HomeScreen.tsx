import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ActionButtons, FloatingButton, Header, LoadingSpinner, MapViewComponent } from '../components';
import { COLORS } from '../constants';
import { useLocation } from '../hooks';
import { useSpots } from '../spot/hooks';
import { MapRegion } from '../types';

const HomeScreen: React.FC = () => {
    const { currentRegion, locationLoading } = useLocation();
    const { spots, isPlacingSpot, startPlacingSpot, confirmSpotPlacement, cancelSpotPlacement } = useSpots();
    const [mapRegion, setMapRegion] = useState<MapRegion>(currentRegion);

    const handleRegionChange = (region: MapRegion) => {
        setMapRegion(region);
    };

    const onConfirmSpotPlacement = () => {
        confirmSpotPlacement(mapRegion);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Hitch It" subtitle="Find your next ride" />

            <View style={styles.mapContainer}>
                {locationLoading ? (
                    <LoadingSpinner message="Getting your location..." />
                ) : (
                    <>
                        <MapViewComponent
                            initialRegion={currentRegion}
                            markers={spots}
                            onRegionChange={handleRegionChange}
                        />
                        {isPlacingSpot && (
                            <View style={styles.centerMarker}>
                                <View style={styles.markerPin} />
                            </View>
                        )}
                    </>
                )}
            </View>

            {isPlacingSpot ? (
                <ActionButtons
                    onConfirm={onConfirmSpotPlacement}
                    onCancel={cancelSpotPlacement}
                />
            ) : (
                <FloatingButton
                    onPress={startPlacingSpot}
                    icon="+"
                />
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
    mapContainer: {
        flex: 1,
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
