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
import { CommentEditor } from '../../comment/components';
import type { CommentAppreciation } from '../../comment/types';
import { bottomSheetStyles } from '../../components/ui';
import { COLORS, SIZES, SPACING } from '../../constants';
import { A11Y_LABELS } from '../../constants/accessibility';
import { DIRECTIONS } from '../constants';
import type { Direction } from '../types';
import { DestinationChip, DestinationInput } from './ui';

interface SpotFormData {
	appreciation: CommentAppreciation;
	comment: string;
	roadName: string;
	direction: Direction;
	destinations: string[];
}

interface SpotFormProps {
	onSubmit: (data: SpotFormData) => void;
	onCancel: () => void;
}

export const SpotForm: React.FC<SpotFormProps> = ({ onSubmit, onCancel }) => {
	const [appreciation, setAppreciation] = useState<
		CommentAppreciation | undefined
	>(undefined);
	const [comment, setComment] = useState('');
	const [roadName, setRoadName] = useState('');
	const [direction, setDirection] = useState<Direction | undefined>(undefined);
	const [destinationInput, setDestinationInput] = useState('');
	const [destinations, setDestinations] = useState<string[]>([]);
	const isFormValid =
		roadName.trim().length > 0 &&
		!!direction &&
		destinations.length > 0 &&
		appreciation !== undefined &&
		comment.trim().length > 0;

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
		if (!isFormValid || !direction || appreciation === undefined) {
			return;
		}
		onSubmit({
			appreciation,
			comment: comment.trim(),
			roadName: roadName.trim(),
			direction,
			destinations,
		});
	}, [
		appreciation,
		comment,
		destinations,
		direction,
		isFormValid,
		onSubmit,
		roadName,
	]);

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
									key={dest}
									destination={dest}
									onRemove={() => handleRemoveDestination(index)}
								/>
							))}
						</View>
					) : null}

					<View style={styles.commentSection}>
						<CommentEditor
							appreciation={appreciation}
							comment={comment}
							onAppreciationChange={setAppreciation}
							onCommentChange={setComment}
						/>
					</View>
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
							!isFormValid && styles.submitButtonDisabled,
						]}
						onPress={handleSubmit}
						disabled={!isFormValid}
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
	commentSection: {
		marginTop: SPACING.lg,
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
