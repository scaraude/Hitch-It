import * as Crypto from 'expo-crypto';
import type { CachedJourneyId } from '../../types';

export const generateCachedJourneyId = (): CachedJourneyId =>
	Crypto.randomUUID() as CachedJourneyId;
