import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { SIZES } from '../../constants/sizes';
import { Language, useTranslation } from '../../i18n';

const AVAILABLE_LANGUAGES = [
	{
		code: Language.English,
		name: 'English',
		flag: '🇬🇧',
	},
	{
		code: Language.French,
		name: 'Français',
		flag: '🇫🇷',
	},
] as const;

export function LanguageSelector() {
	const { t, locale, setLocale } = useTranslation();

	const handleLanguageChange = async (language: Language) => {
		if (language !== locale) {
			await setLocale(language);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.label}>{t('profile.language')}</Text>
			<View style={styles.languageList}>
				{AVAILABLE_LANGUAGES.map(language => (
					<Pressable
						key={language.code}
						style={[
							styles.languageOption,
							locale === language.code && styles.languageOptionActive,
						]}
						onPress={() => handleLanguageChange(language.code)}
					>
						<View style={styles.languageInfo}>
							<Text style={styles.flag}>{language.flag}</Text>
							<Text
								style={[
									styles.languageName,
									locale === language.code && styles.languageNameActive,
								]}
							>
								{language.name}
							</Text>
						</View>
						{locale === language.code && (
							<Ionicons
								name="checkmark-circle"
								size={SIZES.iconSm}
								color={COLORS.primary}
							/>
						)}
					</Pressable>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: SPACING.lg,
	},
	label: {
		fontSize: SIZES.fontMd,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: SPACING.sm,
	},
	languageList: {
		gap: SPACING.sm,
	},
	languageOption: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: COLORS.surface,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: SIZES.radiusMedium,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
	},
	languageOptionActive: {
		borderColor: COLORS.primary,
		backgroundColor: `${COLORS.primary}10`,
	},
	languageInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING.md,
	},
	flag: {
		fontSize: SIZES.fontXl,
	},
	languageName: {
		fontSize: SIZES.fontMd,
		color: COLORS.text,
		fontWeight: '500',
	},
	languageNameActive: {
		color: COLORS.primary,
		fontWeight: '600',
	},
});
