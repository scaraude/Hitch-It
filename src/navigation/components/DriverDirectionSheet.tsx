import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressInput } from '../../components';
import { sheetStyles } from '../../components/ui';
import { COLORS, SIZES, SPACING } from '../../constants';
import { useTranslation } from '../../i18n';
import type { Location } from '../../types';

interface AddressData {
	location: Location;
	name: string;
}

interface DriverDirectionSheetProps {
	initialDestination?: AddressData;
	onCompare: (destination: AddressData) => Promise<void>;
	onClose: () => void;
}

const SNAP_POINTS: string[] = ['55%', '90%'];

export function DriverDirectionSheet({
	initialDestination,
	onCompare,
	onClose,
}: DriverDirectionSheetProps) {
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();
	const [destinationText, setDestinationText] = useState(
		initialDestination?.name ?? ''
	);
	const [destinationLocation, setDestinationLocation] =
		useState<Location | null>(initialDestination?.location ?? null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const destinationSelectionRef = useRef(false);

	const canCompare = destinationLocation !== null && !isSubmitting;

	const handleDestinationSelected = (location: Location, name: string) => {
		destinationSelectionRef.current = true;
		setDestinationLocation(location);
		setDestinationText(name);
	};

	const handleCompare = async () => {
		if (!destinationLocation || isSubmitting) {
			return;
		}

		setIsSubmitting(true);
		try {
			await onCompare({
				location: destinationLocation,
				name: destinationText,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<BottomSheet
			index={0}
			snapPoints={SNAP_POINTS}
			enableDynamicSizing={false}
			enablePanDownToClose
			onClose={onClose}
			keyboardBehavior="extend"
			keyboardBlurBehavior="restore"
			android_keyboardInputMode="adjustResize"
			style={sheetStyles.container}
			backgroundStyle={sheetStyles.background}
			handleIndicatorStyle={sheetStyles.defaultHandleIndicator}
		>
			<BottomSheetView
				style={[styles.content, { paddingBottom: insets.bottom + SPACING.md }]}
			>
				<Text style={styles.title}>
					{t('navigation.compareDriverDirectionTitle')}
				</Text>
				<Text style={styles.subtitle}>
					{t('navigation.compareDriverDirectionSubtitle')}
				</Text>

				<AddressInput
					placeholder={t('navigation.driverDestinationPlaceholder')}
					value={destinationText}
					onChangeText={text => {
						setDestinationText(text);
						if (destinationSelectionRef.current) {
							destinationSelectionRef.current = false;
							return;
						}
						setDestinationLocation(null);
					}}
					onLocationSelected={handleDestinationSelected}
					autoFocus
					showEmptyState
					hapticFeedback
					suggestionsStyle="inline"
					containerStyle={styles.addressInputContainer}
					inputContainerStyle={styles.addressInput}
					testID="driver-direction-input"
				/>

				<View style={styles.actions}>
					<Pressable
						style={({ pressed }) => [
							styles.secondaryButton,
							pressed && styles.buttonPressed,
						]}
						onPress={onClose}
						accessibilityRole="button"
						accessibilityLabel={t('navigation.closeDriverComparison')}
						testID="driver-direction-cancel"
					>
						<Text style={styles.secondaryButtonText}>{t('common.cancel')}</Text>
					</Pressable>

					<Pressable
						style={({ pressed }) => [
							styles.primaryButton,
							!canCompare && styles.primaryButtonDisabled,
							pressed && canCompare && styles.buttonPressed,
						]}
						onPress={() => {
							void handleCompare();
						}}
						disabled={!canCompare}
						accessibilityRole="button"
						accessibilityLabel={t('navigation.compareDriver')}
						testID="driver-direction-compare"
					>
						{isSubmitting ? (
							<ActivityIndicator color={COLORS.textLight} />
						) : (
							<Text style={styles.primaryButtonText}>
								{t('navigation.compare')}
							</Text>
						)}
					</Pressable>
				</View>
			</BottomSheetView>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: SPACING.md,
		paddingTop: SPACING.sm,
	},
	title: {
		fontSize: SIZES.fontLg,
		fontWeight: '700',
		color: COLORS.text,
		marginBottom: SPACING.xs,
	},
	subtitle: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		marginBottom: SPACING.md,
	},
	addressInputContainer: {
		marginBottom: SPACING.md,
	},
	addressInput: {
		backgroundColor: COLORS.surface,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	actions: {
		flexDirection: 'row',
		gap: SPACING.sm,
	},
	primaryButton: {
		flex: 1,
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.sm + SPACING.xs,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
		justifyContent: 'center',
	},
	primaryButtonDisabled: {
		backgroundColor: COLORS.surface,
	},
	secondaryButton: {
		flex: 1,
		backgroundColor: COLORS.surface,
		paddingVertical: SPACING.sm + SPACING.xs,
		borderRadius: SIZES.radiusMedium,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonPressed: {
		opacity: 0.8,
	},
	primaryButtonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
	secondaryButtonText: {
		color: COLORS.text,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});
