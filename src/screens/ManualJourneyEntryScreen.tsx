import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Crypto from 'expo-crypto';
import { useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useAuth } from '../auth';
import { COLORS } from '../constants';
import { LocationPickerStep, StopsManagementStep } from '../journey/components';
import { ManualJourneyStep, useManualJourneyFlow } from '../journey/hooks';
import * as journeyRepository from '../journey/services/journeyRepository';
import type {
	Journey,
	JourneyId,
	JourneyPoint,
	JourneyPointId,
	UserId,
} from '../journey/types';
import { JourneyPointType, JourneyStatus } from '../journey/types';
import { calculateRouteWithWaypoints } from '../navigation/services/routingService';
import type { RootStackParamList, RoutePoint } from '../navigation/types';
import type { Location } from '../types';
import { logger } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const MILLISECONDS_IN_MINUTE = 60_000;
const ROUTE_DESTINATION_FALLBACK_NAME = 'Destination';

const toRoutePoint = (location: Location): RoutePoint => ({
	latitude: location.latitude,
	longitude: location.longitude,
});

/**
 * Calculate distance between two points using Haversine formula
 */
function haversineDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number {
	const R = 6371; // Earth's radius in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

/**
 * Calculate total distance for a series of coordinates
 */
function calculateTotalDistance(points: RoutePoint[]): number {
	if (points.length < 2) return 0;

	let total = 0;
	for (let i = 0; i < points.length - 1; i++) {
		total += haversineDistance(
			points[i].latitude,
			points[i].longitude,
			points[i + 1].latitude,
			points[i + 1].longitude
		);
	}
	return total;
}

export default function ManualJourneyEntryScreen() {
	const navigation = useNavigation<NavigationProp>();
	const { user } = useAuth();
	const flow = useManualJourneyFlow();

	const handleBack = useCallback(() => {
		if (flow.currentStep === ManualJourneyStep.SelectStart) {
			navigation.goBack();
		} else {
			flow.goBack();
		}
	}, [flow, navigation]);

	const handleConfirmStart = useCallback(
		(location: Location, name: string) => {
			flow.setStart(location, name);
		},
		[flow]
	);

	const handleConfirmEnd = useCallback(
		(location: Location, name: string) => {
			flow.setEnd(location, name);
		},
		[flow]
	);

	const handleSave = useCallback(async () => {
		if (!user?.id || !flow.startLocation || !flow.endLocation) return;

		flow.setSaving(true);
		try {
			const now = new Date();
			const journeyId = Crypto.randomUUID() as JourneyId;
			const endTime = new Date(
				now.getTime() + (flow.stops.length + 1) * MILLISECONDS_IN_MINUTE
			);

			const routeWaypoints: RoutePoint[] = [
				toRoutePoint(flow.startLocation),
				...flow.stops.map(stop => toRoutePoint(stop.location)),
				toRoutePoint(flow.endLocation),
			];

			const routeResult = await calculateRouteWithWaypoints(
				routeWaypoints,
				flow.endName || ROUTE_DESTINATION_FALLBACK_NAME
			);

			const routePolyline = routeResult.success
				? routeResult.route.polyline
				: routeWaypoints;

			if (!routeResult.success) {
				logger.app.warn('Route calculation failed during manual save', {
					error: routeResult.error,
					message: routeResult.message,
				});
			}

			const stopPoints: JourneyPoint[] = [];

			// Add start point
			stopPoints.push({
				id: Crypto.randomUUID() as JourneyPointId,
				journeyId,
				type: JourneyPointType.Stop,
				latitude: flow.startLocation.latitude,
				longitude: flow.startLocation.longitude,
				timestamp: now,
			});

			// Add intermediate stops
			for (let i = 0; i < flow.stops.length; i++) {
				const stop = flow.stops[i];
				const stopTime = new Date(
					now.getTime() + (i + 1) * MILLISECONDS_IN_MINUTE
				);

				stopPoints.push({
					id: Crypto.randomUUID() as JourneyPointId,
					journeyId,
					type: JourneyPointType.Stop,
					latitude: stop.location.latitude,
					longitude: stop.location.longitude,
					timestamp: stopTime,
					waitTimeMinutes: stop.waitTimeMinutes,
					notes: stop.notes?.trim() || undefined,
				});
			}

			// Add end point
			stopPoints.push({
				id: Crypto.randomUUID() as JourneyPointId,
				journeyId,
				type: JourneyPointType.Stop,
				latitude: flow.endLocation.latitude,
				longitude: flow.endLocation.longitude,
				timestamp: endTime,
			});

			const totalDistanceKm = routeResult.success
				? routeResult.route.distanceKm
				: calculateTotalDistance(routePolyline);
			const journeyTitle = flow.title.trim();

			const journey: Journey = {
				id: journeyId,
				userId: user.id as UserId,
				status: JourneyStatus.Completed,
				startedAt: now,
				endedAt: endTime,
				title: journeyTitle || undefined,
				notes: flow.notes.trim() || undefined,
				routePolyline,
				totalDistanceKm,
				points: stopPoints,
			};

			await journeyRepository.saveJourney(journey);
			await journeyRepository.saveJourneyPoints(stopPoints);

			logger.app.info('Manual journey saved', { journeyId });

			Alert.alert('Success', 'Journey saved successfully', [
				{
					text: 'OK',
					onPress: () => navigation.goBack(),
				},
			]);
		} catch (error) {
			logger.app.error('Failed to save manual journey', error);
			Alert.alert('Error', 'Failed to save journey. Please try again.');
		} finally {
			flow.setSaving(false);
		}
	}, [user, flow, navigation]);

	return (
		<View style={styles.container}>
			{flow.currentStep === ManualJourneyStep.SelectStart && (
				<LocationPickerStep
					title="Select Starting Point"
					subtitle="Search or position the marker"
					ctaLabel="Confirm Start"
					markerColor={COLORS.error}
					onConfirm={handleConfirmStart}
					onBack={handleBack}
				/>
			)}

			{flow.currentStep === ManualJourneyStep.SelectEnd && (
				<LocationPickerStep
					title="Select Endpoint"
					subtitle="Search or position the marker"
					ctaLabel="Confirm End"
					markerColor={COLORS.error}
					onConfirm={handleConfirmEnd}
					onBack={handleBack}
					initialRegion={
						flow.startLocation
							? {
									latitude: flow.startLocation.latitude,
									longitude: flow.startLocation.longitude,
									latitudeDelta: 0.05,
									longitudeDelta: 0.05,
								}
							: undefined
					}
				/>
			)}

			{flow.currentStep === ManualJourneyStep.AddStops &&
				flow.startLocation &&
				flow.endLocation && (
					<StopsManagementStep
						startLocation={flow.startLocation}
						startName={flow.startName}
						endLocation={flow.endLocation}
						endName={flow.endName}
						stops={flow.stops}
						selectedStopId={flow.selectedStopId}
						title={flow.title}
						notes={flow.notes}
						isSaving={flow.isSaving}
						canSave={flow.canSave}
						onAddStop={flow.addStop}
						onUpdateStop={flow.updateStop}
						onRemoveStop={flow.removeStop}
						onSelectStop={flow.selectStop}
						onTitleChange={flow.setTitle}
						onNotesChange={flow.setNotes}
						onSave={handleSave}
						onBack={handleBack}
					/>
				)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
});
