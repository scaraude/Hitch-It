import * as Crypto from 'expo-crypto';
import type { SpotId } from '../types';

export const createSpotId = (id: string): SpotId => id as SpotId;
export const generateSpotId = (): SpotId => Crypto.randomUUID() as SpotId;
