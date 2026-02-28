import * as Crypto from 'expo-crypto';
import { useCallback, useMemo, useReducer } from 'react';
import type { RoutePoint } from '../../navigation/types';
import type { Location } from '../../types';
/**
 * Steps in the manual journey entry flow
 */
export enum ManualJourneyStep {
	SelectStart = 1,
	SelectEnd = 2,
	AddStops = 3,
}

/**
 * A stop point with optional metadata
 */
export interface ManualStop {
	id: string;
	location: Location;
	waitTimeMinutes?: number;
	notes?: string;
}

/**
 * State for the manual journey entry flow
 */
interface ManualJourneyState {
	currentStep: ManualJourneyStep;
	startLocation: Location | null;
	startName: string;
	endLocation: Location | null;
	endName: string;
	stops: ManualStop[];
	selectedStopId: string | null;
	title: string;
	notes: string;
	isSaving: boolean;
	// Route data
	routePolyline: RoutePoint[] | null;
	routeDistanceKm: number | null;
	isLoadingRoute: boolean;
	routeError: string | null;
}

type ManualJourneyAction =
	| { type: 'SET_START'; location: Location; name: string }
	| { type: 'SET_END'; location: Location; name: string }
	| { type: 'ADD_STOP'; stop: ManualStop }
	| { type: 'UPDATE_STOP'; id: string; updates: Partial<ManualStop> }
	| { type: 'REMOVE_STOP'; id: string }
	| { type: 'SELECT_STOP'; id: string | null }
	| { type: 'SET_TITLE'; title: string }
	| { type: 'SET_NOTES'; notes: string }
	| { type: 'GO_TO_STEP'; step: ManualJourneyStep }
	| { type: 'GO_BACK' }
	| { type: 'SET_SAVING'; isSaving: boolean }
	| { type: 'SET_ROUTE_LOADING'; isLoading: boolean }
	| {
			type: 'SET_ROUTE';
			polyline: RoutePoint[];
			distanceKm: number;
	  }
	| { type: 'SET_ROUTE_ERROR'; error: string }
	| { type: 'RESET' };

const initialState: ManualJourneyState = {
	currentStep: ManualJourneyStep.SelectStart,
	startLocation: null,
	startName: '',
	endLocation: null,
	endName: '',
	stops: [],
	selectedStopId: null,
	title: '',
	notes: '',
	isSaving: false,
	routePolyline: null,
	routeDistanceKm: null,
	isLoadingRoute: false,
	routeError: null,
};

function reducer(
	state: ManualJourneyState,
	action: ManualJourneyAction
): ManualJourneyState {
	switch (action.type) {
		case 'SET_START':
			return {
				...state,
				startLocation: action.location,
				startName: action.name,
				currentStep: ManualJourneyStep.SelectEnd,
			};
		case 'SET_END':
			return {
				...state,
				endLocation: action.location,
				endName: action.name,
				currentStep: ManualJourneyStep.AddStops,
			};
		case 'ADD_STOP':
			return {
				...state,
				stops: [...state.stops, action.stop],
				selectedStopId: action.stop.id,
			};
		case 'UPDATE_STOP':
			return {
				...state,
				stops: state.stops.map(stop =>
					stop.id === action.id ? { ...stop, ...action.updates } : stop
				),
			};
		case 'REMOVE_STOP':
			return {
				...state,
				stops: state.stops.filter(stop => stop.id !== action.id),
				selectedStopId:
					state.selectedStopId === action.id ? null : state.selectedStopId,
			};
		case 'SELECT_STOP':
			return {
				...state,
				selectedStopId: action.id,
			};
		case 'SET_TITLE':
			return {
				...state,
				title: action.title,
			};
		case 'SET_NOTES':
			return {
				...state,
				notes: action.notes,
			};
		case 'GO_TO_STEP':
			return {
				...state,
				currentStep: action.step,
			};
		case 'GO_BACK':
			if (state.currentStep === ManualJourneyStep.SelectStart) {
				return state;
			}
			return {
				...state,
				currentStep: state.currentStep - 1,
				selectedStopId: null,
			};
		case 'SET_SAVING':
			return {
				...state,
				isSaving: action.isSaving,
			};
		case 'SET_ROUTE_LOADING':
			return {
				...state,
				isLoadingRoute: action.isLoading,
				routeError: action.isLoading ? null : state.routeError,
			};
		case 'SET_ROUTE':
			return {
				...state,
				routePolyline: action.polyline,
				routeDistanceKm: action.distanceKm,
				isLoadingRoute: false,
				routeError: null,
			};
		case 'SET_ROUTE_ERROR':
			return {
				...state,
				isLoadingRoute: false,
				routeError: action.error,
			};
		case 'RESET':
			return initialState;
		default:
			return state;
	}
}

