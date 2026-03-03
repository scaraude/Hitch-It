import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../../constants';

interface JourneyDetailHeaderProps {
	title: string;
	onBack: () => void;
}

export function JourneyDetailHeader({
	title,
	onBack,
}: JourneyDetailHeaderProps) {
	return (
		<View style={styles.header}>
			<Pressable style={styles.backButton} onPress={onBack}>
				<Ionicons name="arrow-back" size={SIZES.iconMd} color={COLORS.text} />
			</Pressable>
			<Text style={styles.headerTitle}>{title}</Text>
			<View style={styles.headerSpacer} />
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.sm,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		backgroundColor: COLORS.background,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		flex: 1,
		fontSize: SIZES.fontLg,
		fontWeight: '600',
		color: COLORS.text,
		textAlign: 'center',
	},
	headerSpacer: {
		width: 40,
	},
});
