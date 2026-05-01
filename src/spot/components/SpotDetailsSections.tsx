import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { CompassIcon } from '../../components/ui';
import { COLORS, SIZES } from '../../constants';
import { A11Y_LABELS } from '../../constants/accessibility';
import { useTranslation } from '../../i18n';
import { EMPTY_MAIN_ROAD } from './spotDetailsSheetHelpers';
import { spotDetailsSheetStyles as styles } from './spotDetailsSheetStyles';
import type {
	SpotDetailsHeaderSectionProps,
	SpotDetailsSummarySectionProps,
} from './spotDetailsTypes';
import { DirectionDisplay } from './ui';

export const SpotDetailsHeaderSection: React.FC<
	SpotDetailsHeaderSectionProps
> = ({
	spotTitle,
	streetViewIcon,
	onOpenStreetView,
	onOpenItinerary,
	canDeleteSpot,
	onDeleteSpot,
}) => {
	const { t } = useTranslation();

	return (
		<View style={styles.titleRow}>
			<Text style={styles.title}>{spotTitle}</Text>
			<View style={styles.topActions}>
				<Pressable
					style={styles.topActionButton}
					onPress={onOpenStreetView}
					accessibilityRole="button"
					accessibilityLabel={A11Y_LABELS.openStreetView}
					testID="spot-details-open-street-view"
				>
					<Image
						source={streetViewIcon}
						style={styles.streetViewIcon}
						resizeMode="contain"
					/>
				</Pressable>
				<Pressable
					style={styles.itineraryCalloutButton}
					onPress={onOpenItinerary}
					accessibilityRole="button"
					accessibilityLabel={A11Y_LABELS.getGoogleItinerary}
					accessibilityHint={t('spots.openGoogleItineraryHint')}
					testID="spot-details-open-itinerary"
				>
					<View style={styles.itineraryCalloutIconWrap}>
						<Ionicons
							name="navigate-outline"
							size={SIZES.iconMd}
							color={COLORS.background}
						/>
					</View>
					<View style={styles.itineraryCalloutTextWrap}>
						<Text style={styles.itineraryCalloutEyebrow}>Google Maps</Text>
						<Text style={styles.itineraryCalloutLabel}>
							{t('spots.openGoogleItineraryCta')}
						</Text>
					</View>
				</Pressable>
				{canDeleteSpot && (
					<Pressable
						style={[styles.topActionButton, styles.dangerTopActionButton]}
						onPress={onDeleteSpot}
						accessibilityRole="button"
						accessibilityLabel={t('spots.delete')}
						testID="spot-details-delete"
					>
						<Ionicons
							name="trash-outline"
							size={SIZES.iconMd}
							color={COLORS.background}
						/>
					</Pressable>
				)}
			</View>
		</View>
	);
};

export const SpotDetailsSummarySection: React.FC<
	SpotDetailsSummarySectionProps
> = ({
	directionHeading,
	direction,
	waitingTimeLabel,
	waitingRecordsLabel,
	destinationsLabel,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<View style={styles.summaryRow}>
				<View style={styles.summaryBlock}>
					<Text style={styles.label}>{t('spots.direction')}</Text>
					<View style={styles.directionRow}>
						<CompassIcon heading={directionHeading} size={SIZES.iconMd} />
						<DirectionDisplay direction={direction} showEmoji={false} />
					</View>
				</View>

				<View style={[styles.summaryBlock, styles.waitingBlock]}>
					<Text style={styles.label}>{t('spots.waitingTimeLabel')}</Text>
					<Text style={styles.waitingValue}>{waitingTimeLabel}</Text>
					<Text style={styles.waitingRecords}>{waitingRecordsLabel}</Text>
				</View>
			</View>

			<View style={styles.dataSection}>
				<Text style={styles.label}>{t('spots.mainRoadsLabel')}</Text>
				<Text style={styles.value}>{EMPTY_MAIN_ROAD}</Text>
			</View>

			<View style={styles.dataSection}>
				<Text style={styles.label}>{t('spots.destinations')}</Text>
				<Text style={styles.value}>{destinationsLabel}</Text>
			</View>
		</>
	);
};
