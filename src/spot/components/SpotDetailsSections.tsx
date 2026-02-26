import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { CompassIcon } from '../../components/ui';
import { COLORS, SIZES } from '../../constants';
import { A11Y_LABELS } from '../../constants/accessibility';
import { EMPTY_MAIN_ROAD } from './spotDetailsSheetHelpers';
import { spotDetailsSheetStyles as styles } from './spotDetailsSheetStyles';
import type {
	SpotDetailsHeaderSectionProps,
	SpotDetailsSummarySectionProps,
} from './spotDetailsTypes';

export const SpotDetailsHeaderSection: React.FC<
	SpotDetailsHeaderSectionProps
> = ({ spotTitle, streetViewIcon, onOpenStreetView, onOpenItinerary }) => {
	return (
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
					style={[styles.topActionButton, styles.primaryTopActionButton]}
					onPress={onOpenItinerary}
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
	);
};

export const SpotDetailsSummarySection: React.FC<
	SpotDetailsSummarySectionProps
> = ({
	directionHeading,
	directionLabel,
	waitingTimeLabel,
	waitingRecordsLabel,
	destinationsLabel,
}) => {
	return (
		<>
			<View style={styles.summaryRow}>
				<View style={styles.summaryBlock}>
					<Text style={styles.label}>Direction</Text>
					<View style={styles.directionRow}>
						<CompassIcon heading={directionHeading} size={SIZES.iconMd} />
						<Text style={styles.value}>{directionLabel}</Text>
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
		</>
	);
};
