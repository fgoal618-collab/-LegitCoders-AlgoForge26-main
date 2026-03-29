// Transit Service — core transit intelligence
import type {
  Station, BusStop, BusRoute, NearbyResult,
  TransitRoute, RouteResult, NearbyTransitSummary,
} from '../types/transit';
import { allStations, transitLines } from '../data/stations';
import { busStops } from '../data/busStops';
import { busRoutes } from '../data/busRoutes';
import { haversineDistance, round1 } from '../utils/geo';
import { estimateFare, estimateTime, cabFareForDistance, estimateFareRange } from '../utils/fare';
import { SEARCH_RADIUS } from '../utils/constants';

// ─── Nearby Discovery ─────────────────────────────────────────

export function findNearbyBusStops(lat: number, lng: number, radiusKm: number = SEARCH_RADIUS.busStop): NearbyResult<BusStop>[] {
  return busStops
    .map(stop => ({ item: stop, distance: haversineDistance(lat, lng, stop.lat, stop.lng) }))
    .filter(r => r.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

export function findNearbyStations(lat: number, lng: number, type: 'train' | 'metro', radiusKm?: number): NearbyResult<Station>[] {
  const radius = radiusKm ?? (type === 'train' ? SEARCH_RADIUS.trainStation : SEARCH_RADIUS.metroStation);
  return allStations
    .filter(s => s.type === type)
    .map(s => ({ item: s, distance: haversineDistance(lat, lng, s.lat, s.lng) }))
    .filter(r => r.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

export function findNearbyBusRoutes(lat: number, lng: number, radiusKm: number = SEARCH_RADIUS.busRoute) {
  const nearbyStops = findNearbyBusStops(lat, lng, radiusKm);
  const matched: { route: BusRoute; nearestStop: BusStop; distance: number }[] = [];
  const seen = new Set<string>();
  for (const route of busRoutes) {
    if (seen.has(route.id)) continue;
    for (const { item: stop, distance } of nearbyStops) {
      if (route.from.includes(stop.name.split(' ')[0]) || route.to.includes(stop.name.split(' ')[0])) {
        matched.push({ route, nearestStop: stop, distance });
        seen.add(route.id);
        break;
      }
    }
  }
  return matched.sort((a, b) => a.distance - b.distance);
}

export function getNearbyTransit(lat: number, lng: number): NearbyTransitSummary {
  return {
    busStops: findNearbyBusStops(lat, lng).slice(0, 10),
    busRoutes: findNearbyBusRoutes(lat, lng).slice(0, 12),
    trainStations: findNearbyStations(lat, lng, 'train').slice(0, 8),
    metroStations: findNearbyStations(lat, lng, 'metro').slice(0, 6),
  };
}

// ─── Station Lookup ───────────────────────────────────────────

export function findNearestStation(lat: number, lng: number): Station {
  let nearest = allStations[0];
  let minDist = Infinity;
  for (const s of allStations) {
    const d = haversineDistance(lat, lng, s.lat, s.lng);
    if (d < minDist) { minDist = d; nearest = s; }
  }
  return nearest;
}

export function getAllLocations() {
  const seen = new Set<string>();
  return allStations
    .filter(s => { if (seen.has(s.name)) return false; seen.add(s.name); return true; })
    .map(s => ({
      id: s.id, name: s.name, lat: s.lat, lng: s.lng,
      lines: allStations.filter(st => st.name === s.name).map(st => st.line),
    }));
}

// ─── Route Computation ───────────────────────────────────────

export function findTransitRoutes(fromId: string, toId: string): RouteResult {
  const from = allStations.find(s => s.id === fromId);
  const to = allStations.find(s => s.id === toId);
  if (!from || !to) return { routes: [], from: fromId, to: toId };

  const dist = haversineDistance(from.lat, from.lng, to.lat, to.lng);
  const cabCost = cabFareForDistance(dist);
  const routes: TransitRoute[] = [];
  const base = { from: from.name, to: to.name, fromCoords: { lat: from.lat, lng: from.lng }, toCoords: { lat: to.lat, lng: to.lng }, distance: round1(dist) };

  // Direct train/metro
  const fromLines = transitLines.filter(l => l.stations.some(s => s.id === fromId));
  const toLines = transitLines.filter(l => l.stations.some(s => s.id === toId));
  for (const line of fromLines.filter(l => toLines.some(tl => tl.id === l.id))) {
    const stops = Math.abs(line.stations.findIndex(s => s.id === fromId) - line.stations.findIndex(s => s.id === toId));
    const time = estimateTime(line.type, dist, stops);
    const fare = estimateFare(line.type, dist);
    const fareRange = estimateFareRange(line.type, dist);
    routes.push({ ...base, id: `direct-${line.id}`, type: stops <= 5 ? 'fastest' : 'cheapest', name: `${line.name} Direct`,
      timeMinutes: time, cost: fare, costRange: fareRange.display, savings: Math.max(0, cabCost - fare), recommended: stops <= 5,
      legs: [{ mode: line.type, from: from.name, to: to.name, line: line.name, lineColor: line.color, duration: time, distance: round1(dist), cost: fare, stops, waitTime: 3, icon: line.icon }],
    });
  }

  // Bus route
  const fromBus = findNearbyBusStops(from.lat, from.lng, 1.5);
  const toBus = findNearbyBusStops(to.lat, to.lng, 1.5);
  if (fromBus.length > 0 && toBus.length > 0) {
    const busStops = Math.round(dist / 0.5);
    const time = estimateTime('bus', dist, busStops);
    const fare = estimateFare('bus', dist);
    const fareRange = estimateFareRange('bus', dist);
    routes.push({ ...base, id: 'bus-route', type: 'cheapest', name: 'BEST Bus',
      timeMinutes: time, cost: fare, costRange: fareRange.display, savings: Math.max(0, cabCost - fare), recommended: dist < 8,
      legs: [{ mode: 'bus', from: fromBus[0].item.name, to: toBus[0].item.name, line: 'BEST Bus', lineColor: '#FF8F00', duration: time, distance: round1(dist), cost: fare, stops: busStops, waitTime: 8, icon: '🚌' }],
    });
  }

  // Auto + Train combo
  if (dist > 3) {
    let bestLine: any = null;
    let bestToLine: any = null;
    for (const line of transitLines) {
      for (const s of line.stations) {
        const d1 = haversineDistance(from.lat, from.lng, s.lat, s.lng);
        if (!bestLine || d1 < bestLine.dist) bestLine = { line, station: s, dist: d1 };
        const d2 = haversineDistance(to.lat, to.lng, s.lat, s.lng);
        if (!bestToLine || d2 < bestToLine.dist) bestToLine = { line, station: s, dist: d2 };
      }
    }
    if (bestLine && bestToLine) {
      const autoFare = estimateFare('auto', bestLine.dist);
      const trainDist = Math.max(1, dist - bestLine.dist);
      const trainFare = estimateFare(bestLine.line.type, trainDist);
      const trainTime = estimateTime(bestLine.line.type, trainDist, Math.round(trainDist / 2));
      const fareRange = estimateFareRange('auto', dist); // Simplified combo range
      routes.push({ ...base, id: 'auto-train', type: 'balanced', name: 'Auto + Train Combo',
        timeMinutes: estimateTime('auto', bestLine.dist) + trainTime + 5, cost: autoFare + trainFare, costRange: fareRange.display,
        savings: Math.max(0, cabCost - autoFare - trainFare), recommended: true,
        legs: [
          { mode: 'auto', from: from.name, to: bestLine.station.name, line: 'Auto Rickshaw', lineColor: '#FFA726', duration: estimateTime('auto', bestLine.dist), distance: round1(bestLine.dist), cost: autoFare, stops: 0, waitTime: 2, icon: '🛺' },
          { mode: bestLine.line.type, from: bestLine.station.name, to: bestToLine.station.name, line: bestLine.line.name, lineColor: bestLine.line.color, duration: trainTime, distance: round1(trainDist), cost: trainFare, stops: Math.round(trainDist / 2), waitTime: 5, icon: bestLine.line.icon },
        ],
      });
    }
  }

  // Cab (always)
  const cabTime = estimateTime('cab', dist);
  const cabRange = estimateFareRange('cab', dist);
  routes.push({ ...base, id: 'cab-direct', type: 'comfortable', name: 'Cab Direct',
    timeMinutes: cabTime, cost: cabCost, costRange: cabRange.display, savings: 0, recommended: false,
    legs: [{ mode: 'cab', from: from.name, to: to.name, line: 'Ola / Uber', lineColor: '#212121', duration: cabTime, distance: round1(dist), cost: cabCost, stops: 0, waitTime: 4, icon: '🚕' }],
  });

  // Bike (for short-med distances)
  if (dist < 15) {
    const bikeTime = estimateTime('bike', dist);
    const bikeRange = estimateFareRange('bike', dist);
    routes.push({ ...base, id: 'bike-direct', type: 'fastest', name: 'Bike Taxi',
      timeMinutes: bikeTime, cost: bikeRange.min, costRange: bikeRange.display, savings: Math.max(0, cabCost - bikeRange.min), recommended: dist < 5,
      legs: [{ mode: 'bike', from: from.name, to: to.name, line: 'Rapido / Uber Moto', lineColor: '#00C853', duration: bikeTime, distance: round1(dist), cost: bikeRange.min, stops: 0, waitTime: 3, icon: '🏍️' }],
    });
  }

  routes.sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return a.cost - b.cost;
  });

  return { routes, from: from.name, to: to.name };
}
