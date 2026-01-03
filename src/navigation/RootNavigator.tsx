import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type React from 'react';
import { HomeScreen } from '../screens';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigation stack
 * Manages the main navigation flow of the app
 */
export const RootNavigator: React.FC = () => (
	<NavigationContainer>
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="Home" component={HomeScreen} />
			{/* Future screens */}
			{/* <Stack.Screen name="SpotDetails" component={SpotDetailsScreen} /> */}
			{/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
		</Stack.Navigator>
	</NavigationContainer>
);
