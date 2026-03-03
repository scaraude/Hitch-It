import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../../constants';

interface LoadingProps {
	variant: 'loading';
}

interface ErrorProps {
	variant: 'error';
	message: string;
}

type JourneyDetailFeedbackProps = LoadingProps | ErrorProps;

export function JourneyDetailFeedback(props: JourneyDetailFeedbackProps) {
	if (props.variant === 'loading') {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color={COLORS.primary} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
			<Text style={styles.errorText}>{props.message}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: SPACING.xl,
	},
	errorText: {
		fontSize: SIZES.fontMd,
		color: COLORS.error,
		marginTop: SPACING.md,
		textAlign: 'center',
	},
});
