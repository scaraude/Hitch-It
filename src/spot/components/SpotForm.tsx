import type React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CommentEditor } from '../../comment/components';
import { bottomSheetStyles } from '../../components/ui';
import { COLORS } from '../../constants';
import { A11Y_LABELS } from '../../constants/accessibility';
import { DIRECTIONS } from '../constants';
import { useSpotForm } from '../hooks';
import { spotFormStyles as styles } from './spotFormStyles';
import type { SpotFormProps } from './spotFormTypes';
import { DestinationChip, DestinationInput } from './ui';

export const SpotForm: React.FC<SpotFormProps> = ({ onSubmit, onCancel }) => {
	const {
		appreciation,
		comment,
		roadName,
		direction,
		destinationInput,
		destinations,
		isFormValid,
		onAppreciationChange,
		onCommentChange,
		onRoadNameChange,
		onDirectionChange,
		onDestinationInputChange,
		onAddDestination,
		onRemoveDestination,
		onSubmitForm,
	} = useSpotForm({ onSubmit });

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
						onChangeText={onRoadNameChange}
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
								onPress={() => onDirectionChange(dir)}
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
						onChangeText={onDestinationInputChange}
						onAdd={onAddDestination}
					/>

					{destinations.length > 0 ? (
						<View style={styles.destinationList}>
							{destinations.map((dest, index) => (
								<DestinationChip
									key={dest}
									destination={dest}
									onRemove={() => onRemoveDestination(index)}
								/>
							))}
						</View>
					) : null}

					<View style={styles.commentSection}>
						<CommentEditor
							appreciation={appreciation}
							comment={comment}
							onAppreciationChange={onAppreciationChange}
							onCommentChange={onCommentChange}
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
						onPress={onSubmitForm}
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
