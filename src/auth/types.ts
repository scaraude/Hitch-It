import type { UserId } from '../journey/types';

// Re-export UserId for convenience within auth module
export type { UserId } from '../journey/types';

/**
 * User profile information
 */
export interface User {
	id: UserId;
	email: string;
	username: string;
	createdAt: Date;
}

/**
 * Auth state
 */
export interface AuthState {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
}

export interface AuthActionResult {
	error?: string;
	emailNotConfirmed?: boolean;
}

/**
 * Sign up credentials
 */
export interface SignUpCredentials {
	username: string;
	email: string;
	password: string;
}

/**
 * Login credentials - can use either username or email
 */
export interface LoginCredentials {
	identifier: string; // username or email
	password: string;
}

/**
 * Auth context value
 */
export interface AuthContextValue extends AuthState {
	signUp: (credentials: SignUpCredentials) => Promise<AuthActionResult>;
	login: (credentials: LoginCredentials) => Promise<AuthActionResult>;
	logout: () => Promise<AuthActionResult>;
	resendConfirmationEmail: (email: string) => Promise<AuthActionResult>;
}
