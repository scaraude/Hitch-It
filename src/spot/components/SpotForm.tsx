import type React from 'react';
import { useState } from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';
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

	const handleAddDestination = () => {
		if (destinationInput.trim()) {
			setDestinations([...destinations, destinationInput.trim()]);
			setDestinationInput('');
		}
	};

	const handleRemoveDestination = (index: number) => {
		setDestinations(destinations.filter((_, i) => i !== index));
	};

	const handleSubmit = () => {
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
	};

	return (
		<View style={styles.container}>
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
							<TouchableOpacity
								key={app}
								style={[
									styles.optionButton,
									appreciation === app && styles.optionButtonSelected,
								]}
								onPress={() => setAppreciation(app)}
							>
								<Text
									style={[
										styles.optionText,
										appreciation === app && styles.optionTextSelected,
									]}
								>
									{APPRECIATION_CONFIG[app].label}
								</Text>
							</TouchableOpacity>
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
					/>

					{/* Direction */}
					<Text style={styles.label}>Direction *</Text>
					<View style={styles.directionGrid}>
						{DIRECTIONS.map(dir => (
							<TouchableOpacity
								key={dir}
								style={[
									styles.directionButton,
									direction === dir && styles.directionButtonSelected,
								]}
								onPress={() => setDirection(dir)}
							>
								<Text
									style={[
										styles.directionText,
										direction === dir && styles.directionTextSelected,
									]}
								>
									{dir}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					{/* Destinations */}
					<Text style={styles.label}>Destinations *</Text>
					<DestinationInput
						value={destinationInput}
						onChangeText={setDestinationInput}
						onAdd={handleAddDestination}
					/>

					{destinations.length > 0 && (
						<View style={styles.destinationList}>
							{destinations.map(dest => (
								<DestinationChip
									key={dest}
									destination={dest}
									onRemove={() =>
										handleRemoveDestination(destinations.indexOf(dest))
									}
								/>
							))}
						</View>
					)}
				</ScrollView>

				{/* Action Buttons */}
				<View style={styles.actions}>
					<TouchableOpacity
						style={[styles.button, styles.cancelButton]}
						onPress={onCancel}
					>
						<Text style={styles.cancelButtonText}>Annuler</Text>
					</TouchableOpacity>
					<TouchableOpacity
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
					>
						<Text style={styles.submitButtonText}>Créer le spot</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: COLORS.background,
		borderTopLeftRadius: SIZES.radiusXLarge,
		borderTopRightRadius: SIZES.radiusXLarge,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: SIZES.shadowOpacity,
		shadowRadius: SIZES.shadowRadius,
		elevation: 5,
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
