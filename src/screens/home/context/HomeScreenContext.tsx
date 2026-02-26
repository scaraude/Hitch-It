import type React from 'react';
import { createContext, useContext } from 'react';
import type { HomeScreenViewModel } from '../types';

const HomeScreenContext = createContext<HomeScreenViewModel | undefined>(
	undefined
);

interface HomeScreenContextProviderProps {
	children: React.ReactNode;
	value: HomeScreenViewModel;
}

export const HomeScreenContextProvider: React.FC<
	HomeScreenContextProviderProps
> = ({ children, value }) => {
	return (
		<HomeScreenContext.Provider value={value}>
			{children}
		</HomeScreenContext.Provider>
	);
};

export const useHomeScreenContext = (): HomeScreenViewModel => {
	const context = useContext(HomeScreenContext);
	if (!context) {
		throw new Error(
			'useHomeScreenContext must be used within HomeScreenContextProvider'
		);
	}

	return context;
};
