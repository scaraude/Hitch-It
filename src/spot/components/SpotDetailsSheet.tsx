import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useMemo, useState } from 'react';
import {
	Image,
	Linking,
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
	CompassIcon,
	toastUtils,
} from '../../components/ui';
import { COLORS, SIZES, SPACING } from '../../constants';
import { A11Y_LABELS } from '../../constants/accessibility';
import { DIRECTION_HEADING_DEGREES } from '../constants';
import type { Spot } from '../types';

interface SpotDetailsSheetProps {
	spot: Spot;
	onClose: () => void;
	onEmbarquer?: (spot: Spot) => void;
}

const TITLE_COORDINATE_DECIMALS = 3;
const WAITING_MINUTES_FALLBACK = '-';
const EMPTY_MAIN_ROAD = '';
const EMPTY_DESTINATIONS = '-';
const GOOGLE_DRIVING_MODE = 'driving';
const STREET_VIEW_ICON = require('../../../assets/street-view-icon.png');

const truncateCoordinate = (value: number, decimals: number): string => {
	const factor = 10 ** decimals;
	const truncatedValue =
		value < 0
			? Math.ceil(value * factor) / factor
			: Math.floor(value * factor) / factor;

	return truncatedValue.toFixed(decimals);
};

const getSpotCoordinatesTitle = (spot: Spot): string => {
	const latitude = truncateCoordinate(
		spot.coordinates.latitude,
		TITLE_COORDINATE_DECIMALS
	);
	const longitude = truncateCoordinate(
		spot.coordinates.longitude,
		TITLE_COORDINATE_DECIMALS
	);

	return `${latitude}, ${longitude}`;
};

const buildGoogleStreetViewUrl = (spot: Spot): string => {
	const { latitude, longitude } = spot.coordinates;
	return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`;
};

const buildGoogleItineraryUrl = (spot: Spot): string => {
	const { latitude, longitude } = spot.coordinates;
	return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${GOOGLE_DRIVING_MODE}`;
};

