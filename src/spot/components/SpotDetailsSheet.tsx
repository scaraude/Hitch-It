import type React from 'react';
import {
	Linking,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';
import { formatDate } from '../../utils';
import { APPRECIATION_CONFIG, DIRECTION_CONFIG } from '../constants';
import type { Spot } from '../types';
import { DestinationChip } from './ui';

interface SpotDetailsSheetProps {
	spot: Spot;
	onClose: () => void;
	onAddComment?: () => void;
}

export const SpotDetailsSheet: React.FC<SpotDetailsSheetProps> = ({
	spot,
	onClose,
	onAddComment,
}) => {
	const appreciationConfig = APPRECIATION_CONFIG[spot.appreciation];
	const directionEmoji = DIRECTION_CONFIG[spot.direction].emoji;

	const handleOpenMap = () => {
		const { latitude, longitude } = spot.coordinates;
		const label = encodeURIComponent(spot.roadName);

		const url = Platform.select({
			ios: `maps:?q=${label}&ll=${latitude},${longitude}`,
			android: `geo:0,0?q=${latitude},${longitude}(${label})`,
		});

		if (url) {
			Linking.openURL(url);
		}
	};

	const handleGetDirections = () => {
		const { latitude, longitude } = spot.coordinates;

		const url = Platform.select({
			ios: `maps:?daddr=${latitude},${longitude}`,
			android: `google.navigation:q=${latitude},${longitude}`,
		});

		if (url) {
			Linking.openURL(url);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.dragHandle} />
				<TouchableOpacity onPress={onClose} style={styles.closeButton}>
					<Text style={styles.closeButtonText}>✕</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Appreciation Badge */}
				<View
					style={[
						styles.appreciationBadge,
						{ backgroundColor: appreciationConfig.color },
					]}
				>
					<Text style={styles.appreciationEmoji}>
						{appreciationConfig.emoji}
					</Text>
					<Text style={styles.appreciationText}>
						{appreciationConfig.label}
					</Text>
				</View>

				{/* Road Name */}
				<Text style={styles.roadName}>{spot.roadName}</Text>

				{/* Direction */}
				<View style={styles.infoRow}>
					<Text style={styles.infoLabel}>Direction</Text>
					<View style={styles.directionContainer}>
						<Text style={styles.directionEmoji}>{directionEmoji}</Text>
						<Text style={styles.infoValue}>{spot.direction}</Text>
					</View>
				</View>

				{/* Destinations */}
				{spot.destinations.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Destinations</Text>
						<View style={styles.destinationList}>
							{spot.destinations.map(dest => (
								<DestinationChip key={dest} destination={dest} />
							))}
						</View>
					</View>
				)}

				{/* Location */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Localisation</Text>
					<TouchableOpacity style={styles.mapButton} onPress={handleOpenMap}>
						<Text style={styles.mapButtonText}>📍 Voir sur la carte</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.directionsButton}
						onPress={handleGetDirections}
					>
						<Text style={styles.directionsButtonText}>🧭 Itinéraire</Text>
					</TouchableOpacity>
				</View>

				{/* Metadata */}
				<View style={styles.metadata}>
					<Text style={styles.metadataText}>
						Créé le {formatDate(spot.createdAt)}
					</Text>
					<Text style={styles.metadataText}>Par {spot.createdBy}</Text>
				</View>

				{/* Comments Section (placeholder for future) */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Commentaires</Text>
					<Text style={styles.noComments}>
						Aucun commentaire pour le moment
					</Text>
					{onAddComment && (
						<TouchableOpacity
							style={styles.addCommentButton}
							onPress={onAddComment}
						>
							<Text style={styles.addCommentButtonText}>
								+ Ajouter un commentaire
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: COLORS.background,
		borderTopLeftRadius: SIZES.radiusXLarge,
		borderTopRightRadius: SIZES.radiusXLarge,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 5,
		maxHeight: '80%',
	},
	header: {
		alignItems: 'center',
		paddingTop: SPACING.sm,
		paddingHorizontal: SPACING.lg,
		position: 'relative',
	},
	dragHandle: {
		width: SIZES.dragHandleWidth,
		height: SIZES.dragHandleHeight,
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusSmall,
		marginBottom: SPACING.md,
	},
	closeButton: {
		position: 'absolute',
		right: SPACING.lg,
		top: SPACING.sm,
		width: SIZES.iconLg,
		height: SIZES.iconLg,
		borderRadius: SIZES.radiusLarge,
		backgroundColor: COLORS.surface,
		alignItems: 'center',
		justifyContent: 'center',
	},
	closeButtonText: {
		fontSize: SIZES.fontLg,
		color: COLORS.text,
		fontWeight: 'bold',
	},
	content: {
		paddingHorizontal: SPACING.lg,
		paddingBottom: SPACING.xl,
	},
	appreciationBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		paddingVertical: SPACING.sm,
		paddingHorizontal: SPACING.md,
		borderRadius: SIZES.radiusXLarge,
		marginBottom: SPACING.md,
	},
	appreciationEmoji: {
		fontSize: SIZES.fontXl,
		marginRight: SPACING.sm,
	},
	appreciationText: {
		fontSize: SIZES.fontMd,
		fontWeight: '700',
		color: COLORS.background,
	},
	roadName: {
		fontSize: SIZES.font3Xl,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: SPACING.lg,
	},
	infoRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: SPACING.md,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.surface,
	},
	infoLabel: {
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
		fontWeight: '500',
	},
	infoValue: {
		fontSize: SIZES.fontMd,
		color: COLORS.text,
		fontWeight: '600',
	},
	directionContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING.sm,
	},
	directionEmoji: {
		fontSize: SIZES.fontXl,
	},
	section: {
		marginTop: SPACING.lg,
	},
	sectionTitle: {
		fontSize: SIZES.fontLg,
		fontWeight: '700',
		color: COLORS.text,
		marginBottom: SPACING.md,
	},
	destinationList: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING.sm,
	},
	mapButton: {
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.md,
		paddingHorizontal: SPACING.lg,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
		marginBottom: SPACING.sm,
	},
	mapButtonText: {
		fontSize: SIZES.fontMd,
		color: COLORS.background,
		fontWeight: '600',
	},
	directionsButton: {
		backgroundColor: COLORS.surface,
		paddingVertical: SPACING.md,
		paddingHorizontal: SPACING.lg,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.primary,
	},
	directionsButtonText: {
		fontSize: SIZES.fontMd,
		color: COLORS.primary,
		fontWeight: '600',
	},
	metadata: {
		marginTop: SPACING.lg,
		paddingTop: SPACING.md,
		borderTopWidth: 1,
		borderTopColor: COLORS.surface,
	},
	metadataText: {
		fontSize: SIZES.fontXs,
		color: COLORS.textSecondary,
		marginBottom: SPACING.xs,
	},
	noComments: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		fontStyle: 'italic',
		marginBottom: SPACING.md,
	},
	addCommentButton: {
		backgroundColor: COLORS.surface,
		paddingVertical: SPACING.md,
		paddingHorizontal: SPACING.lg,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
	},
	addCommentButtonText: {
		fontSize: SIZES.fontSm,
		color: COLORS.primary,
		fontWeight: '600',
	},
});
