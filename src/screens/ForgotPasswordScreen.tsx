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

const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordScreen() {
	const navigation = useNavigation<NavigationProp>();
	const { sendPasswordResetEmail } = useAuth();

	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const [resendCooldown, setResendCooldown] = useState(0);
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

	const handleSendReset = async () => {
		const trimmedEmail = email.trim().toLowerCase();

		if (!trimmedEmail) {
			setError('Please enter your email address');
			return;
		}

		if (!trimmedEmail.includes('@')) {
			setError('Please enter a valid email address');
			return;
		}

		setError('');
		setIsLoading(true);

		const result = await sendPasswordResetEmail(trimmedEmail);

		setIsLoading(false);

		if (result.error) {
			setError(result.error);
		} else {
			setEmailSent(true);
			startCooldown();
		}
	};

	const handleResend = async () => {
		if (resendCooldown > 0 || isLoading) return;

		setError('');
		setIsLoading(true);

		const result = await sendPasswordResetEmail(email.trim().toLowerCase());

		setIsLoading(false);

		if (result.error) {
			setError(result.error);
		} else {
			startCooldown();
		}
	};

	const goToLogin = () => {
		navigation.navigate('Login');
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
					<Text style={styles.title}>Reset Password</Text>
					<Text style={styles.subtitle}>
						{emailSent
							? 'Check your email for the reset link'
							: "Enter your email and we'll send you a reset link"}
					</Text>
				</View>

				<View style={styles.form}>
					{error ? <Text style={styles.errorText}>{error}</Text> : null}

					{emailSent ? (
						<View style={styles.successBox}>
							<Ionicons
								name="mail-outline"
								size={SIZES.iconLg}
								color={COLORS.primary}
								style={styles.successIcon}
							/>
							<Text style={styles.successText}>
								We've sent a password reset link to{'\n'}
								<Text style={styles.emailHighlight}>{email.trim()}</Text>
							</Text>
							<Text style={styles.instructionText}>
								Check your inbox and spam folder. The link will expire in 1
								hour.
							</Text>
							<Pressable
								style={[
									styles.resendButton,
									(resendCooldown > 0 || isLoading) &&
										styles.resendButtonDisabled,
								]}
								onPress={handleResend}
								disabled={resendCooldown > 0 || isLoading}
							>
								<Text style={styles.resendButtonText}>
									{isLoading
										? 'Sending...'
										: resendCooldown > 0
											? `Resend in ${resendCooldown}s`
											: 'Resend reset email'}
								</Text>
							</Pressable>
						</View>
					) : (
						<>
							<View style={styles.inputContainer}>
								<Ionicons
									name="mail-outline"
									size={SIZES.iconSm}
									color={COLORS.textSecondary}
									style={styles.inputIcon}
								/>
								<TextInput
									style={styles.input}
									placeholder="Email address"
									placeholderTextColor={COLORS.textSecondary}
									value={email}
									onChangeText={setEmail}
									autoCapitalize="none"
									autoCorrect={false}
									keyboardType="email-address"
									editable={!isLoading}
								/>
							</View>

							<Pressable
								style={[styles.button, isLoading && styles.buttonDisabled]}
								onPress={handleSendReset}
								disabled={isLoading}
							>
								<Text style={styles.buttonText}>
									{isLoading ? 'Sending...' : 'Send Reset Link'}
								</Text>
							</Pressable>
						</>
					)}
				</View>

				<View style={styles.footer}>
					<Text style={styles.footerText}>Remember your password? </Text>
					<Pressable onPress={goToLogin}>
						<Text style={styles.linkText}>Sign In</Text>
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
	successBox: {
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		borderWidth: 1,
		borderColor: COLORS.primary,
		padding: SPACING.lg,
		alignItems: 'center',
		gap: SPACING.sm,
	},
	successIcon: {
		marginBottom: SPACING.xs,
	},
	successText: {
		color: COLORS.text,
		fontSize: SIZES.fontMd,
		textAlign: 'center',
		lineHeight: 22,
	},
	emailHighlight: {
		fontWeight: '600',
		color: COLORS.primary,
	},
	instructionText: {
		color: COLORS.textSecondary,
		fontSize: SIZES.fontSm,
		textAlign: 'center',
		lineHeight: 20,
	},
	resendButton: {
		backgroundColor: COLORS.primary,
		paddingVertical: SPACING.sm,
		paddingHorizontal: SPACING.md,
		borderRadius: SIZES.radiusMedium,
		marginTop: SPACING.sm,
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
