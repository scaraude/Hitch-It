import { StatusBar } from 'expo-status-bar';
import type React from 'react';
import { ErrorBoundary } from './src/components';
import { RootNavigator } from './src/navigation';
import { SpotProvider } from './src/spot/context';

const App: React.FC = () => {
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
