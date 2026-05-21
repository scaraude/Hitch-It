import type React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants';

type TypographyVariant = keyof typeof TYPOGRAPHY;
type AppColor = (typeof COLORS)[keyof typeof COLORS];

interface AppTextProps extends TextProps {
	variant?: TypographyVariant;
	color?: AppColor;
}

function variantStyle(variant: TypographyVariant): TextStyle {
	return { ...TYPOGRAPHY[variant], color: COLORS.text };
}

export const AppText: React.FC<AppTextProps> = ({
	variant = 'body',
	color,
	style,
	...props
}) => (
	<Text
		style={[variantStyle(variant), color ? { color } : undefined, style]}
		{...props}
	/>
);
