import type React from 'react';
import { useCallback, useMemo } from 'react';
import {
	Dimensions,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';
import { useJourney } from '../context';
import { JourneyTimeline } from './JourneyTimeline';

interface NavigationSheetProps {
	visible: boolean;
	onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;

export const NavigationSheet: React.FC<NavigationSheetProps> = ({
	visible,
	onClose,
}) => {
	const { currentJourney, journeyState, stopJourney } = useJourney();

	const handleStopJourney = useCallback(async () => {
		await stopJourney();
		onClose();
	}, [stopJourney, onClose]);

	const journeyStats = useMemo(() => {
		if (!currentJourney) {
			return null;
		}

		const totalMinutes =
			(Date.now() - journeyState.startTime.getTime()) / (1000 * 60);
		const totalHours = Math.floor(totalMinutes / 60);
		const remainingMinutes = Math.floor(totalMinutes % 60);

		// Calculate waiting time
		const waitingSteps = currentJourney.steps.filter(
			step => step.type === 'Waiting'
		);
		const waitingTime = waitingSteps.reduce((total, step) => {
			const start = new Date(step.startTime).getTime();
			const end = step.endTime ? new Date(step.endTime).getTime() : Date.now();
			return total + (end - start) / (1000 * 60);
		}, 0);

		return {
			totalTime:
				totalHours > 0
					? `${totalHours}h${remainingMinutes}`
					: `${Math.floor(totalMinutes)} min`,
			vehicleCount: journeyState.detectedVehicleChanges,
			waitingTime: Math.floor(waitingTime),
		};
	}, [currentJourney, journeyState]);

	if (!currentJourney || !visible) {
		return null;
	}

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<TouchableOpacity
				style={styles.backdrop}
				activeOpacity={1}
				onPress={onClose}
			>
				<View style={styles.sheetContainer}>
					<TouchableOpacity activeOpacity={1}>
						{/* Handle bar */}
						<View style={styles.handleBar} />

						{/* Header */}
						<View style={styles.header}>
							<View>
								<Text style={styles.headerTitle}>Trajet en cours</Text>
								<Text style={styles.headerSubtitle}>
									{currentJourney.origin} → {currentJourney.destination}
								</Text>
							</View>
							<TouchableOpacity
								style={styles.closeButton}
								onPress={onClose}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Text style={styles.closeButtonText}>✕</Text>
							</TouchableOpacity>
						</View>

						{/* Stats */}
						{journeyStats && (
							<View style={styles.statsContainer}>
								<View style={styles.statItem}>
									<Text style={styles.statValue}>{journeyStats.totalTime}</Text>
									<Text style={styles.statLabel}>Durée totale</Text>
								</View>
								<View style={styles.statDivider} />
								<View style={styles.statItem}>
									<Text style={styles.statValue}>
										{journeyStats.vehicleCount}
									</Text>
									<Text style={styles.statLabel}>Véhicule(s)</Text>
								</View>
								<View style={styles.statDivider} />
								<View style={styles.statItem}>
									<Text style={styles.statValue}>
										{journeyStats.waitingTime} min
									</Text>
									<Text style={styles.statLabel}>Attente</Text>
								</View>
							</View>
						)}

						{/* Timeline */}
						<View style={styles.timelineContainer}>
							<Text style={styles.sectionTitle}>Historique du trajet</Text>
							<JourneyTimeline
								steps={currentJourney.steps}
								currentStepId={journeyState.currentStep?.id}
							/>
						</View>

						{/* Actions */}
						<View style={styles.actionsContainer}>
							<TouchableOpacity
								style={styles.stopButton}
								onPress={handleStopJourney}
								activeOpacity={0.8}
							>
								<Text style={styles.stopButtonText}>Terminer le trajet</Text>
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		</Modal>
	);
};

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	sheetContainer: {
		height: SHEET_HEIGHT,
		backgroundColor: COLORS.background,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 8,
	},
	handleBar: {
		width: 40,
		height: 4,
		backgroundColor: COLORS.surface,
		borderRadius: 2,
		alignSelf: 'center',
		marginTop: SPACING.sm,
		marginBottom: SPACING.md,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		paddingHorizontal: SPACING.md,
		paddingBottom: SPACING.md,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.surface,
	},
	headerTitle: {
		fontSize: SIZES.fontXl,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: SPACING.xs / 2,
	},
	headerSubtitle: {
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
	},
	closeButton: {
		padding: SPACING.xs,
	},
	closeButtonText: {
		fontSize: SIZES.fontXl,
		color: COLORS.textSecondary,
	},
	statsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: SPACING.md,
		backgroundColor: COLORS.surface,
		marginHorizontal: SPACING.md,
		marginTop: SPACING.md,
		borderRadius: 8,
	},
	statItem: {
		flex: 1,
		alignItems: 'center',
	},
	statValue: {
		fontSize: SIZES.fontXl,
		fontWeight: 'bold',
		color: COLORS.primary,
		marginBottom: SPACING.xs / 2,
	},
	statLabel: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
	},
	statDivider: {
		width: 1,
		backgroundColor: COLORS.background,
		marginHorizontal: SPACING.sm,
	},
	timelineContainer: {
		flex: 1,
		marginTop: SPACING.md,
		paddingHorizontal: SPACING.md,
	},
	sectionTitle: {
		fontSize: SIZES.fontLg,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: SPACING.md,
	},
	actionsContainer: {
		padding: SPACING.md,
		borderTopWidth: 1,
		borderTopColor: COLORS.surface,
	},
	stopButton: {
		backgroundColor: COLORS.error,
		paddingVertical: SPACING.md,
		borderRadius: 8,
		alignItems: 'center',
	},
	stopButtonText: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.background,
	},
});
