import type React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';
import { A11Y_LABELS } from '../../constants/accessibility';
import { useTranslation } from '../../i18n';
import {
	COMMENT_APPRECIATIONS,
	getCommentAppreciationConfig,
} from '../constants';
import type { CommentAppreciation } from '../types';

interface CommentEditorProps {
	appreciation: CommentAppreciation | undefined;
	comment: string;
	onAppreciationChange: (value: CommentAppreciation) => void;
	onCommentChange: (value: string) => void;
}

export const CommentEditor: React.FC<CommentEditorProps> = ({
	appreciation,
	comment,
	onAppreciationChange,
	onCommentChange,
}) => {
	const { t } = useTranslation();
	const appreciationConfig = getCommentAppreciationConfig(t);
	return (
		<View style={styles.container}>
			<Text style={styles.label}>{t('spots.ratingLabel')}</Text>
			<View style={styles.appreciationButtons}>
				{COMMENT_APPRECIATIONS.map(value => (
					<Pressable
						key={value}
						style={[
							styles.appreciationButton,
							appreciation === value && styles.appreciationButtonSelected,
						]}
						onPress={() => onAppreciationChange(value)}
						accessibilityLabel={
							A11Y_LABELS[
								`appreciation${value.charAt(0).toUpperCase()}${value.slice(1)}` as keyof typeof A11Y_LABELS
							]
						}
						accessibilityRole="button"
						accessibilityState={{ selected: appreciation === value }}
					>
						<Text
							style={[
								styles.appreciationButtonText,
								appreciation === value && styles.appreciationButtonTextSelected,
							]}
						>
							{appreciationConfig[value].emoji}{' '}
							{appreciationConfig[value].label}
						</Text>
					</Pressable>
				))}
			</View>

			<Text style={styles.label}>{t('spots.commentLabel')}</Text>
			<TextInput
				style={styles.input}
				value={comment}
				onChangeText={onCommentChange}
				placeholder={t('spots.commentPlaceholder')}
				placeholderTextColor={COLORS.textSecondary}
				multiline
				numberOfLines={4}
				textAlignVertical="top"
				accessibilityLabel={A11Y_LABELS.commentInput}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: SPACING.sm,
	},
	label: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
	},
	appreciationButtons: {
		flexDirection: 'row',
		gap: SPACING.sm,
	},
	appreciationButton: {
		flex: 1,
		borderWidth: 1,
		borderColor: COLORS.surface,
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		paddingVertical: SPACING.md,
		paddingHorizontal: SPACING.sm,
		alignItems: 'center',
	},
	appreciationButtonSelected: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	appreciationButtonText: {
		fontSize: SIZES.fontSm,
		fontWeight: '600',
		color: COLORS.text,
	},
	appreciationButtonTextSelected: {
		color: COLORS.background,
	},
	input: {
		minHeight: 100,
		borderWidth: 1,
		borderColor: COLORS.surface,
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		padding: SPACING.md,
		fontSize: SIZES.fontMd,
		color: COLORS.text,
	},
});
