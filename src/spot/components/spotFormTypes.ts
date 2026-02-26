import type { SpotFormData } from '../spotFormTypes';

export interface SpotFormProps {
	onSubmit: (data: SpotFormData) => void;
	onCancel: () => void;
}
