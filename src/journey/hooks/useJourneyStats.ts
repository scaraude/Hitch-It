import { useEffect, useState } from 'react';
import * as journeyRepository from '../services/journeyRepository';
import type { UserId } from '../types';
import { JourneyStatus } from '../types';

export interface JourneyStats {
	totalJourneys: number;
	totalDistanceKm: number;
	totalVehicles: number;
	totalCountries: number;
	isLoading: boolean;
	error: Error | null;
}

const INITIAL_STATS: JourneyStats = {
	totalJourneys: 0,
	totalDistanceKm: 0,
	totalVehicles: 0,
	totalCountries: 0,
	isLoading: true,
	error: null,
};

/**
 * Hook to compute user journey statistics
 * Note: Vehicle count and country count are placeholder logic
 * In future, these should be tracked as journey metadata
 */
export const useJourneyStats = (userId: UserId | null): JourneyStats => {
	const [stats, setStats] = useState<JourneyStats>(INITIAL_STATS);

	useEffect(() => {
		if (!userId) {
			setStats(INITIAL_STATS);
			return;
		}

		let isMounted = true;

		const loadStats = async () => {
			try {
				setStats(prev => ({ ...prev, isLoading: true, error: null }));

				const journeys = await journeyRepository.getJourneysByUserId(userId);

				// Filter only completed journeys for stats
				const completedJourneys = journeys.filter(
					j => j.status === JourneyStatus.Completed
				);

				// Sum total distance
				const totalDistanceKm = completedJourneys.reduce((sum, journey) => {
					return sum + (journey.totalDistanceKm ?? 0);
				}, 0);

				// TODO: Implement vehicle counting logic
				// For now, estimate based on journey count (placeholder)
				const totalVehicles = completedJourneys.length;

				// TODO: Implement country tracking
				// For now, hardcode to 1 (placeholder)
				const totalCountries = completedJourneys.length > 0 ? 1 : 0;

				if (isMounted) {
					setStats({
						totalJourneys: completedJourneys.length,
						totalDistanceKm: Math.round(totalDistanceKm),
						totalVehicles,
						totalCountries,
						isLoading: false,
						error: null,
					});
				}
			} catch (error) {
				if (isMounted) {
					setStats(prev => ({
						...prev,
						isLoading: false,
						error:
							error instanceof Error
								? error
								: new Error('Failed to load stats'),
					}));
				}
			}
		};

		loadStats();

		return () => {
			isMounted = false;
		};
	}, [userId]);

	return stats;
};
