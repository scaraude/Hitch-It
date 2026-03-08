const dotenv = require('dotenv');

dotenv.config();

module.exports = ({ config }) => ({
	...config,
	android: {
		...config.android,
		config: {
			...config.android?.config,
			googleMaps: {
				apiKey: process.env.GOOGLE_MAPS_API_KEY,
			},
		},
	},
	extra: {
		...config.extra,
		supabaseUrl: process.env.SUPABASE_URL,
		supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
		orsApiKey: process.env.EXPO_PUBLIC_ORS_API_KEY || process.env.ORS_API_KEY,
	},
});
