// smartRouteEngine.ts — Smart Multi-Modal Route Intelligence
// Generates exactly 3 optimal routes: Time Saver, Money Saver, Comfortable

import { findNearbyBusStops, findNearbyStations, findNearbyBusRoutes } from './transitService';
import { allStations, transitLines } from '../data/stations';
import { busRoutes, findRoutesForStop } from '../data/busRoutes';
import { haversineDistance, formatDistance, round1 } from '../utils/geo';
import {
  estimateBusFare, estimateTrainFare, estimateMetroFare, estimateAutoFare,
  estimateCabFare, estimateTime, getTrainFrequency, getNextTrainETA,
} from '../utils/fare';
import type { Station, BusStop, BusRoute } from '../types/transit';

// ─── Types ────────────────────────────────────────────────────

export type SmartRouteType = 'time_saver' | 'money_saver' | 'comfortable';

export interface SmartStep {
  mode: 'walk' | 'bus' | 'train' | 'metro' | 'auto' | 'cab';
  icon: string;
  instruction: string;
  from: string;
  to: string;
  duration: number;       // minutes
  distance: number;       // km
  fare: number;           // INR
  busNumber?: string;     // e.g. "312", "A-50"
  busRouteName?: string;  // e.g. "CSMT - BANDRA (AC)"
  lineName?: string;      // e.g. "Western Line", "Metro Line 1"
  lineColor?: string;
  stops?: number;
  frequency?: string;     // e.g. "every 3-5 min"
  nextETA?: string;       // e.g. "~4 min"
  details?: string;
}

export interface SmartRoute {
  id: string;
  type: SmartRouteType;
  label: string;          // "⚡ Time Saver", "💰 Money Saver", "🛋️ Comfortable"
  tagline: string;        // brief description
  totalTime: number;      // minutes
  totalFare: number;      // INR
  fareBreakdown: string;  // e.g. "Bus ₹8 + Train ₹10"
  totalDistance: number;   // km
  walkingDistance: number; // km
  transfers: number;
  modesUsed: string[];    // ['bus', 'train']
  steps: SmartStep[];
  recommended: boolean;
  cabFareRange?: { min: number; max: number };
}

// ─── Coord type ───────────────────────────────────────────────
interface Loc { lat: number; lng: number; name: string; }

// ─── Main Engine ──────────────────────────────────────────────

export function computeSmartRoutes(origin: Loc, destination: Loc): SmartRoute[] {
  const dist = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);

  // Gather nearby transit for both endpoints
  const srcBusStops = findNearbyBusStops(origin.lat, origin.lng, 2.0);
  const dstBusStops = findNearbyBusStops(destination.lat, destination.lng, 2.0);
  const srcTrains = findNearbyStations(origin.lat, origin.lng, 'train', 5);
  const dstTrains = findNearbyStations(destination.lat, destination.lng, 'train', 5);
  const srcMetro = findNearbyStations(origin.lat, origin.lng, 'metro', 5);
  const dstMetro = findNearbyStations(destination.lat, destination.lng, 'metro', 5);
  const srcBusRoutes = findNearbyBusRoutes(origin.lat, origin.lng, 2.0);
  const dstBusRoutes = findNearbyBusRoutes(destination.lat, destination.lng, 2.0);

  // Generate all candidate routes
  const candidates: SmartRoute[] = [];

  // 1. Walk + Bus route
  const busRoute = buildBusRoute(origin, destination, srcBusStops, dstBusStops, srcBusRoutes, dstBusRoutes, dist);
  if (busRoute) candidates.push(busRoute);

  // 2. Bus + Train combo
  const busTrainRoute = buildBusTrainRoute(origin, destination, srcBusStops, dstBusStops, srcTrains, dstTrains, srcBusRoutes, dist);
  if (busTrainRoute) candidates.push(busTrainRoute);

  // 3. Auto + Train combo
  const autoTrainRoute = buildAutoTrainRoute(origin, destination, srcTrains, dstTrains, dist);
  if (autoTrainRoute) candidates.push(autoTrainRoute);

  // 4. Metro route (if both near metro)
  const metroRoute = buildMetroRoute(origin, destination, srcMetro, dstMetro, dist);
  if (metroRoute) candidates.push(metroRoute);

  // 5. Walk + Metro + Bus combo
  const metroBusRoute = buildMetroBusRoute(origin, destination, srcMetro, dstMetro, dstBusStops, dstBusRoutes, dist);
  if (metroBusRoute) candidates.push(metroBusRoute);

  // 6. Train + Walk
  const trainWalkRoute = buildTrainWalkRoute(origin, destination, srcTrains, dstTrains, dist);
  if (trainWalkRoute) candidates.push(trainWalkRoute);

  // 7. Full Cab
  candidates.push(buildCabRoute(origin, destination, dist));

  // 8. Auto direct (short distances)
  if (dist < 12) {
    candidates.push(buildAutoRoute(origin, destination, dist));
  }

  // ─── Score and pick top 3 ───────────────────────────────────
  return pickTop3(candidates, dist);
}

