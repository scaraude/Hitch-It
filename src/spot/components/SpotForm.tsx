import type React from 'react';
import { useCallback, useState } from 'react';
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { bottomSheetStyles } from '../../components/ui';
import { COLORS, SIZES, SPACING } from '../../constants';
import { A11Y_LABELS } from '../../constants/accessibility';
import { APPRECIATION_CONFIG, APPRECIATIONS, DIRECTIONS } from '../constants';
import type { Appreciation, Direction } from '../types';
import { DestinationChip, DestinationInput } from './ui';

interface SpotFormData {
	appreciation: Appreciation;
	roadName: string;
	direction: Direction;
	destinations: string[];
}

interface SpotFormProps {
	onSubmit: (data: SpotFormData) => void;
	onCancel: () => void;
}

export const SpotForm: React.FC<SpotFormProps> = ({ onSubmit, onCancel }) => {
	const [appreciation, setAppreciation] = useState<Appreciation | undefined>(
		undefined
	);
	const [roadName, setRoadName] = useState('');
	const [direction, setDirection] = useState<Direction | undefined>(undefined);
	const [destinationInput, setDestinationInput] = useState('');
	const [destinations, setDestinations] = useState<string[]>([]);

	const handleAddDestination = useCallback(() => {
		const trimmed = destinationInput.trim();
		if (!trimmed) return;
		setDestinations(previous => [...previous, trimmed]);
		setDestinationInput('');
	}, [destinationInput]);

	const handleRemoveDestination = useCallback((index: number) => {
		setDestinations(previous => previous.filter((_, i) => i !== index));
	}, []);

	const handleSubmit = useCallback(() => {
		if (
			!roadName.trim() ||
			!direction ||
			destinations.length === 0 ||
			appreciation === undefined
		) {
			return;
		}
		onSubmit({
			appreciation,
			roadName: roadName.trim(),
			direction,
			destinations,
		});
	}, [appreciation, destinations, direction, onSubmit, roadName]);

	return (
		<View
			style={[bottomSheetStyles.container, styles.container]}
			testID="spot-form"
		>
			<View style={styles.formContent}>
				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
				>
					<Text style={styles.title}>Nouveau Spot</Text>

					{/* Appreciation */}
					<Text style={styles.label}>Appréciation *</Text>
					<View style={styles.buttonGroup}>
						{APPRECIATIONS.map(app => (
							<Pressable
								key={app}
								style={[
									styles.optionButton,
									appreciation === app && styles.optionButtonSelected,
								]}
								onPress={() => setAppreciation(app)}
								accessibilityLabel={`${A11Y_LABELS[`appreciation${app.charAt(0).toUpperCase()}${app.slice(1)}` as keyof typeof A11Y_LABELS]}`}
								accessibilityRole="button"
								accessibilityState={{ selected: appreciation === app }}
							>
								<Text
									style={[
										styles.optionText,
										appreciation === app && styles.optionTextSelected,
									]}
								>
									{APPRECIATION_CONFIG[app].label}
								</Text>
							</Pressable>
						))}
					</View>

					{/* Road Name */}
					<Text style={styles.label}>Nom de la route *</Text>
					<TextInput
						style={styles.input}
						value={roadName}
						onChangeText={setRoadName}
						placeholder="Ex: A6, D907, Route de Lyon..."
						placeholderTextColor={COLORS.textSecondary}
						accessibilityLabel={A11Y_LABELS.roadNameInput}
						accessibilityHint={A11Y_LABELS.roadNamePlaceholder}
						testID="spot-form-road-name"
					/>

					{/* Direction */}
					<Text style={styles.label}>Direction *</Text>
					<View style={styles.directionGrid}>
						{DIRECTIONS.map(dir => (
							<Pressable
								key={dir}
								style={[
									styles.directionButton,
									direction === dir && styles.directionButtonSelected,
								]}
								onPress={() => setDirection(dir)}
								accessibilityLabel={`${A11Y_LABELS.direction} : ${dir}`}
								accessibilityRole="button"
								accessibilityState={{ selected: direction === dir }}
							>
								<Text
									style={[
										styles.directionText,
										direction === dir && styles.directionTextSelected,
									]}
								>
									{dir}
								</Text>
							</Pressable>
						))}
					</View>

					{/* Destinations */}
					<Text style={styles.label}>Destinations *</Text>
					<DestinationInput
						value={destinationInput}
						onChangeText={setDestinationInput}
						onAdd={handleAddDestination}
					/>

					{destinations.length > 0 ? (
						<View style={styles.destinationList}>
							{destinations.map((dest, index) => (
								<DestinationChip
									key={`${dest}-${index}`}
									destination={dest}
									onRemove={() => handleRemoveDestination(index)}
								/>
							))}
						</View>
					) : null}
				</ScrollView>

				{/* Action Buttons */}
				<View style={styles.actions}>
					<Pressable
						style={[styles.button, styles.cancelButton]}
						onPress={onCancel}
						accessibilityLabel={A11Y_LABELS.cancelAction}
						accessibilityHint={A11Y_LABELS.cancelSpotHint}
						accessibilityRole="button"
						testID="spot-form-cancel"
					>
						<Text style={styles.cancelButtonText}>Annuler</Text>
					</Pressable>
					<Pressable
						style={[
							styles.button,
							styles.submitButton,
							(!roadName.trim() || !direction || destinations.length === 0) &&
								styles.submitButtonDisabled,
						]}
						onPress={handleSubmit}
						disabled={
							!roadName.trim() || !direction || destinations.length === 0
						}
						accessibilityLabel={A11Y_LABELS.confirmSpot}
						accessibilityHint={A11Y_LABELS.confirmSpotHint}
						accessibilityRole="button"
						testID="spot-form-submit"
					>
						<Text style={styles.submitButtonText}>Créer le spot</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		maxHeight: '80%',
	},
	formContent: {
		padding: SPACING.lg,
	},
	scrollView: {
		maxHeight: 500,
	},
	title: {
		fontSize: SIZES.font2Xl,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: SPACING.lg,
	},
	label: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
		marginTop: SPACING.md,
		marginBottom: SPACING.sm,
	},
	input: {
		borderWidth: 1,
		borderColor: COLORS.surface,
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		padding: SPACING.md,
		fontSize: SIZES.fontMd,
		color: COLORS.text,
	},
	buttonGroup: {
		flexDirection: 'row',
		gap: SPACING.sm,
	},
	optionButton: {
		flex: 1,
		paddingVertical: SPACING.md,
		paddingHorizontal: SPACING.sm,
		borderRadius: SIZES.radiusMedium,
		borderWidth: 1,
		borderColor: COLORS.surface,
		backgroundColor: COLORS.surface,
		alignItems: 'center',
	},
	optionButtonSelected: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	optionText: {
		fontSize: SIZES.fontSm,
		color: COLORS.text,
		fontWeight: '600',
	},
	optionTextSelected: {
		color: COLORS.background,
	},
	directionGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING.sm,
	},
	directionButton: {
		width: '23%',
		paddingVertical: SPACING.sm,
		borderRadius: SIZES.radiusMedium,
		borderWidth: 1,
		borderColor: COLORS.surface,
		backgroundColor: COLORS.surface,
		alignItems: 'center',
	},
	directionButtonSelected: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	directionText: {
		fontSize: SIZES.fontXs,
		color: COLORS.text,
		fontWeight: '500',
	},
	directionTextSelected: {
		color: COLORS.background,
	},
	destinationList: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING.sm,
		marginTop: SPACING.sm,
	},
	actions: {
		flexDirection: 'row',
		gap: SPACING.md,
		marginTop: SPACING.lg,
	},
	button: {
		flex: 1,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
	},
	cancelButton: {
		backgroundColor: COLORS.surface,
	},
	cancelButtonText: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
	},
	submitButton: {
		backgroundColor: COLORS.primary,
	},
	submitButtonDisabled: {
		backgroundColor: COLORS.textSecondary,
	},
	submitButtonText: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.background,
	},
});
