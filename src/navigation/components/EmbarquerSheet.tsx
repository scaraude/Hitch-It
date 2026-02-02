import { useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { AddressInput } from '../../components';
import { BottomSheetHeader, bottomSheetStyles } from '../../components/ui';
import { COLORS, SIZES, SPACING } from '../../constants';
import type { Location } from '../../types';

interface AddressData {
	location: Location;
	name: string;
}

interface EmbarquerSheetProps {
	initialStart?: AddressData;
	initialDestination?: AddressData;
	onStart: (start: AddressData, destination: AddressData) => void;
	onClose: () => void;
}

export function EmbarquerSheet({
	initialStart,
	initialDestination,
	onStart,
	onClose,
}: EmbarquerSheetProps) {
	const [startText, setStartText] = useState(initialStart?.name ?? '');
	const [startLocation, setStartLocation] = useState<Location | null>(
		initialStart?.location ?? null
	);
	const [destinationText, setDestinationText] = useState(
		initialDestination?.name ?? ''
	);
	const [destinationLocation, setDestinationLocation] =
		useState<Location | null>(initialDestination?.location ?? null);

	const canStart = startLocation !== null && destinationLocation !== null;

	const handleStartLocationSelected = (location: Location, name: string) => {
		setStartLocation(location);
		setStartText(name);
	};

	const handleDestinationSelected = (location: Location, name: string) => {
		setDestinationLocation(location);
		setDestinationText(name);
	};

	const handleStart = () => {
		if (!startLocation || !destinationLocation) return;
		onStart(
			{ location: startLocation, name: startText },
			{ location: destinationLocation, name: destinationText }
		);
	};

	return (
		<KeyboardAvoidingView
			style={[bottomSheetStyles.container, styles.container]}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<BottomSheetHeader
				style={styles.header}
				dragHandleStyle={styles.dragHandle}
			>
				<Pressable
					onPress={onClose}
					style={styles.closeButton}
					accessibilityLabel="Fermer"
					accessibilityRole="button"
					testID="embarquer-sheet-close"
				>
					<Text style={styles.closeButtonText}>✕</Text>
				</Pressable>
			</BottomSheetHeader>

			<ScrollView
				style={styles.content}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.title}>Planifier un trajet</Text>

				<View style={styles.form}>
					<View style={{ zIndex: 2 }}>
						<AddressInput
							label="Point de départ"
							placeholder="D'où partez-vous ?"
							value={startText}
							onChangeText={text => {
								setStartText(text);
								if (text !== startText) setStartLocation(null);
							}}
							onLocationSelected={handleStartLocationSelected}
							autoFocus={!initialStart}
							testID="embarquer-start-input"
						/>
					</View>

					<View style={{ zIndex: 1 }}>
						<AddressInput
							label="Destination"
							placeholder="Où allez-vous ?"
							value={destinationText}
							onChangeText={text => {
								setDestinationText(text);
								if (text !== destinationText) setDestinationLocation(null);
							}}
							onLocationSelected={handleDestinationSelected}
							autoFocus={!!initialStart && !initialDestination}
							testID="embarquer-destination-input"
						/>
					</View>
				</View>
			</ScrollView>

			<View style={styles.footer}>
				<Pressable
					style={({ pressed }) => [
						styles.startButton,
						!canStart && styles.startButtonDisabled,
						pressed && canStart && styles.startButtonPressed,
					]}
					onPress={handleStart}
					disabled={!canStart}
					testID="embarquer-start-button"
				>
					<Text
						style={[
							styles.startButtonText,
							!canStart && styles.startButtonTextDisabled,
						]}
					>
						🚗 Démarrer
					</Text>
				</Pressable>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		maxHeight: '70%',
		zIndex: 1000,
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
		right: SPACING.lg,
		top: SPACING.sm,
		width: SIZES.iconLg,
		height: SIZES.iconLg,
		borderRadius: SIZES.radiusLarge,
		backgroundColor: COLORS.surface,
		alignItems: 'center',
		justifyContent: 'center',
	},
	closeButtonText: {
		fontSize: SIZES.fontLg,
		color: COLORS.text,
		fontWeight: 'bold',
	},
	content: {
		paddingHorizontal: SPACING.lg,
	},
	title: {
		fontSize: SIZES.font2Xl,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: SPACING.lg,
	},
	form: {
		gap: SPACING.md,
	},
	footer: {
		paddingHorizontal: SPACING.lg,
		paddingVertical: SPACING.lg,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
	},
	startButton: {
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.lg,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
	},
	startButtonDisabled: {
		backgroundColor: COLORS.surface,
	},
	startButtonPressed: {
		opacity: 0.8,
	},
	startButtonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontLg,
		fontWeight: '700',
	},
	startButtonTextDisabled: {
		color: COLORS.textSecondary,
	},
});