// ─── Route Builders ──────────────────────────────────────────

function buildBusRoute(
  origin: Loc, destination: Loc,
  srcStops: { item: BusStop; distance: number }[],
  dstStops: { item: BusStop; distance: number }[],
  srcRoutes: { route: BusRoute; nearestStop: BusStop; distance: number }[],
  dstRoutes: { route: BusRoute; nearestStop: BusStop; distance: number }[],
  dist: number,
): SmartRoute | null {
  if (srcStops.length === 0 || dstStops.length === 0) return null;

  const srcStop = srcStops[0];
  const dstStop = dstStops[0];

  // Try to find a matching bus route
  const matchedBus = findMatchingBusRoute(srcStop.item, dstStop.item, srcRoutes, dstRoutes);
  const busNumber = matchedBus?.shortName || getBestBusNumber(srcStop.item, dstStop.item);
  const busRouteName = matchedBus?.longName || `${srcStop.item.area} → ${dstStop.item.area}`;
  const isAC = busNumber.startsWith('A-');

  const walkToStop = srcStop.distance;
  const walkFromStop = dstStop.distance;
  const busDist = haversineDistance(srcStop.item.lat, srcStop.item.lng, dstStop.item.lat, dstStop.item.lng);
  const busStopCount = Math.max(2, Math.round(busDist / 0.6));
  const busFare = estimateBusFare(busDist, isAC);
  const busTime = estimateTime('bus', busDist, busStopCount);
  const walkTimeToStop = estimateTime('walk', walkToStop);
  const walkTimeFromStop = estimateTime('walk', walkFromStop);

  const steps: SmartStep[] = [];
  if (walkToStop > 0.05) {
    steps.push({
      mode: 'walk', icon: '🚶',
      instruction: `Walk ${formatDistance(walkToStop)} to ${srcStop.item.name}`,
      from: origin.name, to: srcStop.item.name,
      duration: walkTimeToStop, distance: round1(walkToStop), fare: 0,
      details: srcStop.item.area,
    });
  }
  steps.push({
    mode: 'bus', icon: '🚌',
    instruction: `Take BEST Bus ${busNumber} → ${dstStop.item.name}`,
    from: srcStop.item.name, to: dstStop.item.name,
    duration: busTime, distance: round1(busDist), fare: busFare,
    busNumber, busRouteName,
    stops: busStopCount,
    details: `${busStopCount} stops · ${isAC ? 'AC' : 'Non-AC'}`,
    lineColor: isAC ? '#1565C0' : '#FF8F00',
  });
  if (walkFromStop > 0.05) {
    steps.push({
      mode: 'walk', icon: '🚶',
      instruction: `Walk ${formatDistance(walkFromStop)} to destination`,
      from: dstStop.item.name, to: destination.name,
      duration: walkTimeFromStop, distance: round1(walkFromStop), fare: 0,
    });
  }

  const totalTime = walkTimeToStop + busTime + walkTimeFromStop;
  return {
    id: 'bus-route', type: 'money_saver',
    label: '💰 Money Saver', tagline: `BEST Bus ${busNumber} · ${busRouteName}`,
    totalTime, totalFare: busFare, fareBreakdown: `Bus ₹${busFare}`,
    totalDistance: round1(dist), walkingDistance: round1(walkToStop + walkFromStop),
    transfers: 0, modesUsed: ['bus'], steps, recommended: false,
  };
}

