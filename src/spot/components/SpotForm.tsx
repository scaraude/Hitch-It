import BottomSheet, {
	BottomSheetFooter,
	type BottomSheetFooterProps,
	BottomSheetScrollView,
	type BottomSheetScrollViewMethods,
	BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import type React from 'react';
import { useCallback, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommentEditor } from '../../comment/components';
import { sheetStyles } from '../../components/ui';
import { COLORS, SPACING } from '../../constants';
import { A11Y_LABELS } from '../../constants/accessibility';
import { useTranslation } from '../../i18n';
import { DIRECTION_TRANSLATION_KEY, DIRECTIONS } from '../constants';
import { useSpotForm } from '../hooks';
import { spotFormStyles as styles } from './spotFormStyles';
import type { SpotFormProps } from './spotFormTypes';
import { DestinationChip, DestinationInput, DirectionDisplay } from './ui';

const SNAP_POINTS: string[] = ['90%', '100%'];
const FOOTER_HEIGHT = 88;

export const SpotForm: React.FC<SpotFormProps> = ({ onSubmit, onCancel }) => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const scrollViewRef = useRef<BottomSheetScrollViewMethods>(null);
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

	const renderFooter = useCallback(
		(props: BottomSheetFooterProps) => (
			<BottomSheetFooter {...props} bottomInset={insets.bottom}>
				<View style={styles.footer}>
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
			</BottomSheetFooter>
		),
		[insets.bottom, isFormValid, onCancel, onSubmitForm, t]
	);

	const handleCommentFocus = useCallback(() => {
		scrollViewRef.current?.scrollToEnd({ animated: true });
	}, []);

	return (
		<BottomSheet
			index={0}
			snapPoints={SNAP_POINTS}
			enableDynamicSizing={false}
			enablePanDownToClose
			onClose={onCancel}
			keyboardBehavior="extend"
			keyboardBlurBehavior="restore"
			android_keyboardInputMode="adjustResize"
			style={sheetStyles.container}
			backgroundStyle={sheetStyles.background}
			handleIndicatorStyle={sheetStyles.defaultHandleIndicator}
			footerComponent={renderFooter}
		>
			<BottomSheetScrollView
				ref={scrollViewRef}
				style={styles.scrollView}
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: FOOTER_HEIGHT + insets.bottom + SPACING.md },
				]}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				automaticallyAdjustKeyboardInsets
				testID="spot-form"
			>
				<Text style={styles.title}>{t('spots.newSpot')}</Text>
				<Text style={styles.helperText}>{t('spots.requiredFieldsHint')}</Text>

				<Text style={styles.label}>{t('spots.roadNameLabel')}</Text>
				<BottomSheetTextInput
					style={styles.input}
					value={roadName}
					onChangeText={onRoadNameChange}
					placeholder={t('spots.roadNamePlaceholder')}
					placeholderTextColor={COLORS.textSecondary}
					accessibilityLabel={A11Y_LABELS.roadNameInput}
					accessibilityHint={A11Y_LABELS.roadNamePlaceholder}
					testID="spot-form-road-name"
				/>

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
								<DirectionDisplay
									direction={dir}
									variant="compact"
									labelColor={
										direction === dir ? COLORS.background : COLORS.text
									}
								/>
							</Pressable>
						);
					})}
				</View>

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
						onCommentFocus={handleCommentFocus}
					/>
				</View>
			</BottomSheetScrollView>
		</BottomSheet>
	);
};
