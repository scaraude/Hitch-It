export const APP_SCHEME = 'hitchit';

export const AUTH_DEEP_LINK_PATHS = {
	confirmEmail: 'auth/confirm-email',
	resetPassword: 'auth/reset-password',
} as const;

export const AUTH_OTP_TYPES = {
	confirmEmail: 'signup',
	resetPassword: 'recovery',
} as const;

export function buildAppUrl(path: string): string {
	return `${APP_SCHEME}://${path}`;
}

export const AUTH_REDIRECT_URLS = {
	confirmEmail: buildAppUrl(AUTH_DEEP_LINK_PATHS.confirmEmail),
	resetPassword: buildAppUrl(AUTH_DEEP_LINK_PATHS.resetPassword),
} as const;