function buildBusTrainRoute(
  origin: Loc, destination: Loc,
  srcBusStops: { item: BusStop; distance: number }[],
  dstBusStops: { item: BusStop; distance: number }[],
  srcTrains: { item: Station; distance: number }[],
  dstTrains: { item: Station; distance: number }[],
  srcBusRoutes: { route: BusRoute; nearestStop: BusStop; distance: number }[],
  dist: number,
): SmartRoute | null {
  if (srcBusStops.length === 0 || srcTrains.length === 0 || dstTrains.length === 0) return null;

  const srcBusStop = srcBusStops[0];
  const nearestSrcStation = srcTrains[0];
  const nearestDstStation = dstTrains[0];

  // Bus to station, then train
  const busNumber = getBestBusNumber(srcBusStop.item, null, nearestSrcStation.item);
  const busDist = haversineDistance(srcBusStop.item.lat, srcBusStop.item.lng, nearestSrcStation.item.lat, nearestSrcStation.item.lng);
  const busStops = Math.max(2, Math.round(busDist / 0.6));
  const busFare = estimateBusFare(busDist);
  const busTime = estimateTime('bus', busDist, busStops);

  const trainDist = haversineDistance(nearestSrcStation.item.lat, nearestSrcStation.item.lng, nearestDstStation.item.lat, nearestDstStation.item.lng);
  const trainStops = getStopCount(nearestSrcStation.item, nearestDstStation.item);
  const trainFare = estimateTrainFare(trainDist);
  const trainTime = estimateTime('train', trainDist, trainStops);
  const trainFreq = getTrainFrequency('train');
  const trainETA = getNextTrainETA('train');

  const walkToStop = srcBusStop.distance;
  const walkFromStation = nearestDstStation.distance;

  const steps: SmartStep[] = [];
  if (walkToStop > 0.05) {
    steps.push({
      mode: 'walk', icon: '🚶',
      instruction: `Walk ${formatDistance(walkToStop)} to ${srcBusStop.item.name}`,
      from: origin.name, to: srcBusStop.item.name,
      duration: estimateTime('walk', walkToStop), distance: round1(walkToStop), fare: 0,
    });
  }
  steps.push({
    mode: 'bus', icon: '🚌',
    instruction: `Take Bus ${busNumber} → ${nearestSrcStation.item.name} station area`,
    from: srcBusStop.item.name, to: nearestSrcStation.item.name,
    duration: busTime, distance: round1(busDist), fare: busFare,
    busNumber, stops: busStops, lineColor: '#FF8F00',
    details: `${busStops} stops`,
  });
  steps.push({
    mode: 'train', icon: '🚆',
    instruction: `Board ${nearestSrcStation.item.line} → ${nearestDstStation.item.name}`,
    from: nearestSrcStation.item.name, to: nearestDstStation.item.name,
    duration: trainTime, distance: round1(trainDist), fare: trainFare,
    lineName: nearestSrcStation.item.line, lineColor: nearestSrcStation.item.lineColor,
    stops: trainStops, frequency: trainFreq, nextETA: trainETA,
    details: `${trainStops} stops · ${trainFreq}`,
  });
  if (walkFromStation > 0.05) {
    steps.push({
      mode: 'walk', icon: '🚶',
      instruction: `Walk ${formatDistance(walkFromStation)} to destination`,
      from: nearestDstStation.item.name, to: destination.name,
      duration: estimateTime('walk', walkFromStation), distance: round1(walkFromStation), fare: 0,
    });
  }

  const totalFare = busFare + trainFare;
  const totalTime = (walkToStop > 0.05 ? estimateTime('walk', walkToStop) : 0) + busTime + 3 + trainTime + (walkFromStation > 0.05 ? estimateTime('walk', walkFromStation) : 0);

  return {
    id: 'bus-train', type: 'money_saver',
    label: '💰 Money Saver', tagline: `Bus ${busNumber} + ${nearestSrcStation.item.line}`,
    totalTime, totalFare, fareBreakdown: `Bus ₹${busFare} + Train ₹${trainFare}`,
    totalDistance: round1(dist), walkingDistance: round1(walkToStop + walkFromStation),
    transfers: 1, modesUsed: ['bus', 'train'], steps, recommended: false,
  };
}

