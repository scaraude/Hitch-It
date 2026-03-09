import type React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CommentEditor } from '../../comment/components';
import { bottomSheetStyles } from '../../components/ui';
import { COLORS } from '../../constants';
import { A11Y_LABELS } from '../../constants/accessibility';
import { useTranslation } from '../../i18n';
import { DIRECTIONS } from '../constants';
import { useSpotForm } from '../hooks';
import { Direction } from '../types';
import { spotFormStyles as styles } from './spotFormStyles';
import type { SpotFormProps } from './spotFormTypes';
import { DestinationChip, DestinationInput } from './ui';

const DIRECTION_TRANSLATION_KEY: Record<Direction, string> = {
	[Direction.North]: 'spots.directionNorth',
	[Direction.NorthEast]: 'spots.directionNorthEast',
	[Direction.East]: 'spots.directionEast',
	[Direction.SouthEast]: 'spots.directionSouthEast',
	[Direction.South]: 'spots.directionSouth',
	[Direction.SouthWest]: 'spots.directionSouthWest',
	[Direction.West]: 'spots.directionWest',
	[Direction.NorthWest]: 'spots.directionNorthWest',
};

export const SpotForm: React.FC<SpotFormProps> = ({ onSubmit, onCancel }) => {
	const { t } = useTranslation();
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
					<Text style={styles.title}>{t('spots.newSpot')}</Text>

					{/* Road Name */}
					<Text style={styles.label}>{t('spots.roadNameLabel')}</Text>
					<TextInput
						style={styles.input}
						value={roadName}
						onChangeText={onRoadNameChange}
						placeholder={t('spots.roadNamePlaceholder')}
						placeholderTextColor={COLORS.textSecondary}
						accessibilityLabel={A11Y_LABELS.roadNameInput}
						accessibilityHint={A11Y_LABELS.roadNamePlaceholder}
						testID="spot-form-road-name"
					/>

					{/* Direction */}
					<Text style={styles.label}>{t('spots.directionLabel')}</Text>
					<View style={styles.directionGrid}>
						{DIRECTIONS.map(dir => {
							const directionLabel = t(DIRECTION_TRANSLATION_KEY[dir]);

							return (
								<Pressable
									key={dir}
									style={[
										styles.directionButton,
										direction === dir && styles.directionButtonSelected,
									]}
									onPress={() => onDirectionChange(dir)}
									accessibilityLabel={`${A11Y_LABELS.direction} : ${directionLabel}`}
									accessibilityRole="button"
									accessibilityState={{ selected: direction === dir }}
								>
									<Text
										style={[
											styles.directionText,
											direction === dir && styles.directionTextSelected,
										]}
									>
										{directionLabel}
									</Text>
								</Pressable>
							);
						})}
					</View>

					{/* Destinations */}
					<Text style={styles.label}>{t('spots.destinationsLabel')}</Text>
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
						<Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
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
						<Text style={styles.submitButtonText}>{t('spots.createSpot')}</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
};
