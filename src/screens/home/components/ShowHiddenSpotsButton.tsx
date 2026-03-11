import type React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { COLORS } from '../../../constants';
import { useTranslation } from '../../../i18n';
import { homeScreenStyles as styles } from '../homeScreenStyles';

type ShowHiddenSpotsButtonProps = {
	isLoading: boolean;
	isVisible: boolean;
	onPress: () => void;
};

export const ShowHiddenSpotsButton: React.FC<ShowHiddenSpotsButtonProps> = ({
	isLoading,
	isVisible,
	onPress,
}) => {
	const { t } = useTranslation();

	if (!isVisible) {
		return null;
	}

	return (
		<Pressable
			style={({ pressed }) => [
				styles.showSpotsButton,
				pressed && !isLoading && styles.showSpotsButtonPressed,
			]}
			onPress={onPress}
			disabled={isLoading}
			accessibilityRole="button"
			accessibilityLabel={t('spots.showSpotsCta')}
			testID="show-hidden-spots-button"
		>
			{isLoading ? (
				<ActivityIndicator
					size="small"
					color={COLORS.textLight}
					style={styles.showSpotsButtonSpinner}
				/>
			) : null}
			<Text style={styles.showSpotsButtonText}>
				{isLoading ? t('spots.showSpotsLoadingCta') : t('spots.showSpotsCta')}
			</Text>
		</Pressable>
	);
};