function buildAutoTrainRoute(
  origin: Loc, destination: Loc,
  srcTrains: { item: Station; distance: number }[],
  dstTrains: { item: Station; distance: number }[],
  dist: number,
): SmartRoute | null {
  if (srcTrains.length === 0 || dstTrains.length === 0) return null;
  if (dist < 3) return null; // too short for combo

  const srcStation = srcTrains[0];
  const dstStation = dstTrains[0];

  const autoDist = srcStation.distance;
  const autoFare = estimateAutoFare(autoDist);
  const autoTime = estimateTime('auto', autoDist);

  const trainDist = haversineDistance(srcStation.item.lat, srcStation.item.lng, dstStation.item.lat, dstStation.item.lng);
  const trainStops = getStopCount(srcStation.item, dstStation.item);
  const trainFare = estimateTrainFare(trainDist);
  const trainTime = estimateTime('train', trainDist, trainStops);
  const trainFreq = getTrainFrequency('train');
  const trainETA = getNextTrainETA('train');

  const walkFromStation = dstStation.distance;

  const steps: SmartStep[] = [
    {
      mode: 'auto', icon: '🛺',
      instruction: `Take auto to ${srcStation.item.name} station`,
      from: origin.name, to: srcStation.item.name,
      duration: autoTime, distance: round1(autoDist), fare: autoFare,
      lineColor: '#FFA726',
      details: 'Metered fare',
    },
    {
      mode: 'train', icon: '🚆',
      instruction: `Board ${srcStation.item.line} → ${dstStation.item.name}`,
      from: srcStation.item.name, to: dstStation.item.name,
      duration: trainTime, distance: round1(trainDist), fare: trainFare,
      lineName: srcStation.item.line, lineColor: srcStation.item.lineColor,
      stops: trainStops, frequency: trainFreq, nextETA: trainETA,
      details: `${trainStops} stops · Next train ${trainETA}`,
    },
  ];
  if (walkFromStation > 0.05) {
    steps.push({
      mode: 'walk', icon: '🚶',
      instruction: `Walk ${formatDistance(walkFromStation)} to destination`,
      from: dstStation.item.name, to: destination.name,
      duration: estimateTime('walk', walkFromStation), distance: round1(walkFromStation), fare: 0,
    });
  }

  const totalFare = autoFare + trainFare;
  const totalTime = autoTime + 5 + trainTime + (walkFromStation > 0.05 ? estimateTime('walk', walkFromStation) : 0);

  return {
    id: 'auto-train', type: 'time_saver',
    label: '⚡ Time Saver', tagline: `Auto → ${srcStation.item.line} → ${dstStation.item.name}`,
    totalTime, totalFare, fareBreakdown: `Auto ₹${autoFare} + Train ₹${trainFare}`,
    totalDistance: round1(dist), walkingDistance: round1(walkFromStation),
    transfers: 1, modesUsed: ['auto', 'train'], steps, recommended: false,
  };
}

function buildMetroRoute(
  origin: Loc, destination: Loc,
  srcMetro: { item: Station; distance: number }[],
  dstMetro: { item: Station; distance: number }[],
  dist: number,
): SmartRoute | null {
  if (srcMetro.length === 0 || dstMetro.length === 0) return null;

  const srcStation = srcMetro[0];
  const dstStation = dstMetro[0];
  // Only if both are reasonably close to metro
  if (srcStation.distance > 3 || dstStation.distance > 3) return null;

  const walkToMetro = srcStation.distance;
  const walkFromMetro = dstStation.distance;
  const metroDist = haversineDistance(srcStation.item.lat, srcStation.item.lng, dstStation.item.lat, dstStation.item.lng);
  const metroStops = getStopCount(srcStation.item, dstStation.item);
  const metroFare = estimateMetroFare(metroDist);
  const metroTime = estimateTime('metro', metroDist, metroStops);
  const metroFreq = getTrainFrequency('metro');

  const steps: SmartStep[] = [];
  if (walkToMetro > 0.05) {
    steps.push({
      mode: 'walk', icon: '🚶',
      instruction: `Walk ${formatDistance(walkToMetro)} to ${srcStation.item.name} metro`,
      from: origin.name, to: srcStation.item.name,
      duration: estimateTime('walk', walkToMetro), distance: round1(walkToMetro), fare: 0,
    });
  }
  steps.push({
    mode: 'metro', icon: '🚇',
    instruction: `Take ${srcStation.item.line} → ${dstStation.item.name}`,
    from: srcStation.item.name, to: dstStation.item.name,
    duration: metroTime, distance: round1(metroDist), fare: metroFare,
    lineName: srcStation.item.line, lineColor: srcStation.item.lineColor || '#43A047',
    stops: metroStops, frequency: metroFreq,
    details: `${metroStops} stops · AC coaches · ${metroFreq}`,
  });
  if (walkFromMetro > 0.05) {
    steps.push({
      mode: 'walk', icon: '🚶',
      instruction: `Walk ${formatDistance(walkFromMetro)} to destination`,
      from: dstStation.item.name, to: destination.name,
      duration: estimateTime('walk', walkFromMetro), distance: round1(walkFromMetro), fare: 0,
    });
  }

  const totalTime = (walkToMetro > 0.05 ? estimateTime('walk', walkToMetro) : 0) + metroTime + (walkFromMetro > 0.05 ? estimateTime('walk', walkFromMetro) : 0);

  return {
    id: 'metro', type: 'comfortable',
    label: '🛋️ Comfortable', tagline: `${srcStation.item.line} · AC · ${metroFreq}`,
    totalTime, totalFare: metroFare, fareBreakdown: `Metro ₹${metroFare}`,
    totalDistance: round1(dist), walkingDistance: round1(walkToMetro + walkFromMetro),
    transfers: 0, modesUsed: ['metro'], steps, recommended: false,
  };
}

