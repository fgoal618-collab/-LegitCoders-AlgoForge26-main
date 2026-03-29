// ─── Core Transit Types ───────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export type TransitLineType = 'central' | 'western' | 'metro';
export type TransitMode = 'train' | 'metro' | 'bus' | 'auto' | 'cab' | 'walk' | 'bike';

// ─── Stations (Train / Metro) ─────────────────────────────────

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  line: string;
  lineColor: string;
  zone: number;
  type: 'train' | 'metro';
}

export interface TransitLine {
  id: string;
  name: string;
  color: string;
  icon: string;
  stations: Station[];
  type: 'train' | 'metro';
  avgSpeed: number;
  baseFare: number;
  perKmFare: number;
}

// ─── Bus (BEST GTFS) ─────────────────────────────────────────

export interface BusStop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  area: string;
  road: string;
}

export interface BusRoute {
  id: string;
  shortName: string;
  longName: string;
  from: string;
  to: string;
  stopIds?: number[];
}

// ─── Nearby Results ───────────────────────────────────────────

export interface NearbyResult<T> {
  item: T;
  distance: number; // km
}

// ─── Route Planning ───────────────────────────────────────────

export interface RouteLeg {
  mode: TransitMode;
  from: string;
  to: string;
  line: string;
  lineColor: string;
  duration: number; // minutes
  distance: number; // km
  cost: number;     // INR
  stops: number;
  waitTime: number; // minutes
  icon: string;
}

export type RouteType = 'fastest' | 'cheapest' | 'balanced' | 'comfortable';

export interface TransitRoute {
  id: string;
  type: RouteType;
  name: string;
  from: string;
  to: string;
  fromCoords: Coordinates;
  toCoords: Coordinates;
  distance: number;
  timeMinutes: number;
  cost: number;
  costRange: string;
  savings: number;
  recommended: boolean;
  legs: RouteLeg[];
}

export interface RouteResult {
  routes: TransitRoute[];
  from: string;
  to: string;
}

// ─── Saved Trips ──────────────────────────────────────────────

export interface SavedTrip {
  id: string;
  originName: string;
  originCoords: Coordinates;
  destinationName: string;
  destinationCoords: Coordinates;
  selectedRoute: TransitRoute | null;
  travelMode: string;
  timestamp: number;
}

// ─── Place Info (Google Places) ───────────────────────────────

export interface PlaceInfo {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

// ─── Nearby Transit Summary ──────────────────────────────────

export interface NearbyTransitSummary {
  busStops: NearbyResult<BusStop>[];
  busRoutes: { route: BusRoute; nearestStop: BusStop; distance: number }[];
  trainStations: NearbyResult<Station>[];
  metroStations: NearbyResult<Station>[];
}
