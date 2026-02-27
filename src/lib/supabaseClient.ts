import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

type ExpoExtra = {
	supabaseUrl?: string;
	supabaseAnonKey?: string;
};

const extra = Constants.expoConfig?.extra as ExpoExtra | undefined;

const supabaseUrl = extra?.supabaseUrl;
const supabaseAnonKey = extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.'
	);
}

/**
 * Secure storage adapter for Supabase Auth
 * Uses expo-secure-store for native platforms
 */
const ExpoSecureStoreAdapter = {
	getItem: (key: string): Promise<string | null> => {
		return SecureStore.getItemAsync(key);
	},
	setItem: (key: string, value: string): Promise<void> => {
		return SecureStore.setItemAsync(key, value);
	},
	removeItem: (key: string): Promise<void> => {
		return SecureStore.deleteItemAsync(key);
	},
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: ExpoSecureStoreAdapter,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});
