import BottomSheet, {
	BottomSheetScrollView,
	type BottomSheetScrollViewMethods,
} from '@gorhom/bottom-sheet';
import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSpotComments } from '../../comment/hooks';
import { sheetStyles, toastUtils } from '../../components/ui';
import { SPACING } from '../../constants';
import { useTranslation } from '../../i18n';
import { DIRECTION_HEADING_DEGREES } from '../constants';
import { useSpotDetailsCommentComposer } from '../hooks';
import { SpotDetailsCommentsSection } from './SpotDetailsCommentsSection';
import {
	SpotDetailsHeaderSection,
	SpotDetailsSummarySection,
} from './SpotDetailsSections';
import {
	buildGoogleItineraryUrl,
	buildGoogleStreetViewUrl,
	EMPTY_DESTINATIONS,
	getSpotCoordinatesTitle,
	getWaitingTimeLabels,
} from './spotDetailsSheetHelpers';
import { spotDetailsSheetStyles as styles } from './spotDetailsSheetStyles';
import type {
	SpotDetailsCommentComposerModel,
	SpotDetailsSheetProps,
} from './spotDetailsTypes';

const STREET_VIEW_ICON = require('../../../assets/street-view-icon.png');
const SNAP_POINTS: string[] = ['56%', '96%'];
const SHEET_INITIAL_INDEX = 0;
const SHEET_EXPANDED_INDEX = 1;

const resolveDestinationsLabel = (destinations: string[]): string =>
	destinations.length > 0 ? destinations.join(', ') : EMPTY_DESTINATIONS;

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
	onDeleteSpot,
	canDeleteSpot,
}) => {
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();
	const bottomSheetRef = useRef<BottomSheet>(null);
	const scrollViewRef = useRef<BottomSheetScrollViewMethods>(null);
	const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
	const { comments, isLoading, isSubmitting, submitComment } = useSpotComments(
		spot.id
	);
	const commentComposerState = useSpotDetailsCommentComposer({ submitComment });

	const directionHeading = DIRECTION_HEADING_DEGREES[spot.direction];
	const spotTitle = getSpotCoordinatesTitle(spot);
	const destinationsLabel = resolveDestinationsLabel(spot.destinations);
	const { waitingTimeLabel, waitingRecordsLabel } = getWaitingTimeLabels();

	const handleSheetChange = useCallback((index: number) => {
		setIsDrawerExpanded(index >= SHEET_EXPANDED_INDEX);
	}, []);

	const handleSheetClose = useCallback(() => {
		setIsDrawerExpanded(false);
		onClose();
	}, [onClose]);

	const handleOpenStreetView = useCallback(() => {
		void openExternalUrl(
			buildGoogleStreetViewUrl(spot),
			"Impossible d'ouvrir Street View pour ce spot."
		);
	}, [spot]);

	const handleOpenItinerary = useCallback(() => {
		void openExternalUrl(
			buildGoogleItineraryUrl(spot),
			"Impossible d'ouvrir Google Itinerary pour ce spot."
		);
	}, [spot]);

	const handleDeleteSpot = useCallback(() => {
		Alert.alert(
			t('spots.deleteConfirmTitle'),
			t('spots.deleteConfirmMessage'),
			[
				{
					text: t('common.cancel'),
					style: 'cancel',
				},
				{
					text: t('common.delete'),
					style: 'destructive',
					onPress: () => {
						void onDeleteSpot(spot.id as string).then(() => {
							onClose();
						});
					},
				},
			]
		);
	}, [onClose, onDeleteSpot, spot.id, t]);

	const commentComposer = useMemo<SpotDetailsCommentComposerModel>(
		() => ({ ...commentComposerState, isSubmitting }),
		[commentComposerState, isSubmitting]
	);

	const handleCommentFocus = useCallback(() => {
		bottomSheetRef.current?.expand();
		scrollViewRef.current?.scrollToEnd({ animated: true });
	}, []);

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={SHEET_INITIAL_INDEX}
			snapPoints={SNAP_POINTS}
			enableDynamicSizing={false}
			enablePanDownToClose
			keyboardBehavior="extend"
			keyboardBlurBehavior="restore"
			android_keyboardInputMode="adjustResize"
			onChange={handleSheetChange}
			onClose={handleSheetClose}
			style={sheetStyles.container}
			backgroundStyle={[
				sheetStyles.background,
				isDrawerExpanded && styles.sheetBackgroundExpanded,
			]}
			handleStyle={styles.handle}
			handleIndicatorStyle={styles.handleIndicator}
		>
			<BottomSheetScrollView
				ref={scrollViewRef}
				style={styles.content}
				contentContainerStyle={[
					styles.contentContainer,
					{ paddingBottom: insets.bottom + SPACING.xl },
				]}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				automaticallyAdjustKeyboardInsets
				testID="spot-details-sheet"
			>
				<SpotDetailsHeaderSection
					spotTitle={spotTitle}
					streetViewIcon={STREET_VIEW_ICON}
					onOpenStreetView={handleOpenStreetView}
					onOpenItinerary={handleOpenItinerary}
					canDeleteSpot={canDeleteSpot}
					onDeleteSpot={handleDeleteSpot}
				/>
				<SpotDetailsSummarySection
					directionHeading={directionHeading}
					direction={spot.direction}
					waitingTimeLabel={waitingTimeLabel}
					waitingRecordsLabel={waitingRecordsLabel}
					destinationsLabel={destinationsLabel}
				/>
				<SpotDetailsCommentsSection
					isLoading={isLoading}
					comments={comments}
					composer={commentComposer}
					onCommentFocus={handleCommentFocus}
				/>
			</BottomSheetScrollView>
		</BottomSheet>
	);
};
