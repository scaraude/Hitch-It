import * as Crypto from 'expo-crypto';
import type { CachedJourneyId, JourneyId } from '../../types';

export const generateCachedJourneyId = (): CachedJourneyId =>
	Crypto.randomUUID() as CachedJourneyId;

/**
 * A cache row's id is reused as the persisted journey's id at finalization
 * time, so the two branded types refer to the same underlying value. These
 * helpers are the single sanctioned bridge between them.
 */
export const cachedIdAsJourneyId = (id: CachedJourneyId): JourneyId =>
	id as unknown as JourneyId;

export const journeyIdAsCachedId = (id: JourneyId): CachedJourneyId =>
	id as unknown as CachedJourneyId;
