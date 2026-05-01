import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetStyles } from '../../components/ui';
import { COLORS, SIZES, SPACING } from '../../constants';
import { useTranslation } from '../../i18n';

interface ArrivalPromptSheetProps {
	destinationName: string;
	onFinish: () => void;
	onContinue: () => void;
}

const SNAP_POINTS: string[] = ['40%'];

export function ArrivalPromptSheet({
	destinationName,
	onFinish,
	onContinue,
}: ArrivalPromptSheetProps) {
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();

	return (
		<BottomSheet
			index={0}
			snapPoints={SNAP_POINTS}
			enableDynamicSizing={false}
			enablePanDownToClose={false}
			style={sheetStyles.container}
			backgroundStyle={sheetStyles.background}
			handleIndicatorStyle={sheetStyles.defaultHandleIndicator}
		>
			<BottomSheetView
				style={[styles.content, { paddingBottom: insets.bottom + SPACING.lg }]}
			>
				<Text style={styles.title}>{t('navigation.arrivalPromptTitle')}</Text>

				<Text style={styles.message}>
					{t('navigation.arrivalPromptMessage', {
						destination: destinationName,
					})}
				</Text>

				<View style={styles.buttons}>
					<Pressable
						style={({ pressed }) => [
							styles.primaryButton,
							pressed && styles.buttonPressed,
						]}
						onPress={onFinish}
					>
						<Text style={styles.primaryButtonText}>
							{t('navigation.arrivalPromptFinish')}
						</Text>
					</Pressable>
					<Pressable
						style={({ pressed }) => [
							styles.secondaryButton,
							pressed && styles.buttonPressed,
						]}
						onPress={onContinue}
					>
						<Text style={styles.secondaryButtonText}>
							{t('navigation.arrivalPromptContinue')}
						</Text>
					</Pressable>
				</View>
			</BottomSheetView>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.md,
	},
	title: {
		fontSize: SIZES.font2Xl,
		fontWeight: 'bold',
		color: COLORS.text,
		textAlign: 'center',
		marginBottom: SPACING.md,
	},
	message: {
		fontSize: SIZES.fontMd,
		color: COLORS.text,
		textAlign: 'center',
		marginBottom: SPACING.lg,
	},
	buttons: {
		gap: SPACING.sm,
	},
	primaryButton: {
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
	},
	secondaryButton: {
		backgroundColor: COLORS.surface,
		paddingVertical: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	buttonPressed: {
		opacity: 0.8,
	},
	primaryButtonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
	secondaryButtonText: {
		color: COLORS.text,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});