function buildMetroBusRoute(
  origin: Loc, destination: Loc,
  srcMetro: { item: Station; distance: number }[],
  dstMetro: { item: Station; distance: number }[],
  dstBusStops: { item: BusStop; distance: number }[],
  dstBusRoutes: { route: BusRoute; nearestStop: BusStop; distance: number }[],
  dist: number,
): SmartRoute | null {
  if (srcMetro.length === 0 || dstBusStops.length === 0) return null;
  if (srcMetro[0].distance > 2) return null;

  const srcStation = srcMetro[0];
  // Use the last metro station as transfer point
  const lastMetroStation = dstMetro.length > 0 ? dstMetro[0] : null;
  if (!lastMetroStation) return null;

  const dstBusStop = dstBusStops[0];
  const busNumber = getBestBusNumber(dstBusStop.item, null);

  const walkToMetro = srcStation.distance;
  const metroDist = haversineDistance(srcStation.item.lat, srcStation.item.lng, lastMetroStation.item.lat, lastMetroStation.item.lng);
  const metroStops = getStopCount(srcStation.item, lastMetroStation.item);
  const metroFare = estimateMetroFare(metroDist);
  const metroTime = estimateTime('metro', metroDist, metroStops);

  const busDist = haversineDistance(lastMetroStation.item.lat, lastMetroStation.item.lng, dstBusStop.item.lat, dstBusStop.item.lng);
  const busStops = Math.max(2, Math.round(busDist / 0.6));
  const busFare = estimateBusFare(busDist);
  const busTime = estimateTime('bus', busDist, busStops);

  const walkFromStop = dstBusStop.distance;

  const steps: SmartStep[] = [];
  if (walkToMetro > 0.05) {
    steps.push({
      mode: 'walk', icon: '🚶',
      instruction: `Walk ${formatDistance(walkToMetro)} to ${srcStation.item.name} metro`,
      from: origin.name, to: srcStation.item.name,
      duration: estimateTime('walk', walkToMetro), distance: round1(walkToMetro), fare: 0,
    });
  }
  steps.push({
    mode: 'metro', icon: '🚇',
    instruction: `Take ${srcStation.item.line} → ${lastMetroStation.item.name}`,
    from: srcStation.item.name, to: lastMetroStation.item.name,
    duration: metroTime, distance: round1(metroDist), fare: metroFare,
    lineName: srcStation.item.line, lineColor: '#43A047',
    stops: metroStops,
    details: `${metroStops} stops · AC`,
  });
  steps.push({
    mode: 'bus', icon: '🚌',
    instruction: `Take Bus ${busNumber} → ${dstBusStop.item.name}`,
    from: lastMetroStation.item.name, to: dstBusStop.item.name,
    duration: busTime, distance: round1(busDist), fare: busFare,
    busNumber, stops: busStops, lineColor: '#FF8F00',
    details: `${busStops} stops`,
  });
  if (walkFromStop > 0.05) {
    steps.push({
      mode: 'walk', icon: '🚶',
      instruction: `Walk ${formatDistance(walkFromStop)} to destination`,
      from: dstBusStop.item.name, to: destination.name,
      duration: estimateTime('walk', walkFromStop), distance: round1(walkFromStop), fare: 0,
    });
  }

  const totalFare = metroFare + busFare;
  const totalTime = (walkToMetro > 0.05 ? estimateTime('walk', walkToMetro) : 0) + metroTime + 5 + busTime + (walkFromStop > 0.05 ? estimateTime('walk', walkFromStop) : 0);

  return {
    id: 'metro-bus', type: 'money_saver',
    label: '💰 Money Saver', tagline: `Metro + Bus ${busNumber}`,
    totalTime, totalFare, fareBreakdown: `Metro ₹${metroFare} + Bus ₹${busFare}`,
    totalDistance: round1(dist), walkingDistance: round1(walkToMetro + walkFromStop),
    transfers: 1, modesUsed: ['metro', 'bus'], steps, recommended: false,
  };
}

