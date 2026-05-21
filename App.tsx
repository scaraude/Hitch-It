import {
	Fredoka_500Medium,
	Fredoka_600SemiBold,
} from '@expo-google-fonts/fredoka';
import {
	NunitoSans_400Regular,
	NunitoSans_500Medium,
	NunitoSans_600SemiBold,
	NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans';
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import type React from 'react';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/auth';
import { ErrorBoundary } from './src/components';
import { COLORS } from './src/constants';
import { initializeLanguage } from './src/i18n';
import { RootNavigator } from './src/navigation';
import { logger } from './src/utils';

const App: React.FC = () => {
	const [fontsLoaded, fontError] = useFonts({
		Fredoka_500Medium,
		Fredoka_600SemiBold,
		NunitoSans_400Regular,
		NunitoSans_500Medium,
		NunitoSans_600SemiBold,
		NunitoSans_700Bold,
	});

	if (fontError) {
		logger.app.error('Failed to load brand fonts:', fontError);
	}

	useEffect(() => {
		logger.app.info('App initialized');

		initializeLanguage().catch(error => {
			logger.app.warn('Failed to initialize language:', error);
		});

		if (Platform.OS === 'android') {
			NavigationBar.setBackgroundColorAsync('#FFFFFF');
			NavigationBar.setButtonStyleAsync('dark');
		}

		return () => {
			logger.app.info('App unmounting');
		};
	}, []);

	if (!fontsLoaded && !fontError) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: COLORS.background,
				}}
			>
				<ActivityIndicator color={COLORS.accent} />
			</View>
		);
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ErrorBoundary>
				<AuthProvider>
					<StatusBar style="dark" />
					<RootNavigator />
				</AuthProvider>
			</ErrorBoundary>
		</GestureHandlerRootView>
	);
};

export default App;
