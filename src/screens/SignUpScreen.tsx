import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
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
import { hasValidUsernameFormat } from '../auth/utils/usernameValidation';
import { COLORS, SPACING } from '../constants';
import { SIZES } from '../constants/sizes';
import { useTranslation } from '../i18n';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SignUpScreen() {
	const navigation = useNavigation<NavigationProp>();
	const { signUp } = useAuth();
	const { t } = useTranslation();

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSignUp = async () => {
		if (!username.trim() || !email.trim() || !password) {
			setError(t('auth.fillAllFields'));
			return;
		}

		if (username.trim().length < 3) {
			setError(t('auth.usernameMinLength'));
			return;
		}

		if (!hasValidUsernameFormat(username.trim())) {
			setError(t('auth.usernameInvalidFormat'));
			return;
		}

		if (!email.includes('@')) {
			setError(t('auth.invalidEmail'));
			return;
		}

		if (password.length < 6) {
			setError(t('auth.passwordMinLength'));
			return;
		}

		setError('');
		setIsLoading(true);

		const result = await signUp({
			username: username.trim(),
			email: email.trim(),
			password,
		});

		setIsLoading(false);

		if (result.error) {
			setError(result.error);
		} else {
			navigation.navigate('ConfirmEmail', {
				email: email.trim().toLowerCase(),
			});
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
					<Text style={styles.title}>{t('auth.createAccount')}</Text>
					<Text style={styles.subtitle}>{t('auth.joinCommunity')}</Text>
				</View>

				<View style={styles.form}>
					{error ? <Text style={styles.errorText}>{error}</Text> : null}

					<View style={styles.inputContainer}>
						<Ionicons
							name="person-outline"
							size={SIZES.iconSm}
							color={COLORS.textSecondary}
							style={styles.inputIcon}
						/>
						<TextInput
							style={styles.input}
							placeholder={t('auth.usernamePlaceholder')}
							placeholderTextColor={COLORS.textSecondary}
							value={username}
							onChangeText={setUsername}
							autoCapitalize="none"
							autoCorrect={false}
							editable={!isLoading}
						/>
					</View>

					<View style={styles.inputContainer}>
						<Ionicons
							name="mail-outline"
							size={SIZES.iconSm}
							color={COLORS.textSecondary}
							style={styles.inputIcon}
						/>
						<TextInput
							style={styles.input}
							placeholder={t('auth.emailPlaceholder')}
							placeholderTextColor={COLORS.textSecondary}
							value={email}
							onChangeText={setEmail}
							autoCapitalize="none"
							autoCorrect={false}
							keyboardType="email-address"
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
							placeholder={t('auth.passwordPlaceholder')}
							placeholderTextColor={COLORS.textSecondary}
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							editable={!isLoading}
						/>
					</View>

					<Pressable
						style={[styles.button, isLoading && styles.buttonDisabled]}
						onPress={handleSignUp}
						disabled={isLoading}
					>
						<Text style={styles.buttonText}>
							{isLoading ? t('auth.creatingAccount') : t('auth.signUp')}
						</Text>
					</Pressable>
				</View>

				<View style={styles.footer}>
					<Text style={styles.footerText}>{t('auth.haveAccount')}</Text>
					<Pressable onPress={goToLogin}>
						<Text style={styles.linkText}>{t('auth.signIn')}</Text>
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
});
