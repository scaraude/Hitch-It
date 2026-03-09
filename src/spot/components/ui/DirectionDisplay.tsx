import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../../constants';
import { useTranslation } from '../../../i18n';
import { DIRECTION_CONFIG, DIRECTION_TRANSLATION_KEY } from '../../constants';
import type { Direction } from '../../types';

type DirectionDisplayVariant = 'compact' | 'full';

export interface DirectionDisplayProps {
	direction: Direction;
	showEmoji?: boolean;
	variant?: DirectionDisplayVariant;
	labelColor?: string;
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	compactContainer: {
		gap: SPACING.xs,
	},
	fullContainer: {
		gap: SPACING.sm,
	},
	compactEmoji: {
		fontSize: SIZES.fontSm,
	},
	fullEmoji: {
		fontSize: SIZES.fontMd,
	},
	label: {
		color: COLORS.text,
		flexShrink: 1,
	},
	compactLabel: {
		fontSize: SIZES.fontXs,
		fontWeight: '500',
	},
	fullLabel: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});

export const DirectionDisplay: React.FC<DirectionDisplayProps> = ({
	direction,
	showEmoji = true,
	variant = 'full',
	labelColor = COLORS.text,
}) => {
	const { t } = useTranslation();
	const label = t(DIRECTION_TRANSLATION_KEY[direction]);
	const isCompact = variant === 'compact';

	return (
		<View style={[styles.container, isCompact ? styles.compactContainer : styles.fullContainer]}>
			{showEmoji ? (
				<Text style={isCompact ? styles.compactEmoji : styles.fullEmoji}>
					{DIRECTION_CONFIG[direction].emoji}
				</Text>
			) : null}
			<Text
				numberOfLines={1}
				style={[
					styles.label,
					isCompact ? styles.compactLabel : styles.fullLabel,
					{ color: labelColor },
				]}
			>
				{label}
			</Text>
		</View>
	);
};
