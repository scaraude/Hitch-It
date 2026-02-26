import { useCallback, useMemo, useState } from 'react';
import type { CommentAppreciation } from '../../comment/types';
import type { SpotFormData } from '../spotFormTypes';
import type { Direction } from '../types';

interface UseSpotFormParams {
	onSubmit: (data: SpotFormData) => void;
}

interface UseSpotFormReturn {
	appreciation: CommentAppreciation | undefined;
	comment: string;
	roadName: string;
	direction: Direction | undefined;
	destinationInput: string;
	destinations: string[];
	isFormValid: boolean;
	onAppreciationChange: (value: CommentAppreciation | undefined) => void;
	onCommentChange: (value: string) => void;
	onRoadNameChange: (value: string) => void;
	onDirectionChange: (value: Direction) => void;
	onDestinationInputChange: (value: string) => void;
	onAddDestination: () => void;
	onRemoveDestination: (index: number) => void;
	onSubmitForm: () => void;
}

const normalizeDestination = (destination: string): string => {
	return destination.trim().toLowerCase();
};

const isDestinationInList = (
	destinations: string[],
	candidate: string
): boolean => {
	const normalizedCandidate = normalizeDestination(candidate);
	return destinations.some(
		destination => normalizeDestination(destination) === normalizedCandidate
	);
};

export const useSpotForm = ({
	onSubmit,
}: UseSpotFormParams): UseSpotFormReturn => {
	const [appreciation, setAppreciation] = useState<
		CommentAppreciation | undefined
	>(undefined);
	const [comment, setComment] = useState('');
	const [roadName, setRoadName] = useState('');
	const [direction, setDirection] = useState<Direction | undefined>(undefined);
	const [destinationInput, setDestinationInput] = useState('');
	const [destinations, setDestinations] = useState<string[]>([]);

	const isFormValid = useMemo(
		() =>
			roadName.trim().length > 0 &&
			direction !== undefined &&
			destinations.length > 0 &&
			appreciation !== undefined &&
			comment.trim().length > 0,
		[appreciation, comment, destinations.length, direction, roadName]
	);

	const handleAddDestination = useCallback(() => {
		const trimmedDestination = destinationInput.trim();
		if (!trimmedDestination) {
			return;
		}

		setDestinations(previous =>
			isDestinationInList(previous, trimmedDestination)
				? previous
				: [...previous, trimmedDestination]
		);
		setDestinationInput('');
	}, [destinationInput]);

	const handleRemoveDestination = useCallback((index: number) => {
		setDestinations(previous => previous.filter((_, i) => i !== index));
	}, []);

	const handleSubmit = useCallback(() => {
		if (!isFormValid || direction === undefined || appreciation === undefined) {
			return;
		}

		onSubmit({
			appreciation,
			comment: comment.trim(),
			roadName: roadName.trim(),
			direction,
			destinations,
		});
	}, [
		appreciation,
		comment,
		destinations,
		direction,
		isFormValid,
		onSubmit,
		roadName,
	]);

	return {
		appreciation,
		comment,
		roadName,
		direction,
		destinationInput,
		destinations,
		isFormValid,
		onAppreciationChange: setAppreciation,
		onCommentChange: setComment,
		onRoadNameChange: setRoadName,
		onDirectionChange: setDirection,
		onDestinationInputChange: setDestinationInput,
		onAddDestination: handleAddDestination,
		onRemoveDestination: handleRemoveDestination,
		onSubmitForm: handleSubmit,
	};
};
