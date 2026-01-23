import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { useJourney } from '../context/JourneyContext';
import { JourneyStatus } from '../types';

const formatDuration = (ms: number): string => {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}h${minutes.toString().padStart(2, '0')}`;
	}
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const ActiveJourneyIndicator = () => {
	const { activeJourney, isRecording, stopsCount } = useJourney();
	const [elapsed, setElapsed] = useState(0);

	useEffect(() => {
		if (!activeJourney || !isRecording) {
			setElapsed(0);
			return;
		}

		const startTime = activeJourney.startedAt.getTime();

		const updateElapsed = () => {
			setElapsed(Date.now() - startTime);
		};

		updateElapsed();
		const interval = setInterval(updateElapsed, 1000);

		return () => clearInterval(interval);
	}, [activeJourney, isRecording]);

	if (!activeJourney) return null;

	const isPaused = activeJourney.status === JourneyStatus.Paused;

	return (
		<View style={[styles.container, isPaused && styles.pausedContainer]}>
			<View style={styles.statusRow}>
				<View style={[styles.dot, isRecording && styles.dotRecording]} />
				<Text style={styles.statusText}>
					{isRecording ? 'Enregistrement' : 'En pause'}
				</Text>
			</View>

			<View style={styles.statsRow}>
				<View style={styles.stat}>
					<Text style={styles.statValue}>{formatDuration(elapsed)}</Text>
					<Text style={styles.statLabel}>Durée</Text>
				</View>

				<View style={styles.separator} />

				<View style={styles.stat}>
					<Text style={styles.statValue}>{stopsCount}</Text>
					<Text style={styles.statLabel}>
						{stopsCount === 1 ? 'Arrêt' : 'Arrêts'}
					</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		borderRadius: 12,
		minWidth: 160,
	},
	pausedContainer: {
		backgroundColor: COLORS.warning,
	},
	statusRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: SPACING.xs,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.textLight,
		marginRight: SPACING.xs,
		opacity: 0.6,
	},
	dotRecording: {
		backgroundColor: COLORS.error,
		opacity: 1,
	},
	statusText: {
		color: COLORS.textLight,
		fontSize: 12,
		fontWeight: '500',
	},
	statsRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	stat: {
		alignItems: 'center',
		flex: 1,
	},
	statValue: {
		color: COLORS.textLight,
		fontSize: 18,
		fontWeight: '700',
	},
	statLabel: {
		color: COLORS.textLight,
		fontSize: 10,
		opacity: 0.8,
	},
	separator: {
		width: 1,
		height: 24,
		backgroundColor: COLORS.textLight,
		opacity: 0.3,
	},
});
