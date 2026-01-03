import { StatusBar } from 'expo-status-bar';
import type React from 'react';
import { useEffect } from 'react';
import { ErrorBoundary } from './src/components';
import { JourneyProvider } from './src/journey';
import { RootNavigator } from './src/navigation';
import { SpotProvider } from './src/spot/context';
import { logger } from './src/utils';

const App: React.FC = () => {
	useEffect(() => {
		logger.app.info('App initialized');
		return () => {
			logger.app.info('App unmounting');
		};
	}, []);

	return (
		<ErrorBoundary>
			<SpotProvider>
				<JourneyProvider>
					<StatusBar style="light" />
					<RootNavigator />
				</JourneyProvider>
			</SpotProvider>
		</ErrorBoundary>
	);
};

export default App;
