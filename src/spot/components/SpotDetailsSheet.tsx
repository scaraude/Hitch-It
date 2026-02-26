import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSpotComments } from '../../comment/hooks';
import { toastUtils } from '../../components/ui';
import { SPACING } from '../../constants';
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
const SHEET_SNAP_POINTS = ['56%', '96%'] as const;
const SHEET_INITIAL_INDEX = 0;
const SHEET_EXPANDED_INDEX = 1;

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
	const { comments, isLoading, isSubmitting, submitComment } = useSpotComments(
		spot.id
	);
	const commentComposerState = useSpotDetailsCommentComposer({ submitComment });

	const snapPoints = useMemo(() => [...SHEET_SNAP_POINTS], []);
	const directionHeading = DIRECTION_HEADING_DEGREES[spot.direction];
	const spotTitle = getSpotCoordinatesTitle(spot);
	const destinationsLabel =
		spot.destinations.length > 0
			? spot.destinations.join(', ')
			: EMPTY_DESTINATIONS;
	const { waitingTimeLabel, waitingRecordsLabel } = useMemo(
		() => getWaitingTimeLabels(comments),
		[comments]
	);

	const handleSheetChange = useCallback((index: number) => {
		setIsDrawerExpanded(index >= SHEET_EXPANDED_INDEX);
	}, []);

	const handleSheetClose = useCallback(() => {
		setIsDrawerExpanded(false);
		onClose();
	}, [onClose]);

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
	const commentComposer: SpotDetailsCommentComposerModel = {
		...commentComposerState,
		isSubmitting,
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
				<SpotDetailsHeaderSection
					spotTitle={spotTitle}
					streetViewIcon={STREET_VIEW_ICON}
					onOpenStreetView={handleOpenStreetView}
					onOpenItinerary={handleOpenItinerary}
				/>
				<SpotDetailsSummarySection
					directionHeading={directionHeading}
					directionLabel={spot.direction}
					waitingTimeLabel={waitingTimeLabel}
					waitingRecordsLabel={waitingRecordsLabel}
					destinationsLabel={destinationsLabel}
				/>
				<SpotDetailsCommentsSection
					isLoading={isLoading}
					comments={comments}
					composer={commentComposer}
				/>
			</BottomSheetScrollView>
		</BottomSheet>
	);
};
