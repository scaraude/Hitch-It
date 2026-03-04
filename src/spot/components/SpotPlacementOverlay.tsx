import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import type React from 'react';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING } from '../../constants';
import { useTranslation } from '../../i18n';

interface SpotPlacementOverlayProps {
	onConfirm: () => void;
	onCancel: () => void;
}

const SNAP_POINTS: Array<string | number> = ['25%'];

export const SpotPlacementOverlay: React.FC<SpotPlacementOverlayProps> = ({
	onConfirm,
	onCancel,
}) => {
	const { t } = useTranslation();
	const insets = useSafeAreaInsets();
	const bottomSheetRef = useRef<BottomSheet>(null);

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={0}
			snapPoints={SNAP_POINTS}
			enablePanDownToClose
			onClose={onCancel}
			backgroundStyle={styles.sheetBackground}
			handleStyle={styles.handle}
			handleIndicatorStyle={styles.handleIndicator}
		>
			<BottomSheetView
				style={[
					styles.content,
					{ paddingBottom: Math.max(insets.bottom, SPACING.md) },
				]}
			>
				<Text style={styles.title}>{t('spots.addASpot')}</Text>
				<View style={styles.actionsContainer}>
					<Pressable
						style={({ pressed }) => [
							styles.actionButton,
							styles.cancelButton,
							pressed && styles.actionButtonPressed,
						]}
						onPress={onCancel}
						accessibilityLabel={t('common.cancel')}
						accessibilityRole="button"
					>
						<Ionicons name="close" size={32} color={COLORS.background} />
					</Pressable>
					<Pressable
						style={({ pressed }) => [
							styles.actionButton,
							styles.confirmButton,
							pressed && styles.actionButtonPressed,
						]}
						onPress={onConfirm}
						accessibilityLabel={t('common.confirm')}
						accessibilityRole="button"
					>
						<Ionicons name="checkmark" size={32} color={COLORS.background} />
					</Pressable>
				</View>
			</BottomSheetView>
		</BottomSheet>
	);
};

const styles = StyleSheet.create({
	sheetBackground: {
		backgroundColor: COLORS.background,
		borderTopLeftRadius: SIZES.radiusXLarge,
		borderTopRightRadius: SIZES.radiusXLarge,
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 8,
	},
	handle: {
		backgroundColor: 'transparent',
		paddingVertical: SPACING.sm,
	},
	handleIndicator: {
		backgroundColor: COLORS.surface,
		width: 40,
		height: 4,
	},
	content: {
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.sm,
	},
	title: {
		fontSize: SIZES.fontLg,
		fontWeight: '600',
		color: COLORS.text,
		textAlign: 'center',
		marginBottom: SPACING.lg,
	},
	actionsContainer: {
		flexDirection: 'row',
		gap: SPACING.md,
	},
	actionButton: {
		flex: 1,
		height: 60,
		borderRadius: SIZES.radiusXLarge,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: COLORS.text,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 6,
	},
	actionButtonPressed: {
		opacity: 0.85,
		transform: [{ scale: 0.95 }],
	},
	cancelButton: {
		backgroundColor: COLORS.error,
	},
	confirmButton: {
		backgroundColor: COLORS.success,
	},
});
