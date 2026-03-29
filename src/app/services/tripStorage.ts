// Trip Storage — localStorage-backed saved trips
import type { SavedTrip } from '../types/transit';
import { STORAGE_KEYS } from '../utils/constants';

function getTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.savedTrips);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persist(trips: SavedTrip[]) {
  localStorage.setItem(STORAGE_KEYS.savedTrips, JSON.stringify(trips));
}

export function saveTrip(trip: Omit<SavedTrip, 'id' | 'timestamp'>): SavedTrip {
  const saved: SavedTrip = { ...trip, id: `trip-${Date.now()}`, timestamp: Date.now() };
  const trips = getTrips();
  trips.unshift(saved);
  persist(trips.slice(0, 50)); // keep last 50
  return saved;
}

export function getSavedTrips(): SavedTrip[] {
  return getTrips().sort((a, b) => b.timestamp - a.timestamp);
}

export function deleteTrip(id: string) {
  persist(getTrips().filter(t => t.id !== id));
}

export function clearAllTrips() {
  localStorage.removeItem(STORAGE_KEYS.savedTrips);
}
