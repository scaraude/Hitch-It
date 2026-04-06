import type { AuthOtpResponse } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import { createLogger, LogContext } from '../../utils/logger';
import { AUTH_DEEP_LINK_PATHS, AUTH_OTP_TYPES } from '../constants';
import type {
	AuthDeepLinkIntent,
	AuthDeepLinkParseResult,
	AuthDeepLinkVerificationResult,
	AuthEmailOtpType,
} from '../types';

const logger = createLogger(LogContext.App);

const AUTH_ROUTE_CONFIG: Record<
	string,
	{ intent: AuthDeepLinkIntent; type: AuthEmailOtpType }
> = {
	[AUTH_DEEP_LINK_PATHS.confirmEmail]: {
		intent: 'confirm-email',
		type: AUTH_OTP_TYPES.confirmEmail,
	},
	[AUTH_DEEP_LINK_PATHS.resetPassword]: {
		intent: 'reset-password',
		type: AUTH_OTP_TYPES.resetPassword,
	},
};

function normalizePathname(pathname: string): string {
	return pathname.replace(/^\/+/, '').replace(/\/+$/, '');
}

function decodeUrlParam(value: string): string {
	return decodeURIComponent(value.replace(/\+/g, ' '));
}

function parseParams(rawParams: string | undefined): Map<string, string> {
	const params = new Map<string, string>();
	const source = rawParams?.replace(/^[?#]/, '') ?? '';

	if (!source) {
		return params;
	}

	for (const entry of source.split('&')) {
		if (!entry) {
			continue;
		}

		const [rawKey, ...rawValueParts] = entry.split('=');
		if (!rawKey) {
			continue;
		}

		const key = decodeUrlParam(rawKey);
		const value = decodeUrlParam(rawValueParts.join('='));
		params.set(key, value);
	}

	return params;
}

function readStringParam(
	params: Map<string, string>,
	key: string
): string | undefined {
	const value = params.get(key)?.trim();
	return value ? value : undefined;
}

function readEmailOtpType(
	value: string | undefined
): AuthEmailOtpType | undefined {
	if (!value) {
		return undefined;
	}

	if (
		value === 'signup' ||
		value === 'invite' ||
		value === 'magiclink' ||
		value === 'recovery' ||
		value === 'email_change' ||
		value === 'email'
	) {
		return value;
	}

	return undefined;
}

function splitUrl(url: string): {
	path: string;
	query: string | undefined;
	fragment: string | undefined;
} | null {
	const [withoutFragment, fragment] = url.split('#', 2);
	const [withoutQuery, query] = withoutFragment.split('?', 2);
	const path = withoutQuery.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');

	if (!path) {
		return null;
	}

	return {
		path: normalizePathname(path),
		query,
		fragment,
	};
}

export function parseAuthDeepLinkUrl(
	url: string
): AuthDeepLinkParseResult | null {
	const splitResult = splitUrl(url);
	if (!splitResult) {
		logger.warn('Failed to parse auth deep link URL', { url });
		return null;
	}

	const normalizedPath = splitResult.path;
	const routeConfig = AUTH_ROUTE_CONFIG[normalizedPath];

	if (!routeConfig) {
		return null;
	}

	const mergedParams = new Map<string, string>([
		...parseParams(splitResult.query),
		...parseParams(splitResult.fragment),
	]);

	const providedType = readEmailOtpType(readStringParam(mergedParams, 'type'));

	return {
		url,
		path: normalizedPath,
		intent: routeConfig.intent,
		type: providedType ?? routeConfig.type,
		tokenHash: readStringParam(mergedParams, 'token_hash'),
		accessToken: readStringParam(mergedParams, 'access_token'),
		refreshToken: readStringParam(mergedParams, 'refresh_token'),
		code: readStringParam(mergedParams, 'code'),
		errorCode: readStringParam(mergedParams, 'error_code'),
		errorDescription: readStringParam(mergedParams, 'error_description'),
	};
}

async function verifyOtpTokenHash(
	tokenHash: string,
	type: AuthEmailOtpType
): Promise<AuthOtpResponse | { error: { message: string } }> {
	const result = await supabase.auth.verifyOtp({
		token_hash: tokenHash,
		type,
	});

	if (result.error) {
		return result;
	}

	return { data: { messageId: null, session: null, user: null }, error: null };
}

export async function verifyAuthDeepLink(
	url: string
): Promise<AuthDeepLinkVerificationResult | null> {
	const parsedLink = parseAuthDeepLinkUrl(url);

	if (!parsedLink) {
		return null;
	}

	if (parsedLink.errorCode || parsedLink.errorDescription) {
		const errorMessage =
			parsedLink.errorDescription ??
			'Authentication link contained an error from the provider.';

		logger.warn('Auth deep link contains provider error', {
			intent: parsedLink.intent,
			errorCode: parsedLink.errorCode,
			errorDescription: parsedLink.errorDescription,
		});

		return {
			status: 'error',
			intent: parsedLink.intent,
			url: parsedLink.url,
			error: errorMessage,
		};
	}

	const expectedType = AUTH_ROUTE_CONFIG[parsedLink.path]?.type;
	if (expectedType && parsedLink.type !== expectedType) {
		const error =
			'Authentication link type does not match the expected in-app auth route.';
		logger.warn('Auth deep link type mismatch', {
			intent: parsedLink.intent,
			type: parsedLink.type,
			expectedType,
		});
		return {
			status: 'error',
			intent: parsedLink.intent,
			url: parsedLink.url,
			error,
		};
	}

	try {
		if (parsedLink.accessToken && parsedLink.refreshToken) {
			const { error } = await supabase.auth.setSession({
				access_token: parsedLink.accessToken,
				refresh_token: parsedLink.refreshToken,
			});

			if (error) {
				logger.error('Failed to set auth session from deep link', error, {
					intent: parsedLink.intent,
				});
				return {
					status: 'error',
					intent: parsedLink.intent,
					url: parsedLink.url,
					error: error.message,
				};
			}

			return {
				status: 'verified',
				intent: parsedLink.intent,
				url: parsedLink.url,
			};
		}

		if (parsedLink.tokenHash) {
			const result = await verifyOtpTokenHash(
				parsedLink.tokenHash,
				parsedLink.type
			);

			if (result.error) {
				logger.error(
					'Failed to verify auth token hash from deep link',
					result.error,
					{
						intent: parsedLink.intent,
					}
				);
				return {
					status: 'error',
					intent: parsedLink.intent,
					url: parsedLink.url,
					error: result.error.message,
				};
			}

			return {
				status: 'verified',
				intent: parsedLink.intent,
				url: parsedLink.url,
			};
		}

		if (parsedLink.code) {
			const { error } = await supabase.auth.exchangeCodeForSession(
				parsedLink.code
			);

			if (error) {
				logger.error('Failed to exchange auth code from deep link', error, {
					intent: parsedLink.intent,
				});
				return {
					status: 'error',
					intent: parsedLink.intent,
					url: parsedLink.url,
					error: error.message,
				};
			}

			return {
				status: 'verified',
				intent: parsedLink.intent,
				url: parsedLink.url,
			};
		}

		logger.warn('Auth deep link missing supported verification tokens', {
			intent: parsedLink.intent,
		});
		return {
			status: 'error',
			intent: parsedLink.intent,
			url: parsedLink.url,
			error: 'Authentication link is missing supported verification tokens.',
		};
	} catch (error) {
		logger.error('Unexpected auth deep link verification error', error, {
			intent: parsedLink.intent,
		});
		return {
			status: 'error',
			intent: parsedLink.intent,
			url: parsedLink.url,
			error: 'An unexpected error occurred while verifying the auth link.',
		};
	}
}
