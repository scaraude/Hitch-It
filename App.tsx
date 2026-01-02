import { StatusBar } from 'expo-status-bar';
import type React from 'react';
import { ErrorBoundary } from './src/components';
import { HomeScreen } from './src/screens';
import { SpotProvider } from './src/spot/context';

const App: React.FC = () => {
	return (
		<ErrorBoundary>
			<SpotProvider>
				<StatusBar style="light" />
				<HomeScreen />
			</SpotProvider>
		</ErrorBoundary>
	);
};

export default App;
