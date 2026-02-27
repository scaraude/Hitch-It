import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import type React from 'react';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/auth';
import { ErrorBoundary } from './src/components';
import { RootNavigator } from './src/navigation';
import { logger } from './src/utils';

const App: React.FC = () => {
	useEffect(() => {
		logger.app.info('App initialized');

		// Configure Android navigation bar
		if (Platform.OS === 'android') {
			NavigationBar.setBackgroundColorAsync('#FFFFFF');
			NavigationBar.setButtonStyleAsync('dark');
		}

		return () => {
			logger.app.info('App unmounting');
		};
	}, []);

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
