import { StatusBar } from 'expo-status-bar';
import type React from 'react';
import { useEffect } from 'react';
import { ErrorBoundary } from './src/components';
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
				<StatusBar style="light" />
				<RootNavigator />
			</SpotProvider>
		</ErrorBoundary>
	);
};

export default App;
