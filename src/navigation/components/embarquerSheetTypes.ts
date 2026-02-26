import type { Location } from '../../types';

export interface AddressData {
	location: Location;
	name: string;
}

export interface EmbarquerSheetProps {
	initialStart?: AddressData;
	initialDestination?: AddressData;
	currentPosition?: Location | null;
	onStart: (start: AddressData, destination: AddressData) => void;
	onClose: () => void;
}
