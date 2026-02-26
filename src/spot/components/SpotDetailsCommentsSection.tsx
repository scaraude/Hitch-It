import type React from 'react';
import { Pressable, Text, View } from 'react-native';
import { CommentEditor, CommentList } from '../../comment/components';
import { A11Y_LABELS } from '../../constants/accessibility';
import { spotDetailsSheetStyles as styles } from './spotDetailsSheetStyles';
import type { SpotDetailsCommentsSectionProps } from './spotDetailsTypes';

export const SpotDetailsCommentsSection: React.FC<
	SpotDetailsCommentsSectionProps
> = ({ isLoading, comments, composer }) => {
	const {
		isWritingComment,
		draftAppreciation,
		draftComment,
		isSubmitting,
		onStartComment,
		onCancelComment,
		onSubmitComment,
		onAppreciationChange,
		onCommentChange,
	} = composer;

	return (
		<View style={styles.commentsSection}>
			<Text style={styles.label}>Comments</Text>

			{isLoading ? (
				<Text style={styles.loadingComments}>
					Chargement des commentaires...
				</Text>
			) : (
				<CommentList comments={comments} />
			)}

			{isWritingComment ? (
				<View style={styles.commentComposer}>
					<CommentEditor
						appreciation={draftAppreciation}
						comment={draftComment}
						onAppreciationChange={onAppreciationChange}
						onCommentChange={onCommentChange}
					/>
					<View style={styles.commentComposerActions}>
						<Pressable
							style={[styles.commentComposerButton, styles.cancelCommentButton]}
							onPress={onCancelComment}
							disabled={isSubmitting}
							accessibilityLabel={A11Y_LABELS.cancelAction}
							accessibilityRole="button"
						>
							<Text style={styles.cancelCommentText}>Annuler</Text>
						</Pressable>
						<Pressable
							style={[styles.commentComposerButton, styles.submitCommentButton]}
							onPress={onSubmitComment}
							disabled={isSubmitting}
							accessibilityLabel={A11Y_LABELS.submitComment}
							accessibilityRole="button"
						>
							<Text style={styles.submitCommentText}>
								{isSubmitting ? 'Envoi...' : 'Publier'}
							</Text>
						</Pressable>
					</View>
				</View>
			) : (
				<Pressable
					style={styles.addCommentButton}
					onPress={onStartComment}
					accessibilityLabel={A11Y_LABELS.addComment}
					accessibilityRole="button"
				>
					<Text style={styles.addCommentButtonText}>
						+ Ajouter un commentaire
					</Text>
				</Pressable>
			)}
		</View>
	);
};
