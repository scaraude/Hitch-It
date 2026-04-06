import {
	createNavigationContainerRef,
	NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type React from 'react';
import { useEffect } from 'react';
import { useAuth } from '../auth';
import {
	ForgotPasswordScreen,
	HomeScreen,
	JourneyDetailScreen,
	JourneyHistoryScreen,
	LoginScreen,
	ManualJourneyEntryScreen,
	ProfileScreen,
	ResetPasswordScreen,
	SignUpScreen,
} from '../screens';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Root navigation stack
 * Manages the main navigation flow of the app
 */
export const RootNavigator: React.FC = () => {
	const { authDeepLinkState } = useAuth();

	useEffect(() => {
		if (!navigationRef.isReady()) {
			return;
		}

		if (
			authDeepLinkState.intent === 'reset-password' &&
			(authDeepLinkState.status === 'verified' ||
				authDeepLinkState.status === 'error')
		) {
			navigationRef.navigate('ResetPassword');
		}
	}, [authDeepLinkState.intent, authDeepLinkState.status]);

	return (
		<NavigationContainer
			ref={navigationRef}
			onReady={() => {
				if (
					authDeepLinkState.intent === 'reset-password' &&
					(authDeepLinkState.status === 'verified' ||
						authDeepLinkState.status === 'error')
				) {
					navigationRef.navigate('ResetPassword');
				}
			}}
		>
			<Stack.Navigator
				screenOptions={{
					headerShown: false,
				}}
			>
				<Stack.Screen name="Home" component={HomeScreen} />
				<Stack.Screen name="Login" component={LoginScreen} />
				<Stack.Screen name="SignUp" component={SignUpScreen} />
				<Stack.Screen name="Profile" component={ProfileScreen} />
				<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
				<Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
				<Stack.Screen name="JourneyHistory" component={JourneyHistoryScreen} />
				<Stack.Screen name="JourneyDetail" component={JourneyDetailScreen} />
				<Stack.Screen
					name="ManualJourneyEntry"
					component={ManualJourneyEntryScreen}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};
