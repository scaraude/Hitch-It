import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { COLORS, SPACING } from '../constants';
import { SIZES } from '../constants/sizes';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RESEND_COOLDOWN_SECONDS = 30;

export default function LoginScreen() {
	const navigation = useNavigation<NavigationProp>();
	const { login, resendConfirmationEmail } = useAuth();

	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
	const [resendCooldown, setResendCooldown] = useState(0);
	const [isResending, setIsResending] = useState(false);
	const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		return () => {
			if (cooldownRef.current) {
				clearInterval(cooldownRef.current);
			}
		};
	}, []);

	const startCooldown = () => {
		setResendCooldown(RESEND_COOLDOWN_SECONDS);
		cooldownRef.current = setInterval(() => {
			setResendCooldown(prev => {
				if (prev <= 1) {
					if (cooldownRef.current) {
						clearInterval(cooldownRef.current);
						cooldownRef.current = null;
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	const handleResendEmail = async () => {
		const email = identifier.includes('@') ? identifier.trim() : '';
		if (!email) {
			setError('Please enter your email address to resend the confirmation.');
			return;
		}

		setIsResending(true);
		const result = await resendConfirmationEmail(email);
		setIsResending(false);

		if (result.error) {
			setError(result.error);
		} else {
			setError('');
			startCooldown();
		}
	};

	const handleLogin = async () => {
		if (!identifier.trim() || !password) {
			setError('Please fill in all fields');
			return;
		}

		setError('');
		setShowEmailConfirmation(false);
		setIsLoading(true);

		const result = await login({ identifier: identifier.trim(), password });

		setIsLoading(false);

		if (result.error) {
			setError(result.error);
			if (result.emailNotConfirmed) {
				setShowEmailConfirmation(true);
			}
		} else {
			navigation.navigate('Home');
		}
	};

	const goToSignUp = () => {
		navigation.navigate('SignUp');
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.content}
			>
				<Pressable
					style={styles.backButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="arrow-back" size={SIZES.iconMd} color={COLORS.text} />
				</Pressable>

				<View style={styles.header}>
					<Text style={styles.title}>Welcome back</Text>
					<Text style={styles.subtitle}>Sign in to your account</Text>
				</View>

				<View style={styles.form}>
					{error ? <Text style={styles.errorText}>{error}</Text> : null}

					{showEmailConfirmation && (
						<View style={styles.confirmationBox}>
							<Ionicons
								name="mail-outline"
								size={SIZES.iconMd}
								color={COLORS.warning}
								style={styles.confirmationIcon}
							/>
							<Text style={styles.confirmationText}>
								Check your inbox and spam folder for the confirmation link.
							</Text>
							<Pressable
								style={[
									styles.resendButton,
									(resendCooldown > 0 || isResending) &&
									styles.resendButtonDisabled,
								]}
								onPress={handleResendEmail}
								disabled={resendCooldown > 0 || isResending}
							>
								<Text style={styles.resendButtonText}>
									{isResending
										? 'Sending...'
										: resendCooldown > 0
											? `Resend in ${resendCooldown}s`
											: 'Resend confirmation email'}
								</Text>
							</Pressable>
						</View>
					)}

					<View style={styles.inputContainer}>
						<Ionicons
							name="person-outline"
							size={SIZES.iconSm}
							color={COLORS.textSecondary}
							style={styles.inputIcon}
						/>
						<TextInput
							style={styles.input}
							placeholder="Username or email"
							placeholderTextColor={COLORS.textSecondary}
							value={identifier}
							onChangeText={setIdentifier}
							autoCapitalize="none"
							autoCorrect={false}
							editable={!isLoading}
						/>
					</View>

					<View style={styles.inputContainer}>
						<Ionicons
							name="lock-closed-outline"
							size={SIZES.iconSm}
							color={COLORS.textSecondary}
							style={styles.inputIcon}
						/>
						<TextInput
							style={styles.input}
							placeholder="Password"
							placeholderTextColor={COLORS.textSecondary}
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							editable={!isLoading}
						/>
					</View>

					<Pressable
						style={[styles.button, isLoading && styles.buttonDisabled]}
						onPress={handleLogin}
						disabled={isLoading}
					>
						<Text style={styles.buttonText}>
							{isLoading ? 'Signing in...' : 'Sign In'}
						</Text>
					</Pressable>
				</View>

				<View style={styles.footer}>
					<Text style={styles.footerText}>Don't have an account? </Text>
					<Pressable onPress={goToSignUp}>
						<Text style={styles.linkText}>Sign Up</Text>
					</Pressable>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	content: {
		flex: 1,
		padding: SPACING.lg,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: SPACING.md,
	},
	header: {
		marginBottom: SPACING.xl,
	},
	title: {
		fontSize: SIZES.font2Xl,
		fontWeight: '700',
		color: COLORS.text,
		marginBottom: SPACING.xs,
	},
	subtitle: {
		fontSize: SIZES.fontMd,
		color: COLORS.textSecondary,
	},
	form: {
		gap: SPACING.md,
	},
	errorText: {
		color: COLORS.error,
		fontSize: SIZES.fontSm,
		textAlign: 'center',
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		borderWidth: 1,
		borderColor: COLORS.border,
		height: SIZES.inputHeight,
	},
	inputIcon: {
		marginLeft: SPACING.md,
	},
	input: {
		flex: 1,
		height: '100%',
		paddingHorizontal: SPACING.sm,
		fontSize: SIZES.fontMd,
		color: COLORS.text,
	},
	button: {
		backgroundColor: COLORS.primary,
		height: SIZES.buttonHeight,
		borderRadius: SIZES.radiusMedium,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: SPACING.sm,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 'auto',
		paddingVertical: SPACING.lg,
	},
	footerText: {
		color: COLORS.textSecondary,
		fontSize: SIZES.fontSm,
	},
	linkText: {
		color: COLORS.primary,
		fontSize: SIZES.fontSm,
		fontWeight: '600',
	},
	confirmationBox: {
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		borderWidth: 1,
		borderColor: COLORS.warning,
		padding: SPACING.md,
		alignItems: 'center',
		gap: SPACING.sm,
	},
	confirmationIcon: {
		marginBottom: SPACING.xs,
	},
	confirmationText: {
		color: COLORS.text,
		fontSize: SIZES.fontSm,
		textAlign: 'center',
		lineHeight: 20,
	},
	resendButton: {
		backgroundColor: COLORS.warning,
		paddingVertical: SPACING.sm,
		paddingHorizontal: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		marginTop: SPACING.xs,
	},
	resendButtonDisabled: {
		opacity: 0.6,
	},
	resendButtonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontSm,
		fontWeight: '600',
	},
});