function buildTrainWalkRoute(
  origin: Loc, destination: Loc,
  srcTrains: { item: Station; distance: number }[],
  dstTrains: { item: Station; distance: number }[],
  dist: number,
): SmartRoute | null {
  if (srcTrains.length === 0 || dstTrains.length === 0) return null;

  const srcStation = srcTrains[0];
  const dstStation = dstTrains[0];

  const walkToStation = srcStation.distance;
  const walkFromStation = dstStation.distance;
  const trainDist = haversineDistance(srcStation.item.lat, srcStation.item.lng, dstStation.item.lat, dstStation.item.lng);
  const trainStops = getStopCount(srcStation.item, dstStation.item);
  const trainFare = estimateTrainFare(trainDist);
  const trainTime = estimateTime('train', trainDist, trainStops);
  const trainFreq = getTrainFrequency('train');
  const trainETA = getNextTrainETA('train');

  const steps: SmartStep[] = [];
  if (walkToStation > 0.05) {
    steps.push({
      mode: 'walk', icon: '🚶',
      instruction: `Walk ${formatDistance(walkToStation)} to ${srcStation.item.name} station`,
      from: origin.name, to: srcStation.item.name,
      duration: estimateTime('walk', walkToStation), distance: round1(walkToStation), fare: 0,
    });
  }
  steps.push({
    mode: 'train', icon: '🚆',
    instruction: `Board ${srcStation.item.line} → ${dstStation.item.name}`,
    from: srcStation.item.name, to: dstStation.item.name,
    duration: trainTime, distance: round1(trainDist), fare: trainFare,
    lineName: srcStation.item.line, lineColor: srcStation.item.lineColor,
    stops: trainStops, frequency: trainFreq, nextETA: trainETA,
    details: `${trainStops} stops · Next train ${trainETA}`,
  });
  if (walkFromStation > 0.05) {
    steps.push({
      mode: 'walk', icon: '🚶',
      instruction: `Walk ${formatDistance(walkFromStation)} to destination`,
      from: dstStation.item.name, to: destination.name,
      duration: estimateTime('walk', walkFromStation), distance: round1(walkFromStation), fare: 0,
    });
  }

  const totalTime = (walkToStation > 0.05 ? estimateTime('walk', walkToStation) : 0) + trainTime + (walkFromStation > 0.05 ? estimateTime('walk', walkFromStation) : 0);

  return {
    id: 'train-walk', type: 'money_saver',
    label: '💰 Money Saver', tagline: `${srcStation.item.line} · ${trainFreq}`,
    totalTime, totalFare: trainFare, fareBreakdown: `Train ₹${trainFare}`,
    totalDistance: round1(dist), walkingDistance: round1(walkToStation + walkFromStation),
    transfers: 0, modesUsed: ['train'], steps, recommended: false,
  };
}

function buildCabRoute(origin: Loc, destination: Loc, dist: number): SmartRoute {
  const cabFare = estimateCabFare(dist);
  const cabTime = estimateTime('cab', dist);

  return {
    id: 'cab', type: 'comfortable',
    label: '🛋️ Comfortable', tagline: 'Ola / Uber · Door to door · AC',
    totalTime: cabTime, totalFare: cabFare.min,
    fareBreakdown: `Cab ₹${cabFare.min}–₹${cabFare.max}`,
    totalDistance: round1(dist), walkingDistance: 0,
    transfers: 0, modesUsed: ['cab'],
    cabFareRange: cabFare,
    steps: [{
      mode: 'cab', icon: '🚕',
      instruction: `Take cab to ${destination.name}`,
      from: origin.name, to: destination.name,
      duration: cabTime, distance: round1(dist), fare: cabFare.min,
      lineColor: '#212121',
      details: `AC · Door to door · ₹${cabFare.min}–₹${cabFare.max}`,
    }],
    recommended: false,
  };
}

