import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
	Image,
	Linking,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommentEditor, CommentList } from '../../comment/components';
import { useSpotComments } from '../../comment/hooks';
import type { CommentAppreciation } from '../../comment/types';
import { CompassIcon, toastUtils } from '../../components/ui';
import { COLORS, SIZES, SPACING } from '../../constants';
import { A11Y_LABELS } from '../../constants/accessibility';
import { DIRECTION_HEADING_DEGREES } from '../constants';
import type { Spot } from '../types';

interface SpotDetailsSheetProps {
	spot: Spot;
	onClose: () => void;
}

const TITLE_COORDINATE_DECIMALS = 3;
const WAITING_MINUTES_FALLBACK = '-';
const EMPTY_MAIN_ROAD = '';
const EMPTY_DESTINATIONS = '-';
const GOOGLE_DRIVING_MODE = 'driving';
const STREET_VIEW_ICON = require('../../../assets/street-view-icon.png');
const SHEET_SNAP_POINTS = ['56%', '96%'] as const;
const SHEET_INITIAL_INDEX = 0;
const SHEET_EXPANDED_INDEX = 1;
const HANDLE_INDICATOR_WIDTH = 76;
const HANDLE_INDICATOR_HEIGHT = 6;
const HANDLE_INDICATOR_OPACITY = 0.65;

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
}) => {
	const insets = useSafeAreaInsets();
	const bottomSheetRef = useRef<BottomSheet>(null);
	const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
	const [isWritingComment, setIsWritingComment] = useState(false);
	const [draftAppreciation, setDraftAppreciation] = useState<
		CommentAppreciation | undefined
	>(undefined);
	const [draftComment, setDraftComment] = useState('');
	const { comments, isLoading, isSubmitting, submitComment } = useSpotComments(
		spot.id
	);

	const snapPoints = useMemo(() => [...SHEET_SNAP_POINTS], []);
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

	const handleSheetChange = useCallback((index: number) => {
		setIsDrawerExpanded(index >= SHEET_EXPANDED_INDEX);
	}, []);

	const handleSheetClose = useCallback(() => {
		setIsDrawerExpanded(false);
		onClose();
	}, [onClose]);

	const handleClose = useCallback(() => {
		bottomSheetRef.current?.close();
	}, []);

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
		<BottomSheet
			ref={bottomSheetRef}
			index={SHEET_INITIAL_INDEX}
			snapPoints={snapPoints}
			enableDynamicSizing={false}
			enablePanDownToClose
			onChange={handleSheetChange}
			onClose={handleSheetClose}
			style={styles.sheetContainer}
			backgroundStyle={[
				styles.sheetBackground,
				isDrawerExpanded && styles.sheetBackgroundExpanded,
			]}
			handleStyle={styles.handle}
			handleIndicatorStyle={styles.handleIndicator}
		>
			<BottomSheetScrollView
				style={styles.content}
				contentContainerStyle={[
					styles.contentContainer,
					{ paddingBottom: insets.bottom + SPACING.xl },
				]}
				showsVerticalScrollIndicator={false}
				testID="spot-details-sheet"
			>
				<View style={styles.headerRow}>
					<Pressable
						onPress={handleClose}
						style={styles.closeButton}
						accessibilityLabel={A11Y_LABELS.closeButton}
						accessibilityHint={A11Y_LABELS.closeSheetHint}
						accessibilityRole="button"
						testID="spot-details-close"
					>
						<Ionicons name="close" size={18} color={COLORS.textSecondary} />
					</Pressable>
				</View>

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
			</BottomSheetScrollView>
		</BottomSheet>
	);
};

const styles = StyleSheet.create({
	sheetContainer: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 5,
	},
	sheetBackground: {
		backgroundColor: COLORS.background,
		borderTopLeftRadius: SIZES.radiusXLarge,
		borderTopRightRadius: SIZES.radiusXLarge,
	},
	sheetBackgroundExpanded: {
		borderTopLeftRadius: SIZES.radiusLarge,
		borderTopRightRadius: SIZES.radiusLarge,
	},
	handle: {
		paddingTop: SPACING.sm,
		paddingBottom: SPACING.md,
	},
	handleIndicator: {
		width: HANDLE_INDICATOR_WIDTH,
		height: HANDLE_INDICATOR_HEIGHT,
		borderRadius: SIZES.radiusRound,
		backgroundColor: COLORS.textSecondary,
		opacity: HANDLE_INDICATOR_OPACITY,
	},
	content: {
		paddingHorizontal: SPACING.lg,
	},
	contentContainer: {
		paddingBottom: SPACING.xl,
	},
	headerRow: {
		alignItems: 'flex-start',
		marginBottom: SPACING.xs,
	},
	closeButton: {
		padding: SPACING.xs,
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
});
