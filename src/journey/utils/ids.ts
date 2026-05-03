import * as Crypto from 'expo-crypto';
import type { JourneyId, JourneyStopId } from '../types';

export const generateJourneyId = (): JourneyId =>
	Crypto.randomUUID() as JourneyId;

export const generateJourneyStopId = (): JourneyStopId =>
	Crypto.randomUUID() as JourneyStopId;
