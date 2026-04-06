import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
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
import { useTranslation } from '../i18n';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ResetPasswordScreen() {
	const navigation = useNavigation<NavigationProp>();
	const { authDeepLinkState, clearAuthDeepLinkState, updatePassword } =
		useAuth();
	const { t } = useTranslation();

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const deepLinkError = useMemo(() => {
		if (
			authDeepLinkState.intent === 'reset-password' &&
			authDeepLinkState.status === 'error'
		) {
			return authDeepLinkState.error ?? t('auth.invalidResetLink');
		}

		if (authDeepLinkState.status === 'idle') {
			return t('auth.invalidResetLink');
		}

		return '';
	}, [authDeepLinkState, t]);

	useEffect(() => {
		if (deepLinkError) {
			setError(deepLinkError);
		}
	}, [deepLinkError]);

	const handleSubmit = async () => {
		if (authDeepLinkState.status !== 'verified') {
			setError(deepLinkError || t('auth.invalidResetLink'));
			return;
		}

		if (password.length < 6) {
			setError(t('auth.passwordMinLength'));
			return;
		}

		if (password !== confirmPassword) {
			setError(t('auth.passwordsDoNotMatch'));
			return;
		}

		setError('');
		setIsLoading(true);

		const result = await updatePassword(password);

		setIsLoading(false);

		if (result.error) {
			setError(result.error);
			return;
		}

		clearAuthDeepLinkState();
		setSuccess(true);
	};

	const handleGoToLogin = () => {
		clearAuthDeepLinkState();
		navigation.reset({
			index: 1,
			routes: [{ name: 'Home' }, { name: 'Login' }],
		});
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.content}
			>
				<Pressable style={styles.backButton} onPress={handleGoToLogin}>
					<Ionicons name="arrow-back" size={SIZES.iconMd} color={COLORS.text} />
				</Pressable>

				<View style={styles.header}>
					<Text style={styles.title}>{t('auth.chooseNewPassword')}</Text>
					<Text style={styles.subtitle}>
						{success
							? t('auth.passwordResetSuccess')
							: t('auth.chooseNewPasswordSubtitle')}
					</Text>
				</View>

				<View style={styles.form}>
					{error ? <Text style={styles.errorText}>{error}</Text> : null}
					{success ? (
						<Pressable style={styles.button} onPress={handleGoToLogin}>
							<Text style={styles.buttonText}>{t('auth.signIn')}</Text>
						</Pressable>
					) : (
						<>
							<View style={styles.inputContainer}>
								<Ionicons
									name="lock-closed-outline"
									size={SIZES.iconSm}
									color={COLORS.textSecondary}
									style={styles.inputIcon}
								/>
								<TextInput
									style={styles.input}
									placeholder={t('auth.newPasswordPlaceholder')}
									placeholderTextColor={COLORS.textSecondary}
									value={password}
									onChangeText={setPassword}
									secureTextEntry
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
									placeholder={t('auth.confirmNewPasswordPlaceholder')}
									placeholderTextColor={COLORS.textSecondary}
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									secureTextEntry
									editable={!isLoading}
								/>
							</View>

							<Pressable
								style={[styles.button, isLoading && styles.buttonDisabled]}
								onPress={handleSubmit}
								disabled={isLoading}
							>
								<Text style={styles.buttonText}>
									{isLoading ? t('common.saving') : t('auth.updatePassword')}
								</Text>
							</Pressable>
						</>
					)}
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
});
