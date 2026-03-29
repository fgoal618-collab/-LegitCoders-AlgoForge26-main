import { FARE, AVG_SPEED, TRAIN_FARE_SLABS, TRAIN_FREQUENCY } from './constants';
import type { TransitMode } from '../types/transit';

// ─── Bus Fare (BEST Mumbai) ──────────────────────────────────
export function estimateBusFare(distKm: number, isAC = false): number {
  const config = isAC ? FARE.busAC : FARE.bus;
  // BEST uses slab-like: base covers first 5km, then per-km
  if (distKm <= 5) return config.base;
  return Math.round(config.base + (distKm - 5) * config.perKm);
}

// ─── Train Fare (Mumbai Suburban) ─────────────────────────────
export function estimateTrainFare(distKm: number): number {
  for (const slab of TRAIN_FARE_SLABS) {
    if (distKm <= slab.maxKm) return slab.fare;
  }
  return 20;
}

// ─── Metro Fare ───────────────────────────────────────────────
export function estimateMetroFare(distKm: number): number {
  // Metro Line 1: ₹10 base, ~₹1.5/km, capped slabs
  if (distKm <= 3) return 10;
  if (distKm <= 6) return 20;
  if (distKm <= 9) return 30;
  return 40;
}

// ─── Auto Fare ────────────────────────────────────────────────
export function estimateAutoFare(distKm: number): number {
  // Mumbai auto: ₹23 for first 1.5km, ₹16/km after
  if (distKm <= 1.5) return FARE.auto.base;
  return Math.round(FARE.auto.base + (distKm - 1.5) * FARE.auto.perKm);
}

// ─── Cab Fare ─────────────────────────────────────────────────
export function estimateCabFare(distKm: number): { min: number; max: number; display: string } {
  const base = FARE.cab.base + distKm * FARE.cab.perKm;
  const min = Math.floor((base * 0.9) / 10) * 10;
  const max = Math.ceil((base * 1.3) / 10) * 10;
  return { min, max, display: `₹${min} – ₹${max}` };
}

// ─── Smart Fare Range (Optimistic - Pessimistic) ───────────────
export function estimateFareRange(mode: string, distKm: number): { min: number; max: number; display: string } {
  let base = 0;
  switch (mode) {
    case 'bus': base = estimateBusFare(distKm); break;
    case 'train': base = estimateTrainFare(distKm); break;
    case 'metro': base = estimateMetroFare(distKm); break;
    case 'auto': base = estimateAutoFare(distKm); break;
    case 'bike': base = Math.round(40 + distKm * 10); break; // Mock bike pricing
    case 'cab': return estimateCabFare(distKm);
    default: base = 50;
  }

  // Calculate Range
  // Min: 90% (optimistic) rounded down to nearest 10
  // Max: 125% (traffic/surge) rounded up to nearest 10
  let min = Math.floor((base * 0.9) / 10) * 10;
  let max = Math.ceil((base * 1.25) / 10) * 10;

  // Clean values: if min/max are same, separate them
  if (min === max) max += 10;
  
  return { min, max, display: `₹${min} – ₹${max}` };
}

// ─── Universal Fare Estimator (backward compat) ───────────────
export function estimateFare(mode: TransitMode | string, distKm: number): number {
  switch (mode) {
    case 'bus': return estimateBusFare(distKm);
    case 'train': return estimateTrainFare(distKm);
    case 'metro': return estimateMetroFare(distKm);
    case 'auto': return estimateAutoFare(distKm);
    case 'cab': return estimateCabFare(distKm).min;
    case 'walk': return 0;
    default: {
      const config = FARE[mode as keyof typeof FARE];
      if (!config) return 0;
      return Math.round(config.base + distKm * config.perKm);
    }
  }
}

// ─── Travel Time ──────────────────────────────────────────────
export function estimateTime(
  mode: TransitMode | string,
  distKm: number,
  stops: number = 0,
): number {
  const speed = AVG_SPEED[mode as keyof typeof AVG_SPEED] || 18;
  const travelMin = (distKm / speed) * 60;
  // Stop delay: train/metro ~1.5min per stop, bus ~1min
  const stopDelay = mode === 'bus' ? stops * 1 : (mode === 'train' || mode === 'metro') ? stops * 1.5 : 0;
  return Math.max(1, Math.round(travelMin + stopDelay));
}

// ─── Cab Fare for Distance (backward compat) ─────────────────
export function cabFareForDistance(distKm: number): number {
  return estimateCabFare(distKm).min;
}

// ─── Train Frequency ──────────────────────────────────────────
export function getTrainFrequency(type: 'train' | 'metro' = 'train'): string {
  const now = new Date();
  const hour = now.getHours();
  const isPeak = (hour >= 7 && hour <= 11) || (hour >= 17 && hour <= 21);

  if (type === 'metro') {
    return `every ${TRAIN_FREQUENCY.metro.min}-${TRAIN_FREQUENCY.metro.max} min`;
  }
  if (isPeak) {
    return `every ${TRAIN_FREQUENCY.peak.min}-${TRAIN_FREQUENCY.peak.max} min`;
  }
  return `every ${TRAIN_FREQUENCY.offPeak.min}-${TRAIN_FREQUENCY.offPeak.max} min`;
}

// ─── Next Train ETA ───────────────────────────────────────────
export function getNextTrainETA(type: 'train' | 'metro' = 'train'): string {
  const now = new Date();
  const hour = now.getHours();
  const isPeak = (hour >= 7 && hour <= 11) || (hour >= 17 && hour <= 21);

  if (type === 'metro') {
    const wait = Math.round(TRAIN_FREQUENCY.metro.min + Math.random() * (TRAIN_FREQUENCY.metro.max - TRAIN_FREQUENCY.metro.min));
    return `~${wait} min`;
  }
  const freq = isPeak ? TRAIN_FREQUENCY.peak : TRAIN_FREQUENCY.offPeak;
  const wait = Math.round(freq.min + Math.random() * (freq.max - freq.min));
  return `~${wait} min`;
}
