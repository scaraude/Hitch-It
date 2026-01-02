import type React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';
import { StepType, type TravelStep } from '../types';

interface JourneyTimelineProps {
	steps: TravelStep[];
	currentStepId?: string;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
	steps,
	currentStepId,
}) => {
	const getStepIcon = (stepType: StepType) => {
		switch (stepType) {
			case StepType.Waiting:
				return '🤚';
			case StepType.InVehicle:
				return '🚗';
			case StepType.Walking:
				return '🚶';
			case StepType.Break:
				return '☕';
			default:
				return '•';
		}
	};

	const getStepLabel = (stepType: StepType) => {
		switch (stepType) {
			case StepType.Waiting:
				return 'En attente';
			case StepType.InVehicle:
				return 'En véhicule';
			case StepType.Walking:
				return 'À pied';
			case StepType.Break:
				return 'Pause';
			default:
				return 'Étape';
		}
	};

	const formatDuration = (startTime: Date, endTime?: Date) => {
		const start = new Date(startTime).getTime();
		const end = endTime ? new Date(endTime).getTime() : Date.now();
		const durationMinutes = Math.floor((end - start) / (1000 * 60));

		if (durationMinutes < 60) {
			return `${durationMinutes} min`;
		}

		const hours = Math.floor(durationMinutes / 60);
		const minutes = durationMinutes % 60;
		return `${hours}h${minutes.toString().padStart(2, '0')}`;
	};

	const formatTime = (date: Date) => {
		return new Date(date).toLocaleTimeString('fr-FR', {
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (steps.length === 0) {
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyText}>Aucune étape pour le moment</Text>
				<Text style={styles.emptySubtext}>
					Votre voyage sera enregistré automatiquement
				</Text>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{steps.map((step, index) => {
				const isCurrentStep = step.id === currentStepId;

				return (
					<View key={step.id} style={styles.stepContainer}>
						{/* Timeline connector */}
						{index > 0 && <View style={styles.connector} />}

						{/* Step content */}
						<View
							style={[
								styles.stepContent,
								isCurrentStep && styles.currentStepContent,
							]}
						>
							<View style={styles.stepHeader}>
								<Text style={styles.stepIcon}>{getStepIcon(step.type)}</Text>
								<View style={styles.stepInfo}>
									<Text
										style={[
											styles.stepLabel,
											isCurrentStep && styles.currentStepLabel,
										]}
									>
										{getStepLabel(step.type)}
									</Text>
									<Text style={styles.stepTime}>
										{formatTime(step.startTime)}
										{step.endTime && ` - ${formatTime(step.endTime)}`}
									</Text>
								</View>
								<Text style={styles.stepDuration}>
									{formatDuration(step.startTime, step.endTime)}
								</Text>
							</View>

							{/* Notes if available */}
							{step.notes && <Text style={styles.stepNotes}>{step.notes}</Text>}

							{/* Current step indicator */}
							{isCurrentStep && !step.endTime && (
								<View style={styles.currentIndicator}>
									<View style={styles.pulsingDot} />
									<Text style={styles.currentText}>En cours</Text>
								</View>
							)}
						</View>
					</View>
				);
			})}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: SPACING.xl,
	},
	emptyText: {
		fontSize: SIZES.fontLg,
		fontWeight: '600',
		color: COLORS.textSecondary,
		textAlign: 'center',
		marginBottom: SPACING.xs,
	},
	emptySubtext: {
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
		textAlign: 'center',
	},
	stepContainer: {
		position: 'relative',
		paddingLeft: SPACING.md,
	},
	connector: {
		position: 'absolute',
		left: SPACING.md + 16,
		top: 0,
		width: 2,
		height: '100%',
		backgroundColor: COLORS.surface,
	},
	stepContent: {
		backgroundColor: COLORS.background,
		borderRadius: 8,
		padding: SPACING.md,
		marginBottom: SPACING.md,
		marginLeft: SPACING.md,
		borderWidth: 1,
		borderColor: COLORS.surface,
	},
	currentStepContent: {
		borderColor: COLORS.primary,
		borderWidth: 2,
		backgroundColor: '#F0F8FF',
	},
	stepHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	stepIcon: {
		fontSize: SIZES.fontXl,
		marginRight: SPACING.sm,
	},
	stepInfo: {
		flex: 1,
	},
	stepLabel: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: SPACING.xs / 2,
	},
	currentStepLabel: {
		color: COLORS.primary,
	},
	stepTime: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
	},
	stepDuration: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.primary,
		backgroundColor: COLORS.surface,
		paddingHorizontal: SPACING.sm,
		paddingVertical: SPACING.xs / 2,
		borderRadius: 4,
	},
	stepNotes: {
		fontSize: SIZES.fontSm,
		color: COLORS.text,
		marginTop: SPACING.sm,
		paddingTop: SPACING.sm,
		borderTopWidth: 1,
		borderTopColor: COLORS.surface,
	},
	currentIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: SPACING.sm,
	},
	pulsingDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.success,
		marginRight: SPACING.xs,
	},
	currentText: {
		fontSize: SIZES.fontSm,
		color: COLORS.success,
		fontWeight: '600',
	},
});
