import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useState } from 'react';
import {
	Linking,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { CommentEditor, CommentList } from '../../comment/components';
import { useSpotComments } from '../../comment/hooks';
import type { CommentAppreciation } from '../../comment/types';
import {
	BottomSheetHeader,
	bottomSheetStyles,
	toastUtils,
} from '../../components/ui';
import { COLORS, SIZES, SPACING } from '../../constants';
import { A11Y_LABELS } from '../../constants/accessibility';
import { formatDate } from '../../utils';
import { DIRECTION_CONFIG } from '../constants';
import type { Spot } from '../types';
import { DestinationChip } from './ui';

interface SpotDetailsSheetProps {
	spot: Spot;
	onClose: () => void;
	onEmbarquer?: (spot: Spot) => void;
}

export const SpotDetailsSheet: React.FC<SpotDetailsSheetProps> = ({
	spot,
	onClose,
	onEmbarquer,
}) => {
	const [isWritingComment, setIsWritingComment] = useState(false);
	const [draftAppreciation, setDraftAppreciation] = useState<
		CommentAppreciation | undefined
	>(undefined);
	const [draftComment, setDraftComment] = useState('');
	const { comments, isLoading, isSubmitting, submitComment } = useSpotComments(
		spot.id
	);
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

	const handleStartComment = () => {
		setIsWritingComment(true);
	};

	const handleCancelComment = () => {
		setIsWritingComment(false);
		setDraftAppreciation(undefined);
		setDraftComment('');
	};

	const handleSubmitComment = async () => {
		if (draftAppreciation === undefined) {
			toastUtils.error(
				'Appréciation requise',
				'Sélectionne une appréciation pour ton commentaire.'
			);
			return;
		}

		const submitted = await submitComment({
			appreciation: draftAppreciation,
			comment: draftComment,
		});

		if (submitted) {
			handleCancelComment();
		}
	};

	return (
		<View
			style={[bottomSheetStyles.container, styles.container]}
			testID="spot-details-sheet"
		>
			<BottomSheetHeader
				style={styles.header}
				dragHandleStyle={styles.dragHandle}
			>
				<Pressable
					onPress={onClose}
					style={styles.closeButton}
					accessibilityLabel={A11Y_LABELS.closeButton}
					accessibilityHint={A11Y_LABELS.closeSheetHint}
					accessibilityRole="button"
					testID="spot-details-close"
				>
					<Ionicons name="close" size={20} color={COLORS.text} />
				</Pressable>
			</BottomSheetHeader>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
					<Pressable
						style={styles.mapButton}
						onPress={handleOpenMap}
						accessibilityLabel={A11Y_LABELS.openMap}
						accessibilityRole="button"
					>
						<View style={styles.actionButtonContent}>
							<Ionicons
								name="map-outline"
								size={16}
								color={COLORS.background}
							/>
							<Text style={styles.mapButtonText}>Voir sur la carte</Text>
						</View>
					</Pressable>
					<Pressable
						style={styles.directionsButton}
						onPress={handleGetDirections}
						accessibilityLabel={A11Y_LABELS.getDirections}
						accessibilityRole="button"
					>
						<View style={styles.actionButtonContent}>
							<Ionicons
								name="navigate-outline"
								size={16}
								color={COLORS.primary}
							/>
							<Text style={styles.directionsButtonText}>Itinéraire</Text>
						</View>
					</Pressable>
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

					{isLoading ? (
						<Text style={styles.loadingComments}>
							Chargement des commentaires...
						</Text>
					) : (
						<CommentList comments={comments} />
					)}

					{isWritingComment ? (
						<View style={styles.commentComposer}>
							<CommentEditor
								appreciation={draftAppreciation}
								comment={draftComment}
								onAppreciationChange={setDraftAppreciation}
								onCommentChange={setDraftComment}
							/>
							<View style={styles.commentComposerActions}>
								<Pressable
									style={[
										styles.commentComposerButton,
										styles.cancelCommentButton,
									]}
									onPress={handleCancelComment}
									disabled={isSubmitting}
									accessibilityLabel={A11Y_LABELS.cancelAction}
									accessibilityRole="button"
								>
									<Text style={styles.cancelCommentText}>Annuler</Text>
								</Pressable>
								<Pressable
									style={[
										styles.commentComposerButton,
										styles.submitCommentButton,
									]}
									onPress={handleSubmitComment}
									disabled={isSubmitting}
									accessibilityLabel={A11Y_LABELS.submitComment}
									accessibilityRole="button"
								>
									<Text style={styles.submitCommentText}>
										{isSubmitting ? 'Envoi...' : 'Publier'}
									</Text>
								</Pressable>
							</View>
						</View>
					) : (
						<Pressable
							style={styles.addCommentButton}
							onPress={handleStartComment}
							accessibilityLabel={A11Y_LABELS.addComment}
							accessibilityRole="button"
						>
							<Text style={styles.addCommentButtonText}>
								+ Ajouter un commentaire
							</Text>
						</Pressable>
					)}
				</View>

				{/* Embarquer Button */}
				{onEmbarquer ? (
					<Pressable
						style={styles.embarquerButton}
						onPress={() => onEmbarquer(spot)}
						accessibilityLabel="Embarquer depuis ce spot"
						accessibilityRole="button"
						testID="spot-embarquer-button"
					>
						<View style={styles.actionButtonContent}>
							<Ionicons name="car" size={18} color={COLORS.background} />
							<Text style={styles.embarquerButtonText}>
								Embarquer depuis ce spot
							</Text>
						</View>
					</Pressable>
				) : null}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		maxHeight: '80%',
	},
	header: {
		paddingHorizontal: SPACING.lg,
		position: 'relative',
	},
	dragHandle: {
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
	actionButtonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING.sm,
	},
	content: {
		paddingHorizontal: SPACING.lg,
		paddingBottom: SPACING.xl,
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
	loadingComments: {
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
	commentComposer: {
		marginTop: SPACING.md,
		padding: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		backgroundColor: COLORS.surface,
		gap: SPACING.md,
	},
	commentComposerActions: {
		flexDirection: 'row',
		gap: SPACING.sm,
	},
	commentComposerButton: {
		flex: 1,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
	},
	cancelCommentButton: {
		backgroundColor: COLORS.background,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	submitCommentButton: {
		backgroundColor: COLORS.primary,
	},
	cancelCommentText: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.text,
	},
	submitCommentText: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.background,
	},
	embarquerButton: {
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.lg,
		paddingHorizontal: SPACING.lg,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
		marginTop: SPACING.xl,
		marginBottom: SPACING.lg,
	},
	embarquerButtonText: {
		fontSize: SIZES.fontLg,
		color: COLORS.background,
		fontWeight: '700',
	},
});
