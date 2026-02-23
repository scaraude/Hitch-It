import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import type React from 'react';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { ErrorBoundary } from './src/components';
import { JourneyProvider } from './src/journey';
import { RootNavigator } from './src/navigation';
import { logger } from './src/utils';

const FEATURE_JOURNEY_ENABLED = false;
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
		<ErrorBoundary>
			{FEATURE_JOURNEY_ENABLED ? (
				<JourneyProvider>
					<StatusBar style="dark" />
					<RootNavigator />
				</JourneyProvider>
			) : (
				<>
					<StatusBar style="dark" />
					<RootNavigator />
				</>
			)}
		</ErrorBoundary>
	);
};

export default App;