function buildAutoRoute(origin: Loc, destination: Loc, dist: number): SmartRoute {
  const autoFare = estimateAutoFare(dist);
  const autoTime = estimateTime('auto', dist);

  return {
    id: 'auto-direct', type: 'time_saver',
    label: '⚡ Time Saver', tagline: 'Auto rickshaw · Direct',
    totalTime: autoTime, totalFare: autoFare,
    fareBreakdown: `Auto ₹${autoFare}`,
    totalDistance: round1(dist), walkingDistance: 0,
    transfers: 0, modesUsed: ['auto'],
    steps: [{
      mode: 'auto', icon: '🛺',
      instruction: `Take auto to ${destination.name}`,
      from: origin.name, to: destination.name,
      duration: autoTime, distance: round1(dist), fare: autoFare,
      lineColor: '#FFA726',
      details: 'Metered fare · Shared/private',
    }],
    recommended: false,
  };
}

// ─── Pick Top 3 ───────────────────────────────────────────────

function pickTop3(candidates: SmartRoute[], dist: number): SmartRoute[] {
  if (candidates.length === 0) return [];

  // Score each candidate
  const scored = candidates.map(r => ({
    route: r,
    timeScore: r.totalTime,
    costScore: r.totalFare,
    comfortScore: r.walkingDistance * 10 + r.transfers * 15 + (r.modesUsed.includes('cab') ? -5 : r.modesUsed.includes('metro') ? 0 : 5),
  }));

  // Pick fastest (lowest time)
  scored.sort((a, b) => a.timeScore - b.timeScore);
  const timeSaver = scored[0].route;
  timeSaver.type = 'time_saver';
  timeSaver.label = '⚡ Time Saver';
  timeSaver.recommended = true;

  // Pick cheapest (lowest cost, excluding the time saver if same)
  scored.sort((a, b) => a.costScore - b.costScore || a.timeScore - b.timeScore);
  let moneySaver = scored.find(s => s.route.id !== timeSaver.id)?.route || scored[0].route;
  if (moneySaver.id === timeSaver.id && scored.length > 1) moneySaver = scored[1].route;
  moneySaver.type = 'money_saver';
  moneySaver.label = '💰 Money Saver';

  // Pick most comfortable (lowest comfort score = least walking + least transfers)
  scored.sort((a, b) => a.comfortScore - b.comfortScore);
  let comfortable = scored.find(s => s.route.id !== timeSaver.id && s.route.id !== moneySaver.id)?.route || scored[0].route;
  if (comfortable.id === timeSaver.id || comfortable.id === moneySaver.id) {
    comfortable = scored.find(s => s.route.id !== timeSaver.id && s.route.id !== moneySaver.id) ?.route || scored[scored.length - 1].route;
  }
  comfortable.type = 'comfortable';
  comfortable.label = '🛋️ Comfortable';

  // Deduplicate: if all 3 are same, pick different ones
  const result: SmartRoute[] = [timeSaver];
  if (moneySaver.id !== timeSaver.id) result.push(moneySaver);
  else if (scored.length > 1) {
    const alt = scored.find(s => s.route.id !== timeSaver.id);
    if (alt) { alt.route.type = 'money_saver'; alt.route.label = '💰 Money Saver'; result.push(alt.route); }
  }
  if (comfortable.id !== timeSaver.id && comfortable.id !== moneySaver.id) result.push(comfortable);
  else if (scored.length > 2) {
    const alt = scored.find(s => !result.some(r => r.id === s.route.id));
    if (alt) { alt.route.type = 'comfortable'; alt.route.label = '🛋️ Comfortable'; result.push(alt.route); }
  }

  // If we still have fewer than 3 unique options, fill missing types with clones
  const requiredTypes: SmartRouteType[] = ['time_saver', 'money_saver', 'comfortable'];
  const hasType = (t: SmartRouteType) => result.some(r => r.type === t);

  const cloneForType = (source: SmartRoute, type: SmartRouteType, label: string): SmartRoute => {
    return {
      ...JSON.parse(JSON.stringify(source)),
      id: `${source.id}-${type}`,
      type,
      label,
      recommended: type === 'time_saver' ? true : source.recommended,
    };
  };

  for (const type of requiredTypes) {
    if (!hasType(type)) {
      let base: SmartRoute | undefined;
      if (type === 'time_saver') base = scored[0]?.route || candidates[0];
      if (type === 'money_saver') base = scored.sort((a, b) => a.costScore - b.costScore)[0]?.route || candidates[0];
      if (type === 'comfortable') base = scored.sort((a, b) => a.comfortScore - b.comfortScore)[0]?.route || candidates[0];

      if (!base) continue;
      const label = type === 'time_saver' ? '⚡ Time Saver' : type === 'money_saver' ? '💰 Money Saver' : '🛋️ Comfortable';
      const clone = cloneForType(base, type, label);
      if (!result.some(r => r.id === clone.id)) result.push(clone);
    }
  }

  // Fallback to duplicates with distinct id/labels in extreme cases
  while (result.length < 3 && result.length > 0) {
    const source = result[0];
    const missingType = requiredTypes.find((t) => !result.some((r) => r.type === t));
    if (!missingType) break;
    const label = missingType === 'time_saver' ? '⚡ Time Saver' : missingType === 'money_saver' ? '💰 Money Saver' : '🛋️ Comfortable';
    result.push({ ...cloneForType(source, missingType, label), id: `${source.id}-${missingType}-${result.length}` });
  }

  return result.slice(0, 3);
}

