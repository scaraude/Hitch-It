import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants';

interface HeaderProps {
	title: string;
	subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
	return (
		<View style={styles.header}>
			<Text style={styles.title}>{title}</Text>
			{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		padding: SPACING.md,
		backgroundColor: COLORS.primary,
	},
	title: {
		fontSize: SIZES.font2Xl,
		fontWeight: 'bold',
		color: COLORS.background,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: SIZES.fontMd,
		color: COLORS.background,
		textAlign: 'center',
		marginTop: SPACING.xs,
	},
});
