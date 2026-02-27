import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { supabase } from '../../lib/supabaseClient';
import * as authService from '../services/authService';
import type {
	AuthContextValue,
	LoginCredentials,
	SignUpCredentials,
	User,
} from '../types';

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Load initial session
		const loadSession = async () => {
			const currentUser = await authService.getCurrentUser();
			setUser(currentUser);
			setIsLoading(false);
		};

		loadSession();

		// Subscribe to auth state changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async event => {
			if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
				const currentUser = await authService.getCurrentUser();
				setUser(currentUser);
			} else if (event === 'SIGNED_OUT') {
				setUser(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const signUp = async (credentials: SignUpCredentials) => {
		const result = await authService.signUp(credentials);
		if (!result.error) {
			const currentUser = await authService.getCurrentUser();
			setUser(currentUser);
		}
		return result;
	};

	const login = async (credentials: LoginCredentials) => {
		const result = await authService.login(credentials);
		if (!result.error) {
			const currentUser = await authService.getCurrentUser();
			setUser(currentUser);
		}
		return result;
	};

	const logout = async () => {
		const result = await authService.logout();
		if (!result.error) {
			setUser(null);
		}
		return result;
	};

	const resendConfirmationEmail = async (email: string) => {
		return authService.resendConfirmationEmail(email);
	};

	const sendPasswordResetEmail = async (email: string) => {
		return authService.sendPasswordResetEmail(email);
	};

	const updatePassword = async (newPassword: string) => {
		return authService.updatePassword(newPassword);
	};

	const value: AuthContextValue = {
		user,
		isLoading,
		isAuthenticated: user !== null,
		signUp,
		login,
		logout,
		resendConfirmationEmail,
		sendPasswordResetEmail,
		updatePassword,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
