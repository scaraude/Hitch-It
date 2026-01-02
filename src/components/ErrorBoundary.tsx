import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('ErrorBoundary caught:', error, errorInfo);
		// TODO: Send to error reporting service (Sentry, etc.)
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: undefined });
	};

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback ?? (
					<View style={styles.container}>
						<Text style={styles.title}>Oups ! Une erreur est survenue</Text>
						{this.state.error && (
							<Text style={styles.errorText}>{this.state.error.message}</Text>
						)}
						<TouchableOpacity
							style={styles.button}
							onPress={this.handleRetry}
							accessibilityLabel="Réessayer"
							accessibilityRole="button"
						>
							<Text style={styles.buttonText}>Réessayer</Text>
						</TouchableOpacity>
					</View>
				)
			);
		}
		return this.props.children;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLORS.background,
		padding: SPACING.lg,
	},
	title: {
		fontSize: SIZES.fontXl,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: SPACING.md,
		textAlign: 'center',
	},
	errorText: {
		fontSize: SIZES.fontSm,
		color: COLORS.textSecondary,
		marginBottom: SPACING.xl,
		textAlign: 'center',
	},
	button: {
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.md,
		paddingHorizontal: SPACING.xl,
		borderRadius: SIZES.radiusMedium,
	},
	buttonText: {
		color: COLORS.background,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});
