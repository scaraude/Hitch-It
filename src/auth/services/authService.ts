import { supabase } from '../../lib/supabaseClient';
import { createLogger, LogContext } from '../../utils/logger';
import type {
	AuthActionResult,
	LoginCredentials,
	SignUpCredentials,
	User,
	UserId,
} from '../types';

const logger = createLogger(LogContext.App);

/**
 * Check if identifier is an email
 */
function isEmail(identifier: string): boolean {
	return identifier.includes('@');
}

/**
 * Sign up a new user with username, email, and password
 */
export async function signUp(
	credentials: SignUpCredentials
): Promise<AuthActionResult> {
	const { username, email, password } = credentials;

	try {
		// First, check if username is already taken
		const { data: existingProfile } = await supabase
			.from('profiles')
			.select('id')
			.eq('username', username)
			.single();

		if (existingProfile) {
			return { error: 'Username is already taken' };
		}

		// Check if email is already taken
		// Note: Supabase returns an obfuscated response for duplicate emails to prevent enumeration attacks
		// We need to check manually to provide a user-friendly error message
		const { data: existingEmail } = await supabase
			.from('profiles')
			.select('id')
			.eq('email', email.toLowerCase())
			.single();

		if (existingEmail) {
			return { error: 'An account with this email already exists' };
		}

		// Create auth user with username in metadata
		// The database trigger will automatically create the profile
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					username,
				},
			},
		});

		if (authError) {
			logger.error('Sign up auth error', authError);
			return { error: authError.message };
		}

		if (!authData.user) {
			return { error: 'Failed to create user' };
		}

		logger.info('User signed up successfully', { username, email });
		return {};
	} catch (error) {
		logger.error('Sign up error', error);
		return { error: 'An unexpected error occurred' };
	}
}

/**
 * Login with username or email + password
 */
export async function login(
	credentials: LoginCredentials
): Promise<AuthActionResult> {
	const { identifier, password } = credentials;

	try {
		let email = identifier;

		// If identifier is not an email, look up the email from profile
		if (!isEmail(identifier)) {
			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('email')
				.eq('username', identifier)
				.single();

			if (profileError || !profile?.email) {
				return { error: 'Invalid username or password' };
			}

			email = profile.email;
		}

		const { error: authError } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (authError) {
			logger.error('Login error', authError);

			// Check if the error is due to unconfirmed email
			if (authError.message?.includes('Email not confirmed')) {
				return {
					error: 'Please verify your email address before signing in.',
					emailNotConfirmed: true,
				};
			}

			return { error: 'Invalid credentials' };
		}

		logger.info('User logged in successfully', { identifier });
		return {};
	} catch (error) {
		logger.error('Login error', error);
		return { error: 'An unexpected error occurred' };
	}
}

/**
 * Logout current user
 */
export async function logout(): Promise<AuthActionResult> {
	try {
		const { error } = await supabase.auth.signOut();

		if (error) {
			logger.error('Logout error', error);
			return { error: error.message };
		}

		logger.info('User logged out successfully');
		return {};
	} catch (error) {
		logger.error('Logout error', error);
		return { error: 'An unexpected error occurred' };
	}
}

/**
 * Resend confirmation email to user
 */
export async function resendConfirmationEmail(
	email: string
): Promise<AuthActionResult> {
	try {
		const { error } = await supabase.auth.resend({
			type: 'signup',
			email,
		});

		if (error) {
			logger.error('Resend confirmation email error', error);
			return { error: error.message };
		}

		logger.info('Confirmation email resent successfully', { email });
		return {};
	} catch (error) {
		logger.error('Resend confirmation email error', error);
		return { error: 'An unexpected error occurred' };
	}
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<User | null> {
	try {
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (!session?.user) {
			return null;
		}

		const authUser = session.user;

		// Get profile with username
		const { data: profile } = await supabase
			.from('profiles')
			.select('username, created_at')
			.eq('id', authUser.id)
			.single();

		if (!profile) {
			logger.warn('User has no profile', { userId: authUser.id });
			return null;
		}

		return {
			id: authUser.id as UserId,
			email: authUser.email ?? '',
			username: profile.username,
			createdAt: new Date(profile.created_at),
		};
	} catch (error) {
		logger.error('Get current user error', error);
		return null;
	}
}