// ─── Helper: Get Stop Count ──────────────────────────────────

function getStopCount(from: Station, to: Station): number {
  for (const line of transitLines) {
    const fromIdx = line.stations.findIndex(s => s.id === from.id);
    const toIdx = line.stations.findIndex(s => s.id === to.id);
    if (fromIdx !== -1 && toIdx !== -1) {
      return Math.abs(toIdx - fromIdx);
    }
  }
  // Cross-line: estimate
  const d = haversineDistance(from.lat, from.lng, to.lat, to.lng);
  return Math.max(2, Math.round(d / 2));
}

// ─── Helper: Find Matching Bus Route ─────────────────────────

function findMatchingBusRoute(
  srcStop: BusStop, dstStop: BusStop,
  srcRoutes: { route: BusRoute; nearestStop: BusStop; distance: number }[],
  dstRoutes: { route: BusRoute; nearestStop: BusStop; distance: number }[],
): BusRoute | null {
  // Find a bus route that serves both source and destination areas
  for (const sr of srcRoutes) {
    for (const dr of dstRoutes) {
      if (sr.route.id === dr.route.id) return sr.route;
    }
  }
  // Try matching by stop name
  const srcMatches = findRoutesForStop(srcStop.name);
  for (const r of srcMatches) {
    if (r.to.includes(dstStop.name.split(' ')[0]) || r.to.includes(dstStop.area?.split(' ')[0] || '')) {
      return r;
    }
  }
  return srcRoutes.length > 0 ? srcRoutes[0].route : null;
}

// ─── Helper: Get Best Bus Number ─────────────────────────────

function getBestBusNumber(srcStop: BusStop, dstStop: BusStop | null, nearStation?: Station): string {
  // Try to find real bus routes near the source stop
  const matched = findRoutesForStop(srcStop.name);
  if (matched.length > 0) {
    if (dstStop) {
      // Prefer route that goes toward destination area
      const towardDest = matched.find(r =>
        r.to.includes(dstStop.name.split(' ')[0]) ||
        r.from.includes(dstStop.name.split(' ')[0])
      );
      if (towardDest) return towardDest.shortName;
    }
    if (nearStation) {
      const towardStation = matched.find(r =>
        r.to.includes(nearStation.name.split(' ')[0]) ||
        r.from.includes(nearStation.name.split(' ')[0]) ||
        r.longName.toUpperCase().includes(nearStation.name.toUpperCase().split(' ')[0])
      );
      if (towardStation) return towardStation.shortName;
    }
    return matched[0].shortName;
  }

  // Fallback: generate plausible bus number based on area
  const areaNumbers: Record<string, string[]> = {
    'COLABA': ['1', '1LT', '3', '6LT'],
    'FORT': ['7', '21', '66'],
    'BYCULLA': ['22', '25', '14'],
    'DADAR': ['59', '212', '78'],
    'BANDRA': ['86', '310', '384'],
    'SION': ['22', '66', '351'],
    'KURLA': ['21', '59', '70', '310'],
    'ANDHERI': ['231', '395', 'A-51', '456'],
    'GHATKOPAR': ['305', '384', '385', '395'],
    'BORIVLI': ['231', '440'],
    'THANE': ['700', '710'],
    'MULUND': ['408', '456', '710'],
    'GOREGAON': ['38', 'A-84'],
    'CHEMBUR': ['6LT', '351'],
    'WORLI': ['3', '70'],
    'MAHIM': ['78', '225', '408'],
  };

  const area = srcStop.area.split(' ')[0].toUpperCase();
  const nums = areaNumbers[area];
  if (nums && nums.length > 0) return nums[Math.floor(Math.random() * nums.length)];

  return busRoutes[Math.floor(Math.random() * Math.min(20, busRoutes.length))].shortName;
}
