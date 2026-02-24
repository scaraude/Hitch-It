import { useRef, useState } from 'react';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressInput } from '../../components';
import { BottomSheetHeader, bottomSheetStyles } from '../../components/ui';
import { COLORS, SIZES, SPACING } from '../../constants';
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

const SHEET_TITLE = 'Comparer avec la direction du conducteur';
const SHEET_SUBTITLE =
	'Entrez la destination du conducteur pour afficher le trajet commun.';
const DESTINATION_PLACEHOLDER = 'Destination du conducteur';
const CANCEL_LABEL = 'Annuler';
const COMPARE_LABEL = 'Comparer';

export function DriverDirectionSheet({
	initialDestination,
	onCompare,
	onClose,
}: DriverDirectionSheetProps) {
	const insets = useSafeAreaInsets();
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
		<KeyboardAvoidingView
			style={styles.overlay}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			pointerEvents="box-none"
		>
			<View
				style={[
					bottomSheetStyles.container,
					styles.sheet,
					{ paddingBottom: insets.bottom + SPACING.md },
				]}
			>
				<BottomSheetHeader />

				<View style={styles.content}>
					<Text style={styles.title}>{SHEET_TITLE}</Text>
					<Text style={styles.subtitle}>{SHEET_SUBTITLE}</Text>

					<AddressInput
						placeholder={DESTINATION_PLACEHOLDER}
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
							accessibilityLabel="Fermer la comparaison conducteur"
							testID="driver-direction-cancel"
						>
							<Text style={styles.secondaryButtonText}>{CANCEL_LABEL}</Text>
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
							accessibilityLabel="Lancer la comparaison conducteur"
							testID="driver-direction-compare"
						>
							{isSubmitting ? (
								<ActivityIndicator color={COLORS.textLight} />
							) : (
								<Text style={styles.primaryButtonText}>{COMPARE_LABEL}</Text>
							)}
						</Pressable>
					</View>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1200,
	},
	sheet: {
		zIndex: 1200,
	},
	content: {
		paddingHorizontal: SPACING.md,
		paddingBottom: SPACING.sm,
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
