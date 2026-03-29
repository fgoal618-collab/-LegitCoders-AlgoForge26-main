import type { Coordinates } from '../types/transit';

// Mumbai center coordinates
export const MUMBAI_CENTER: Coordinates = { lat: 19.0760, lng: 72.8777 };

// Default map zoom levels
export const MAP_ZOOM = {
  city: 12,
  area: 14,
  station: 16,
} as const;

// Nearby transit search radius (km)
export const SEARCH_RADIUS = {
  busStop: 1.5,
  trainStation: 3.0,
  metroStation: 5.0,
  busRoute: 2.0,
} as const;

// Transit mode colors
export const MODE_COLORS: Record<string, string> = {
  train: '#E53935',
  metro: '#43A047',
  bus: '#FF8F00',
  auto: '#FFA726',
  cab: '#212121',
  walk: '#78909C',
};

// Transit mode icons
export const MODE_ICONS: Record<string, string> = {
  train: '🚆',
  metro: '🚇',
  bus: '🚌',
  auto: '🛺',
  cab: '🚕',
  walk: '🚶',
};

// Line-specific colors
export const LINE_COLORS = {
  central: '#E53935',
  western: '#1E88E5',
  metro1: '#43A047',
} as const;

// Fare structure (INR) — realistic Mumbai pricing
export const FARE = {
  bus: { base: 6, perKm: 1.2 },        // BEST non-AC
  busAC: { base: 10, perKm: 2.5 },     // BEST AC
  train: { base: 5, perKm: 0 },        // slab-based, handled in fare.ts
  metro: { base: 10, perKm: 1.5 },     // Metro Line 1
  auto: { base: 23, perKm: 16 },       // base for first 1.5km, then per-km
  cab: { base: 50, perKm: 14 },        // Ola/Uber mini base
} as const;

// Train fare slabs (Mumbai suburban)
export const TRAIN_FARE_SLABS = [
  { maxKm: 10, fare: 5 },
  { maxKm: 20, fare: 10 },
  { maxKm: 40, fare: 15 },
  { maxKm: Infinity, fare: 20 },
] as const;

// Train frequency (minutes between trains)
export const TRAIN_FREQUENCY = {
  peak: { min: 3, max: 5 },      // 7-11 AM, 5-9 PM
  offPeak: { min: 8, max: 12 },   // rest of day
  metro: { min: 6, max: 8 },
} as const;

// Average speeds (km/h)
export const AVG_SPEED = {
  train: 45,
  metro: 33,
  bus: 15,       // Mumbai traffic reality
  auto: 18,
  cab: 22,
  walk: 4.5,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  savedTrips: 'transittwin_saved_trips',
  recentSearches: 'transittwin_recent_searches',
} as const;
