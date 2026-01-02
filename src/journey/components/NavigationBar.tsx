import type React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';
import { useJourney } from '../context';
import { JourneyStateStatus } from '../types';

interface NavigationBarProps {
	onPress?: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ onPress }) => {
	const { isTracking, currentJourney, journeyState } = useJourney();

	if (!isTracking || !currentJourney) {
		return null;
	}

	const getStatusEmoji = () => {
		switch (journeyState.status) {
			case JourneyStateStatus.Waiting:
				return '🤚';
			case JourneyStateStatus.InVehicle:
				return '🚗';
			case JourneyStateStatus.Break:
				return '☕';
			default:
				return '🧭';
		}
	};

	const getStatusText = () => {
		switch (journeyState.status) {
			case JourneyStateStatus.Waiting:
				return 'En attente';
			case JourneyStateStatus.InVehicle:
				return 'En route';
			case JourneyStateStatus.Break:
				return 'Pause';
			default:
				return 'Démarrage';
		}
	};

	const formatTime = () => {
		const elapsed = Date.now() - journeyState.startTime.getTime();
		const hours = Math.floor(elapsed / (1000 * 60 * 60));
		const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

		if (hours > 0) {
			return `${hours}h${minutes.toString().padStart(2, '0')}`;
		}
		return `${minutes} min`;
	};

	return (
		<TouchableOpacity
			style={styles.container}
			onPress={onPress}
			activeOpacity={0.8}
		>
			<View style={styles.content}>
				<View style={styles.leftSection}>
					<Text style={styles.emoji}>{getStatusEmoji()}</Text>
					<View style={styles.textContainer}>
						<Text style={styles.title}>
							En route vers {currentJourney.destination}
						</Text>
						<Text style={styles.subtitle}>
							{getStatusText()} • {formatTime()} •{' '}
							{journeyState.detectedVehicleChanges} véhicule(s)
						</Text>
					</View>
				</View>
				<Text style={styles.arrow}>›</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.sm,
		paddingHorizontal: SPACING.md,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 4,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	leftSection: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	emoji: {
		fontSize: SIZES.font2Xl,
		marginRight: SPACING.sm,
	},
	textContainer: {
		flex: 1,
	},
	title: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.background,
		marginBottom: SPACING.xs / 2,
	},
	subtitle: {
		fontSize: SIZES.fontSm,
		color: COLORS.background,
		opacity: 0.9,
	},
	arrow: {
		fontSize: SIZES.font2Xl,
		color: COLORS.background,
		marginLeft: SPACING.sm,
	},
});
