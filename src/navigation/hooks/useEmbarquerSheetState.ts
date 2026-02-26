import { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard } from 'react-native';
import type { Location } from '../../types';
import type { AddressData } from '../components/embarquerSheetTypes';

const MY_POSITION_NAME = 'My position';
const SHEET_SLIDE_OFFSET = -36;

interface UseEmbarquerSheetStateArgs {
	initialStart?: AddressData;
	initialDestination?: AddressData;
	currentPosition: Location | null;
	onStart: (start: AddressData, destination: AddressData) => void;
}

interface UseEmbarquerSheetStateReturn {
	startText: string;
	startLocation: Location | null;
	destinationText: string;
	destinationLocation: Location | null;
	isStartFromCurrentPosition: boolean;
	isDestinationFromCurrentPosition: boolean;
	canStart: boolean;
	hasCurrentPosition: boolean;
	slideValue: Animated.Value;
	opacityValue: Animated.Value;
	onStartTextChange: (text: string) => void;
	onDestinationTextChange: (text: string) => void;
	onStartLocationSelected: (location: Location, name: string) => void;
	onDestinationSelected: (location: Location, name: string) => void;
	onUseCurrentPositionForStart: () => void;
	onUseCurrentPositionForDestination: () => void;
	onSwapLocations: () => void;
	onStartNavigation: () => void;
}

export const useEmbarquerSheetState = ({
	initialStart,
	initialDestination,
	currentPosition,
	onStart,
}: UseEmbarquerSheetStateArgs): UseEmbarquerSheetStateReturn => {
	const shouldDefaultStartToCurrentPosition =
		initialStart === undefined && currentPosition !== null;
	const [startText, setStartText] = useState(
		initialStart?.name ??
			(shouldDefaultStartToCurrentPosition ? MY_POSITION_NAME : '')
	);
	const [startLocation, setStartLocation] = useState<Location | null>(
		initialStart?.location ?? currentPosition
	);
	const [destinationText, setDestinationText] = useState(
		initialDestination?.name ?? ''
	);
	const [destinationLocation, setDestinationLocation] =
		useState<Location | null>(initialDestination?.location ?? null);
	const [isStartFromCurrentPosition, setIsStartFromCurrentPosition] = useState(
		shouldDefaultStartToCurrentPosition
	);
	const [
		isDestinationFromCurrentPosition,
		setIsDestinationFromCurrentPosition,
	] = useState(false);
	const startSelectionRef = useRef(false);
	const destinationSelectionRef = useRef(false);
	const slideValue = useRef(new Animated.Value(SHEET_SLIDE_OFFSET)).current;
	const opacityValue = useRef(new Animated.Value(0)).current;

	const canStart = startLocation !== null && destinationLocation !== null;
	const hasCurrentPosition = currentPosition !== null;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(slideValue, {
				toValue: 0,
				duration: 220,
				useNativeDriver: true,
			}),
			Animated.timing(opacityValue, {
				toValue: 1,
				duration: 220,
				useNativeDriver: true,
			}),
		]).start();
	}, [opacityValue, slideValue]);

	useEffect(() => {
		if (currentPosition === null) {
			return;
		}

		if (startLocation !== null || startText.trim().length > 0) {
			return;
		}

		setIsStartFromCurrentPosition(true);
		setStartLocation(currentPosition);
		setStartText(MY_POSITION_NAME);
		Keyboard.dismiss();
	}, [currentPosition, startLocation, startText]);

	const handleStartLocationSelected = (location: Location, name: string) => {
		startSelectionRef.current = true;
		setStartLocation(location);
		setStartText(name);
	};

	const handleDestinationSelected = (location: Location, name: string) => {
		destinationSelectionRef.current = true;
		setDestinationLocation(location);
		setDestinationText(name);
	};

	const handleStartTextChange = (text: string) => {
		setIsStartFromCurrentPosition(false);
		setStartText(text);

		if (startSelectionRef.current) {
			startSelectionRef.current = false;
			return;
		}

		setStartLocation(null);
	};

	const handleDestinationTextChange = (text: string) => {
		setIsDestinationFromCurrentPosition(false);
		setDestinationText(text);

		if (destinationSelectionRef.current) {
			destinationSelectionRef.current = false;
			return;
		}

		setDestinationLocation(null);
	};

	const handleUseCurrentPositionForStart = () => {
		if (currentPosition === null) {
			return;
		}

		setIsStartFromCurrentPosition(true);
		setStartLocation(currentPosition);
		setStartText(MY_POSITION_NAME);
		Keyboard.dismiss();
	};

	const handleUseCurrentPositionForDestination = () => {
		if (currentPosition === null) {
			return;
		}

		setIsDestinationFromCurrentPosition(true);
		setDestinationLocation(currentPosition);
		setDestinationText(MY_POSITION_NAME);
		Keyboard.dismiss();
	};

	const handleSwapLocations = () => {
		setStartText(destinationText);
		setStartLocation(destinationLocation);
		setDestinationText(startText);
		setDestinationLocation(startLocation);
		setIsStartFromCurrentPosition(isDestinationFromCurrentPosition);
		setIsDestinationFromCurrentPosition(isStartFromCurrentPosition);
		Keyboard.dismiss();
	};

	const handleStart = () => {
		if (startLocation === null || destinationLocation === null) {
			return;
		}

		onStart(
			{ location: startLocation, name: startText },
			{ location: destinationLocation, name: destinationText }
		);
	};

	return {
		startText,
		startLocation,
		destinationText,
		destinationLocation,
		isStartFromCurrentPosition,
		isDestinationFromCurrentPosition,
		canStart,
		hasCurrentPosition,
		slideValue,
		opacityValue,
		onStartTextChange: handleStartTextChange,
		onDestinationTextChange: handleDestinationTextChange,
		onStartLocationSelected: handleStartLocationSelected,
		onDestinationSelected: handleDestinationSelected,
		onUseCurrentPositionForStart: handleUseCurrentPositionForStart,
		onUseCurrentPositionForDestination: handleUseCurrentPositionForDestination,
		onSwapLocations: handleSwapLocations,
		onStartNavigation: handleStart,
	};
};
