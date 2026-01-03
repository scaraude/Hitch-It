import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

type ExpoExtra = {
	supabaseUrl?: string;
	supabaseAnonKey?: string;
};

const extra = (Constants.expoConfig?.extra ??
	Constants.manifest?.extra ??
	{}) as ExpoExtra;

const supabaseUrl = extra.supabaseUrl;
const supabaseAnonKey = extra.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.'
	);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
		detectSessionInUrl: false,
	},
});
