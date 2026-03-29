import { useMemo } from 'react';
import { getNearbyTransit } from '../services/transitService';
import type { NearbyTransitSummary } from '../types/transit';

/**
 * Hook to compute nearby transit options from a lat/lng
 */
export function useNearbyTransit(lat: number | null, lng: number | null): NearbyTransitSummary | null {
  return useMemo(() => {
    if (lat === null || lng === null) return null;
    return getNearbyTransit(lat, lng);
  }, [lat, lng]);
}