/**
 * Hook for managing the manual journey entry flow state
 */
export function useManualJourneyFlow() {
	const [state, dispatch] = useReducer(reducer, initialState);

	const setStart = useCallback((location: Location, name: string) => {
		dispatch({ type: 'SET_START', location, name });
	}, []);

	const setEnd = useCallback((location: Location, name: string) => {
		dispatch({ type: 'SET_END', location, name });
	}, []);

	const addStop = useCallback((location: Location) => {
		const stop: ManualStop = {
			id: Crypto.randomUUID(),
			location,
		};
		dispatch({ type: 'ADD_STOP', stop });
	}, []);

	const updateStop = useCallback((id: string, updates: Partial<ManualStop>) => {
		dispatch({ type: 'UPDATE_STOP', id, updates });
	}, []);

	const removeStop = useCallback((id: string) => {
		dispatch({ type: 'REMOVE_STOP', id });
	}, []);

	const selectStop = useCallback((id: string | null) => {
		dispatch({ type: 'SELECT_STOP', id });
	}, []);

	const setTitle = useCallback((title: string) => {
		dispatch({ type: 'SET_TITLE', title });
	}, []);

	const setNotes = useCallback((notes: string) => {
		dispatch({ type: 'SET_NOTES', notes });
	}, []);

	const goToStep = useCallback((step: ManualJourneyStep) => {
		dispatch({ type: 'GO_TO_STEP', step });
	}, []);

	const goBack = useCallback(() => {
		dispatch({ type: 'GO_BACK' });
	}, []);

	const setSaving = useCallback((isSaving: boolean) => {
		dispatch({ type: 'SET_SAVING', isSaving });
	}, []);

	const reset = useCallback(() => {
		dispatch({ type: 'RESET' });
	}, []);

	const setRouteLoading = useCallback((isLoading: boolean) => {
		dispatch({ type: 'SET_ROUTE_LOADING', isLoading });
	}, []);

	const setRoute = useCallback((polyline: RoutePoint[], distanceKm: number) => {
		dispatch({ type: 'SET_ROUTE', polyline, distanceKm });
	}, []);

	const setRouteError = useCallback((error: string) => {
		dispatch({ type: 'SET_ROUTE_ERROR', error });
	}, []);

	const selectedStop = useMemo(() => {
		if (!state.selectedStopId) return null;
		return state.stops.find(s => s.id === state.selectedStopId) ?? null;
	}, [state.selectedStopId, state.stops]);

	const canSave = useMemo(() => {
		return (
			state.startLocation !== null &&
			state.endLocation !== null &&
			!state.isSaving &&
			!state.isLoadingRoute
		);
	}, [
		state.startLocation,
		state.endLocation,
		state.isSaving,
		state.isLoadingRoute,
	]);

	return {
		...state,
		selectedStop,
		canSave,
		setStart,
		setEnd,
		addStop,
		updateStop,
		removeStop,
		selectStop,
		setTitle,
		setNotes,
		goToStep,
		goBack,
		setSaving,
		reset,
		setRouteLoading,
		setRoute,
		setRouteError,
	};
}
