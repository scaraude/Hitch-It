import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
	Animated,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressInput, MapControlButton } from '../../components';
import { COLORS, SIZES, SPACING } from '../../constants';
import type { Location } from '../../types';

interface AddressData {
	location: Location;
	name: string;
}

const FROM_MY_POSITION_LABEL = 'from my position';
const MY_POSITION_NAME = 'My position';
const GO_LABEL = 'go';
const SHEET_SLIDE_OFFSET = -36;
const SHEET_MAX_HEIGHT = '60%';
const SHEET_TOP_MARGIN = 6;
const GO_BUTTON_WIDTH = 64;
const GO_BUTTON_HEIGHT = 36;
const SWAP_LOCATIONS_ACCESSIBILITY_LABEL =
	'Echanger le point de depart et la destination';

interface EmbarquerSheetProps {
	initialStart?: AddressData;
	initialDestination?: AddressData;
	currentPosition?: Location | null;
	onStart: (start: AddressData, destination: AddressData) => void;
	onClose: () => void;
}

export function EmbarquerSheet({
	initialStart,
	initialDestination,
	currentPosition = null,
	onStart,
	onClose,
}: EmbarquerSheetProps) {
	const insets = useSafeAreaInsets();
	const shouldDefaultStartToCurrentPosition =
		!initialStart && currentPosition !== null;
	const [startText, setStartText] = useState(
		initialStart?.name ??
			(shouldDefaultStartToCurrentPosition ? MY_POSITION_NAME : '')
	);
	const [startLocation, setStartLocation] = useState<Location | null>(
		initialStart?.location ?? currentPosition
	);
	const [destinationText, setDestinationText] = useState(
		initialDestination?.name ?? ''
	);
	const [destinationLocation, setDestinationLocation] =
		useState<Location | null>(initialDestination?.location ?? null);
	const [isStartFromCurrentPosition, setIsStartFromCurrentPosition] = useState(
		shouldDefaultStartToCurrentPosition
	);
	const [
		isDestinationFromCurrentPosition,
		setIsDestinationFromCurrentPosition,
	] = useState(false);
	const startSelectionRef = useRef(false);
	const destinationSelectionRef = useRef(false);
	const slideValue = useRef(new Animated.Value(SHEET_SLIDE_OFFSET)).current;
	const opacityValue = useRef(new Animated.Value(0)).current;

	const canStart = startLocation !== null && destinationLocation !== null;
	const hasCurrentPosition = currentPosition !== null;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(slideValue, {
				toValue: 0,
				duration: 220,
				useNativeDriver: true,
			}),
			Animated.timing(opacityValue, {
				toValue: 1,
				duration: 220,
				useNativeDriver: true,
			}),
		]).start();
	}, [opacityValue, slideValue]);

	useEffect(() => {
		if (!currentPosition) return;
		if (startLocation !== null || startText.trim().length > 0) return;

		setIsStartFromCurrentPosition(true);
		setStartLocation(currentPosition);
		setStartText(MY_POSITION_NAME);
		Keyboard.dismiss();
	}, [currentPosition, startLocation, startText]);

	const handleStartLocationSelected = (location: Location, name: string) => {
		startSelectionRef.current = true;
		setStartLocation(location);
		setStartText(name);
	};

	const handleDestinationSelected = (location: Location, name: string) => {
		destinationSelectionRef.current = true;
		setDestinationLocation(location);
		setDestinationText(name);
	};

	const handleUseCurrentPositionForStart = () => {
		if (!currentPosition) return;

		setIsStartFromCurrentPosition(true);
		setStartLocation(currentPosition);
		setStartText(MY_POSITION_NAME);
		Keyboard.dismiss();
	};

	const handleUseCurrentPositionForDestination = () => {
		if (!currentPosition) return;

		setIsDestinationFromCurrentPosition(true);
		setDestinationLocation(currentPosition);
		setDestinationText(MY_POSITION_NAME);
		Keyboard.dismiss();
	};

	const handleStart = () => {
		if (!startLocation || !destinationLocation) return;
		onStart(
			{ location: startLocation, name: startText },
			{ location: destinationLocation, name: destinationText }
		);
	};

	const handleSwapLocations = () => {
		setStartText(destinationText);
		setStartLocation(destinationLocation);
		setDestinationText(startText);
		setDestinationLocation(startLocation);
		setIsStartFromCurrentPosition(isDestinationFromCurrentPosition);
		setIsDestinationFromCurrentPosition(isStartFromCurrentPosition);
		Keyboard.dismiss();
	};

	return (
		<KeyboardAvoidingView
			style={styles.overlay}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			pointerEvents="box-none"
		>
			<Animated.View
				style={[
					styles.sheet,
					{
						top: insets.top + SHEET_TOP_MARGIN,
						opacity: opacityValue,
						transform: [{ translateY: slideValue }],
					},
				]}
			>
				<Pressable
					onPress={onClose}
					style={styles.closeButton}
					accessibilityLabel="Fermer"
					accessibilityRole="button"
					testID="embarquer-sheet-close"
				>
					<Ionicons name="close" size={18} color={COLORS.text} />
				</Pressable>

				<View style={styles.form}>
					<View style={styles.field}>
						<View style={styles.startInputLayer}>
							<AddressInput
								label="Point de départ"
								placeholder="D'où partez-vous ?"
								value={startText}
								onChangeText={text => {
									setIsStartFromCurrentPosition(false);
									setStartText(text);

									if (startSelectionRef.current) {
										startSelectionRef.current = false;
										return;
									}

									setStartLocation(null);
								}}
								onLocationSelected={handleStartLocationSelected}
								autoFocus={startLocation === null}
								containerStyle={styles.addressInputContainer}
								inputContainerStyle={styles.addressInputField}
								disableSuggestions={isStartFromCurrentPosition}
								testID="embarquer-start-input"
							/>
						</View>

						<Pressable
							style={({ pressed }) => [
								styles.positionButton,
								!hasCurrentPosition && styles.positionButtonDisabled,
								pressed && hasCurrentPosition && styles.positionButtonPressed,
							]}
							onPress={handleUseCurrentPositionForStart}
							disabled={!hasCurrentPosition}
							accessibilityRole="button"
							accessibilityLabel="Utiliser ma position pour le départ"
							testID="embarquer-start-from-position"
						>
							<Ionicons
								name="locate"
								size={14}
								color={
									hasCurrentPosition ? COLORS.primary : COLORS.textSecondary
								}
							/>
							<Text
								style={[
									styles.positionButtonText,
									!hasCurrentPosition && styles.positionButtonTextDisabled,
								]}
							>
								{FROM_MY_POSITION_LABEL}
							</Text>
						</Pressable>
					</View>

					<View style={styles.swapButtonContainer}>
						<MapControlButton
							icon={
								<Ionicons
									name="swap-vertical"
									size={SIZES.iconSm}
									color={COLORS.text}
								/>
							}
							onPress={handleSwapLocations}
							accessibilityLabel={SWAP_LOCATIONS_ACCESSIBILITY_LABEL}
							size="small"
							testID="embarquer-swap-locations"
						/>
					</View>

					<View style={styles.field}>
						<View style={styles.destinationInputLayer}>
							<AddressInput
								label="Destination"
								placeholder="Où allez-vous ?"
								value={destinationText}
								onChangeText={text => {
									setIsDestinationFromCurrentPosition(false);
									setDestinationText(text);

									if (destinationSelectionRef.current) {
										destinationSelectionRef.current = false;
										return;
									}

									setDestinationLocation(null);
								}}
								onLocationSelected={handleDestinationSelected}
								autoFocus={
									startLocation !== null &&
									destinationLocation === null &&
									destinationText.trim().length === 0
								}
								containerStyle={styles.addressInputContainer}
								inputContainerStyle={styles.addressInputField}
								disableSuggestions={isDestinationFromCurrentPosition}
								testID="embarquer-destination-input"
							/>
						</View>

						<Pressable
							style={({ pressed }) => [
								styles.positionButton,
								!hasCurrentPosition && styles.positionButtonDisabled,
								pressed && hasCurrentPosition && styles.positionButtonPressed,
							]}
							onPress={handleUseCurrentPositionForDestination}
							disabled={!hasCurrentPosition}
							accessibilityRole="button"
							accessibilityLabel="Utiliser ma position pour la destination"
							testID="embarquer-destination-from-position"
						>
							<Ionicons
								name="locate"
								size={14}
								color={
									hasCurrentPosition ? COLORS.primary : COLORS.textSecondary
								}
							/>
							<Text
								style={[
									styles.positionButtonText,
									!hasCurrentPosition && styles.positionButtonTextDisabled,
								]}
							>
								{FROM_MY_POSITION_LABEL}
							</Text>
						</Pressable>
					</View>
				</View>

				<Pressable
					style={({ pressed }) => [
						styles.goButton,
						!canStart && styles.goButtonDisabled,
						pressed && canStart && styles.goButtonPressed,
					]}
					onPress={handleStart}
					disabled={!canStart}
					testID="embarquer-start-button"
				>
					<Text
						style={[
							styles.goButtonText,
							!canStart && styles.goButtonTextDisabled,
						]}
					>
						{GO_LABEL}
					</Text>
				</Pressable>
			</Animated.View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1100,
	},
	sheet: {
		position: 'absolute',
		left: 0,
		right: 0,
		maxHeight: SHEET_MAX_HEIGHT,
		backgroundColor: COLORS.background,
		borderBottomLeftRadius: SIZES.radiusXLarge,
		borderBottomRightRadius: SIZES.radiusXLarge,
		borderWidth: 1,
		borderColor: COLORS.border,
		paddingHorizontal: SPACING.md,
		paddingTop: SPACING.md,
		paddingBottom: SPACING.lg,
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 6,
	},
	closeButton: {
		alignSelf: 'flex-end',
		width: SIZES.iconMd + SPACING.xs,
		height: SIZES.iconMd + SPACING.xs,
		borderRadius: SIZES.radiusRound,
		backgroundColor: COLORS.surface,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: SPACING.sm,
	},
	form: {
		gap: SPACING.sm,
	},
	field: {
		gap: SPACING.xs,
	},
	swapButtonContainer: {
		alignItems: 'center',
	},
	startInputLayer: {
		zIndex: 2,
	},
	destinationInputLayer: {
		zIndex: 1,
	},
	addressInputContainer: {
		marginBottom: 0,
	},
	addressInputField: {
		paddingVertical: SPACING.xs,
	},
	positionButton: {
		alignSelf: 'flex-end',
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING.xs,
		paddingHorizontal: SPACING.sm,
		paddingVertical: SPACING.xs,
		borderRadius: SIZES.radiusMedium,
		backgroundColor: COLORS.surface,
	},
	positionButtonPressed: {
		opacity: 0.75,
	},
	positionButtonDisabled: {
		opacity: 0.55,
	},
	positionButtonText: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.primary,
	},
	positionButtonTextDisabled: {
		color: COLORS.textSecondary,
	},
	goButton: {
		alignSelf: 'flex-end',
		width: GO_BUTTON_WIDTH,
		height: GO_BUTTON_HEIGHT,
		borderRadius: SIZES.radiusRound,
		marginTop: SPACING.md,
		backgroundColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 3,
	},
	goButtonPressed: {
		opacity: 0.85,
	},
	goButtonDisabled: {
		backgroundColor: COLORS.surface,
	},
	goButtonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '700',
		textTransform: 'lowercase',
	},
	goButtonTextDisabled: {
		color: COLORS.textSecondary,
	},
});
