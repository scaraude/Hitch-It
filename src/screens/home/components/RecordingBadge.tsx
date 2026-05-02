import type React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
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
	const pulseOpacity = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		if (!isVisible) {
			pulseOpacity.stopAnimation();
			pulseOpacity.setValue(1);
			return;
		}

		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(pulseOpacity, {
					toValue: 0.45,
					duration: 900,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(pulseOpacity, {
					toValue: 1,
					duration: 900,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			])
		);

		loop.start();
		return () => {
			loop.stop();
			pulseOpacity.setValue(1);
		};
	}, [isVisible, pulseOpacity]);

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
			<Animated.View style={[styles.recordingDot, { opacity: pulseOpacity }]} />
			<Text style={styles.recordingBadgeText}>{t('navigation.recording')}</Text>
		</View>
	);
};
