import { StatusBar } from 'expo-status-bar';
import type React from 'react';
import { useEffect } from 'react';
import { ErrorBoundary } from './src/components';
import { JourneyProvider } from './src/journey';
import { RootNavigator } from './src/navigation';
import { logger } from './src/utils';

const FEATURE_JOURNEY_ENABLED = false;
const App: React.FC = () => {
	useEffect(() => {
		logger.app.info('App initialized');
		return () => {
			logger.app.info('App unmounting');
		};
	}, []);

	return (
		<ErrorBoundary>
			{FEATURE_JOURNEY_ENABLED ? (
				<JourneyProvider>
					<StatusBar style="light" />
					<RootNavigator />
				</JourneyProvider>
			) : (
				<>
					<StatusBar style="light" />
					<RootNavigator />
				</>
			)}
		</ErrorBoundary>
	);
};

export default App;