const openExternalUrl = async (
	url: string,
	failureMessage: string
): Promise<void> => {
	try {
		const canOpen = await Linking.canOpenURL(url);
		if (!canOpen) {
			throw new Error(`Cannot open URL: ${url}`);
		}

		await Linking.openURL(url);
	} catch {
		toastUtils.error('Ouverture impossible', failureMessage);
	}
};

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

	const directionHeading = DIRECTION_HEADING_DEGREES[spot.direction];
	const spotTitle = getSpotCoordinatesTitle(spot);
	const destinationsLabel =
		spot.destinations.length > 0
			? spot.destinations.join(', ')
			: EMPTY_DESTINATIONS;

	const waitingTimes = useMemo(
		() =>
			comments
				.map(comment => comment.waitingTimeMinutes)
				.filter(
					(value): value is number =>
						typeof value === 'number' && Number.isFinite(value) && value >= 0
				),
		[comments]
	);

	const averageWaitingTimeMinutes = useMemo(() => {
		if (waitingTimes.length === 0) {
			return undefined;
		}

		const totalWaitingTime = waitingTimes.reduce(
			(total, waitingTime) => total + waitingTime,
			0
		);

		return Math.round(totalWaitingTime / waitingTimes.length);
	}, [waitingTimes]);

	const waitingTimeLabel =
		averageWaitingTimeMinutes === undefined
			? WAITING_MINUTES_FALLBACK
			: `${averageWaitingTimeMinutes} min`;
	const waitingRecordsLabel = `${waitingTimes.length} records`;

	const handleOpenStreetView = () => {
		void openExternalUrl(
			buildGoogleStreetViewUrl(spot),
			"Impossible d'ouvrir Street View pour ce spot."
		);
	};

	const handleOpenItinerary = () => {
		void openExternalUrl(
			buildGoogleItineraryUrl(spot),
			"Impossible d'ouvrir Google Itinerary pour ce spot."
		);
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
					<Ionicons name="close" size={18} color={COLORS.textSecondary} />
				</Pressable>
			</BottomSheetHeader>

			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.contentContainer}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.titleRow}>
					<Text style={styles.title}>{spotTitle}</Text>
					<View style={styles.topActions}>
						<Pressable
							style={[styles.topActionButton, styles.topActionButtonDisabled]}
							accessibilityRole="button"
							accessibilityLabel={A11Y_LABELS.favoriteComingSoon}
							accessibilityState={{ disabled: true }}
							disabled
						>
							<Ionicons
								name="heart-outline"
								size={SIZES.iconMd}
								color={COLORS.secondary}
							/>
						</Pressable>
						<Pressable
							style={styles.topActionButton}
							onPress={handleOpenStreetView}
							accessibilityRole="button"
							accessibilityLabel={A11Y_LABELS.openStreetView}
							testID="spot-details-open-street-view"
						>
							<Image
								source={STREET_VIEW_ICON}
								style={styles.streetViewIcon}
								resizeMode="contain"
							/>
						</Pressable>
						<Pressable
							style={[styles.topActionButton, styles.primaryTopActionButton]}
							onPress={handleOpenItinerary}
							accessibilityRole="button"
							accessibilityLabel={A11Y_LABELS.getGoogleItinerary}
							testID="spot-details-open-itinerary"
						>
							<Ionicons
								name="navigate-outline"
								size={SIZES.iconMd}
								color={COLORS.background}
							/>
						</Pressable>
					</View>
				</View>

				<View style={styles.summaryRow}>
					<View style={styles.summaryBlock}>
						<Text style={styles.label}>Direction</Text>
						<View style={styles.directionRow}>
							<CompassIcon heading={directionHeading} size={SIZES.iconMd} />
							<Text style={styles.value}>{spot.direction}</Text>
						</View>
					</View>

					<View style={[styles.summaryBlock, styles.waitingBlock]}>
						<Text style={styles.label}>Waiting time</Text>
						<Text style={styles.waitingValue}>{waitingTimeLabel}</Text>
						<Text style={styles.waitingRecords}>{waitingRecordsLabel}</Text>
					</View>
				</View>

				<View style={styles.dataSection}>
					<Text style={styles.label}>Main roads</Text>
					<Text style={styles.value}>{EMPTY_MAIN_ROAD}</Text>
				</View>

				<View style={styles.dataSection}>
					<Text style={styles.label}>Destinations</Text>
					<Text style={styles.value}>{destinationsLabel}</Text>
				</View>

				<View style={styles.commentsSection}>
					<Text style={styles.label}>Comments</Text>

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

				{onEmbarquer ? (
					<Pressable
						style={styles.hitchButton}
						onPress={() => onEmbarquer(spot)}
						accessibilityLabel="Hitch from this spot"
						accessibilityRole="button"
						testID="spot-embarquer-button"
					>
						<Text style={styles.hitchButtonText}>Hitch it</Text>
					</Pressable>
				) : null}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		maxHeight: '82%',
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
		left: SPACING.lg,
		top: SPACING.sm,
		padding: SPACING.xs,
	},
	content: {
		paddingHorizontal: SPACING.lg,
	},
	contentContainer: {
		paddingBottom: SPACING.xl,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: SPACING.lg,
	},
	title: {
		fontSize: SIZES.font2Xl,
		fontWeight: '700',
		color: COLORS.text,
		flexShrink: 1,
		paddingRight: SPACING.md,
	},
	topActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING.sm,
	},
	topActionButton: {
		width: SIZES.fabSize - SPACING.sm,
		height: SIZES.fabSize - SPACING.sm,
		borderRadius: SIZES.radiusRound,
		backgroundColor: COLORS.background,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 5,
	},
	topActionButtonDisabled: {
		opacity: 0.8,
	},
	primaryTopActionButton: {
		backgroundColor: COLORS.secondary,
	},
	streetViewIcon: {
		width: SIZES.iconMd,
		height: SIZES.iconMd,
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: SPACING.md,
	},
	summaryBlock: {
		flex: 1,
	},
	waitingBlock: {
		alignItems: 'flex-start',
	},
	label: {
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
		marginBottom: SPACING.xs,
	},
	directionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING.sm,
	},
	value: {
		fontSize: SIZES.font2Xl,
		color: COLORS.text,
		fontWeight: '500',
	},
	waitingValue: {
		fontSize: SIZES.font2Xl,
		color: COLORS.text,
		fontWeight: '500',
	},
	waitingRecords: {
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
		marginTop: SPACING.xs,
	},
	dataSection: {
		marginTop: SPACING.lg,
	},
	commentsSection: {
		marginTop: SPACING.lg,
		gap: SPACING.sm,
	},
	loadingComments: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		fontStyle: 'italic',
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
	hitchButton: {
		marginTop: SPACING.xl,
		backgroundColor: COLORS.warning,
		borderRadius: SIZES.radiusXLarge,
		paddingVertical: SPACING.md + SPACING.xs,
		alignItems: 'center',
		justifyContent: 'center',
	},
	hitchButtonText: {
		fontSize: SIZES.font3Xl,
		fontWeight: '700',
		color: COLORS.background,
	},
});
