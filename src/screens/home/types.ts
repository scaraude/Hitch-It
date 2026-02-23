import type { Location } from '../../types';

export type HomeTabId = 'home' | 'search' | 'add' | 'history' | 'profile';

export interface NamedLocation {
	location: Location;
	name: string;
}
