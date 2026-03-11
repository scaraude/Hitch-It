import type React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n';
import { homeScreenStyles as styles } from '../homeScreenStyles';

type RecordingBadgeProps = {
	isVisible: boolean;
	safeAreaTopInset: number;
};

const RECORDING_BADGE_TOP_OFFSET = 12;

export const RecordingBadge: React.FC<RecordingBadgeProps> = ({
	isVisible,
	safeAreaTopInset,
}) => {
	const { t } = useTranslation();

	if (!isVisible) {
		return null;
	}

	return (
		<View
			style={[
				styles.recordingBadge,
				{ top: safeAreaTopInset + RECORDING_BADGE_TOP_OFFSET },
			]}
			pointerEvents="none"
		>
			<View style={styles.recordingDot} />
			<Text style={styles.recordingBadgeText}>{t('navigation.recording')}</Text>
		</View>
	);
};
