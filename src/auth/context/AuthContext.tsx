import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { Linking } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import * as authService from '../services/authService';
import type {
	AuthContextValue,
	AuthDeepLinkState,
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
	const [authDeepLinkState, setAuthDeepLinkState] = useState<AuthDeepLinkState>(
		{
			status: 'idle',
			intent: null,
			url: null,
			error: null,
		}
	);
	const lastHandledUrlRef = useRef<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const handleIncomingUrl = async (url: string) => {
			if (!url || lastHandledUrlRef.current === url) {
				return;
			}

			const parsedLink = authService.parseAuthDeepLink(url);
			if (!parsedLink) {
				return;
			}

			lastHandledUrlRef.current = url;
			setAuthDeepLinkState({
				status: 'processing',
				intent: parsedLink.intent,
				url,
				error: null,
			});

			const result = await authService.handleAuthDeepLink(url);
			if (!result) {
				lastHandledUrlRef.current = null;
				setAuthDeepLinkState({
					status: 'idle',
					intent: null,
					url: null,
					error: null,
				});
				return;
			}

			if (!isMounted) {
				return;
			}

			setAuthDeepLinkState({
				status: result.status,
				intent: result.intent,
				url: result.url,
				error: result.error ?? null,
			});
		};

		const bootstrapAuth = async () => {
			const initialUrl = await Linking.getInitialURL();
			if (initialUrl) {
				await handleIncomingUrl(initialUrl);
			}

			const currentUser = await authService.getCurrentUser();
			if (!isMounted) {
				return;
			}
			setUser(currentUser);
			setIsLoading(false);
		};

		bootstrapAuth();

		// Subscribe to auth state changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async event => {
			if (
				event === 'SIGNED_IN' ||
				event === 'TOKEN_REFRESHED' ||
				event === 'PASSWORD_RECOVERY' ||
				event === 'USER_UPDATED'
			) {
				const currentUser = await authService.getCurrentUser();
				if (isMounted) {
					setUser(currentUser);
				}
			} else if (event === 'SIGNED_OUT') {
				if (isMounted) {
					setUser(null);
				}
			}
		});

		const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
			void handleIncomingUrl(url);
		});

		return () => {
			isMounted = false;
			subscription.unsubscribe();
			linkingSubscription.remove();
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

	const clearAuthDeepLinkState = () => {
		setAuthDeepLinkState({
			status: 'idle',
			intent: null,
			url: null,
			error: null,
		});
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
		authDeepLinkState,
		clearAuthDeepLinkState,
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
