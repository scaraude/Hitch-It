import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants';

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
		fontSize: 24,
		fontWeight: 'bold',
		color: COLORS.background,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: COLORS.background,
		textAlign: 'center',
		marginTop: SPACING.xs,
	},
});
