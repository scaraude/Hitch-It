import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
	NativeStackNavigationProp,
	NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { COLORS, SPACING } from '../constants';
import { SIZES } from '../constants/sizes';
import { useTranslation } from '../i18n';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = NativeStackScreenProps<
	RootStackParamList,
	'ConfirmEmail'
>['route'];

const RESEND_COOLDOWN_SECONDS = 60;

export default function ConfirmEmailScreen() {
	const navigation = useNavigation<NavigationProp>();
	const route = useRoute<RouteProps>();
	const {
		authDeepLinkState,
		clearAuthDeepLinkState,
		isAuthenticated,
		resendConfirmationEmail,
	} = useAuth();
	const { t } = useTranslation();

	const email = route.params?.email?.trim().toLowerCase() ?? '';
	const [error, setError] = useState('');
	const [isResending, setIsResending] = useState(false);
	const [resendCooldown, setResendCooldown] = useState(0);
	const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		return () => {
			if (cooldownRef.current) {
				clearInterval(cooldownRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (
			authDeepLinkState.intent === 'confirm-email' &&
			authDeepLinkState.status === 'error'
		) {
			setError(authDeepLinkState.error ?? t('auth.confirmEmailInvalidLink'));
		}
	}, [authDeepLinkState, t]);

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
		if (!email) {
			setError(t('auth.resendEmailRequired'));
			return;
		}

		setError('');
		setIsResending(true);
		const result = await resendConfirmationEmail(email);
		setIsResending(false);

		if (result.error) {
			setError(result.error);
			return;
		}

		startCooldown();
	};

	const handlePrimaryAction = () => {
		if (
			authDeepLinkState.intent === 'confirm-email' &&
			authDeepLinkState.status === 'verified'
		) {
			clearAuthDeepLinkState();
			if (isAuthenticated) {
				navigation.reset({
					index: 0,
					routes: [{ name: 'Home' }],
				});
				return;
			}
		}

		clearAuthDeepLinkState();
		navigation.reset({
			index: 1,
			routes: [{ name: 'Home' }, { name: 'Login' }],
		});
	};

	const isVerified =
		authDeepLinkState.intent === 'confirm-email' &&
		authDeepLinkState.status === 'verified';
	const hasDeepLinkError =
		authDeepLinkState.intent === 'confirm-email' &&
		authDeepLinkState.status === 'error';

	const title = isVerified
		? t('auth.confirmEmailSuccessTitle')
		: hasDeepLinkError
			? t('auth.confirmEmailErrorTitle')
			: t('auth.confirmEmailPendingTitle');

	const subtitle = isVerified
		? t('auth.confirmEmailSuccessSubtitle')
		: hasDeepLinkError
			? t('auth.confirmEmailErrorSubtitle')
			: t('auth.confirmEmailPendingSubtitle');

	const iconName = isVerified
		? 'checkmark-circle-outline'
		: hasDeepLinkError
			? 'alert-circle-outline'
			: 'mail-open-outline';

	const iconColor = isVerified
		? COLORS.primary
		: hasDeepLinkError
			? COLORS.error
			: COLORS.warning;

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.content}
			>
				<Pressable style={styles.backButton} onPress={handlePrimaryAction}>
					<Ionicons name="arrow-back" size={SIZES.iconMd} color={COLORS.text} />
				</Pressable>

				<View style={styles.header}>
					<Text style={styles.title}>{title}</Text>
					<Text style={styles.subtitle}>{subtitle}</Text>
				</View>

				<View style={styles.card}>
					<Ionicons
						name={iconName}
						size={SIZES.iconLg * 1.5}
						color={iconColor}
						style={styles.icon}
					/>

					{email ? (
						<Text style={styles.emailText}>
							{t('auth.confirmEmailSentTo')}
							<Text style={styles.emailHighlight}>{email}</Text>
						</Text>
					) : null}

					{error ? <Text style={styles.errorText}>{error}</Text> : null}

					{!isVerified && (
						<Pressable
							style={[
								styles.secondaryButton,
								(resendCooldown > 0 || isResending) && styles.buttonDisabled,
							]}
							onPress={handleResendEmail}
							disabled={resendCooldown > 0 || isResending}
						>
							<Text style={styles.secondaryButtonText}>
								{isResending
									? t('auth.sending')
									: resendCooldown > 0
										? t('auth.resendIn', { seconds: resendCooldown })
										: t('auth.resendConfirmationEmail')}
							</Text>
						</Pressable>
					)}

					<Pressable style={styles.button} onPress={handlePrimaryAction}>
						<Text style={styles.buttonText}>
							{isVerified
								? isAuthenticated
									? t('auth.continueToApp')
									: t('auth.signIn')
								: t('auth.backToLogin')}
						</Text>
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
	card: {
		backgroundColor: COLORS.surface,
		borderRadius: SIZES.radiusMedium,
		borderWidth: 1,
		borderColor: COLORS.border,
		padding: SPACING.lg,
		alignItems: 'center',
		gap: SPACING.md,
	},
	icon: {
		marginBottom: SPACING.xs,
	},
	emailText: {
		color: COLORS.text,
		fontSize: SIZES.fontMd,
		textAlign: 'center',
		lineHeight: 22,
	},
	emailHighlight: {
		color: COLORS.primary,
		fontWeight: '600',
	},
	errorText: {
		color: COLORS.error,
		fontSize: SIZES.fontSm,
		textAlign: 'center',
		lineHeight: 20,
	},
	button: {
		backgroundColor: COLORS.primary,
		height: SIZES.buttonHeight,
		borderRadius: SIZES.radiusMedium,
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'stretch',
	},
	secondaryButton: {
		backgroundColor: COLORS.warning,
		height: SIZES.buttonHeight,
		borderRadius: SIZES.radiusMedium,
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'stretch',
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
	secondaryButtonText: {
		color: COLORS.textLight,
		fontSize: SIZES.fontMd,
		fontWeight: '600',
	},
});
