import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import {
	Animated,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapControlButton } from '../../components';
import { COLORS, SIZES } from '../../constants';
import { useEmbarquerSheetState } from '../hooks';
import { EmbarquerAddressField } from './EmbarquerAddressField';
import { embarquerSheetStyles as styles } from './embarquerSheetStyles';
import type { EmbarquerSheetProps } from './embarquerSheetTypes';

const GO_LABEL = 'go';
const SHEET_TOP_MARGIN = 6;
const SWAP_LOCATIONS_ACCESSIBILITY_LABEL =
	'Echanger le point de depart et la destination';

export const EmbarquerSheet: React.FC<EmbarquerSheetProps> = ({
	initialStart,
	initialDestination,
	currentPosition = null,
	onStart,
	onClose,
}) => {
	const insets = useSafeAreaInsets();
	const {
		startText,
		startLocation,
		destinationText,
		destinationLocation,
		isStartFromCurrentPosition,
		isDestinationFromCurrentPosition,
		canStart,
		hasCurrentPosition,
		slideValue,
		opacityValue,
		onStartTextChange,
		onDestinationTextChange,
		onStartLocationSelected,
		onDestinationSelected,
		onUseCurrentPositionForStart,
		onUseCurrentPositionForDestination,
		onSwapLocations,
		onStartNavigation,
	} = useEmbarquerSheetState({
		initialStart,
		initialDestination,
		currentPosition,
		onStart,
	});
	const shouldFocusDestinationInput =
		startLocation !== null &&
		destinationLocation === null &&
		destinationText.trim().length === 0;

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
					<EmbarquerAddressField
						label="Point de départ"
						placeholder="D'où partez-vous ?"
						value={startText}
						onChangeText={onStartTextChange}
						onLocationSelected={onStartLocationSelected}
						autoFocus={startLocation === null}
						disableSuggestions={isStartFromCurrentPosition}
						hasCurrentPosition={hasCurrentPosition}
						onUseCurrentPosition={onUseCurrentPositionForStart}
						positionButtonAccessibilityLabel="Utiliser ma position pour le départ"
						inputTestID="embarquer-start-input"
						positionButtonTestID="embarquer-start-from-position"
						inputLayerStyle={styles.startInputLayer}
					/>

					<View style={styles.swapButtonContainer}>
						<MapControlButton
							icon={
								<Ionicons
									name="swap-vertical"
									size={SIZES.iconSm}
									color={COLORS.text}
								/>
							}
							onPress={onSwapLocations}
							accessibilityLabel={SWAP_LOCATIONS_ACCESSIBILITY_LABEL}
							size="small"
							testID="embarquer-swap-locations"
						/>
					</View>

					<EmbarquerAddressField
						label="Destination"
						placeholder="Où allez-vous ?"
						value={destinationText}
						onChangeText={onDestinationTextChange}
						onLocationSelected={onDestinationSelected}
						autoFocus={shouldFocusDestinationInput}
						disableSuggestions={isDestinationFromCurrentPosition}
						hasCurrentPosition={hasCurrentPosition}
						onUseCurrentPosition={onUseCurrentPositionForDestination}
						positionButtonAccessibilityLabel="Utiliser ma position pour la destination"
						inputTestID="embarquer-destination-input"
						positionButtonTestID="embarquer-destination-from-position"
						inputLayerStyle={styles.destinationInputLayer}
					/>
				</View>

				<Pressable
					style={({ pressed }) => [
						styles.goButton,
						!canStart && styles.goButtonDisabled,
						pressed && canStart && styles.goButtonPressed,
					]}
					onPress={onStartNavigation}
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
};
