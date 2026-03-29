const dotenv = require('dotenv');

dotenv.config();

const validateEnvVariables = (variable, isRequired) => {
	const envValue = process.env[variable];
	if (!envValue) {
		if (isRequired) {
			throw new Error(`Environment variable not set: ${variable}`);
		} else {
			console.warn(`Warning: Environment variable not set: ${variable}`);
		}
	}
	return envValue;
};

module.exports = ({ config }) => {
	return {
		...config,
		android: {
			...config.android,
			config: {
				...config.android?.config,
				googleMaps: {
					apiKey: validateEnvVariables('GOOGLE_MAPS_API_KEY', false),
				},
			},
		},
	extra: {
		...config.extra,
		supabaseUrl: validateEnvVariables('SUPABASE_URL', true),
		supabaseAnonKey: validateEnvVariables('SUPABASE_ANON_KEY', true),
		orsApiKey: validateEnvVariables('EXPO_PUBLIC_ORS_API_KEY', true),
	},
	};
};
