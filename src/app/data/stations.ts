// Mumbai Train & Metro Station Data
// Source: mumbai_train_stations_coords.csv, mumbai_metro_stations_coords.csv

import type { Station, TransitLine } from '../types/transit';
import { LINE_COLORS } from '../utils/constants';

// ─── Central Line ─────────────────────────────────────────────
const centralStations: Station[] = [
  { id: 'csmt', name: 'CSMT', lat: 18.9398, lng: 72.8355, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 1, type: 'train' },
  { id: 'masjid', name: 'Masjid', lat: 18.9460, lng: 72.8380, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 1, type: 'train' },
  { id: 'sandhurst-road', name: 'Sandhurst Road', lat: 18.9580, lng: 72.8440, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 1, type: 'train' },
  { id: 'byculla', name: 'Byculla', lat: 18.9760, lng: 72.8330, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 1, type: 'train' },
  { id: 'chinchpokli', name: 'Chinchpokli', lat: 18.9840, lng: 72.8330, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 1, type: 'train' },
  { id: 'currey-road', name: 'Currey Road', lat: 18.9940, lng: 72.8330, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 1, type: 'train' },
  { id: 'parel', name: 'Parel', lat: 19.0020, lng: 72.8420, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 1, type: 'train' },
  { id: 'dadar-central', name: 'Dadar', lat: 19.0170, lng: 72.8420, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 2, type: 'train' },
  { id: 'matunga', name: 'Matunga', lat: 19.0270, lng: 72.8570, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 2, type: 'train' },
  { id: 'sion', name: 'Sion', lat: 19.0430, lng: 72.8640, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 2, type: 'train' },
  { id: 'kurla', name: 'Kurla', lat: 19.0720, lng: 72.8780, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 2, type: 'train' },
  { id: 'vidyavihar', name: 'Vidyavihar', lat: 19.0790, lng: 72.8960, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 2, type: 'train' },
  { id: 'ghatkopar-central', name: 'Ghatkopar', lat: 19.0850, lng: 72.9080, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 3, type: 'train' },
  { id: 'vikhroli', name: 'Vikhroli', lat: 19.1110, lng: 72.9280, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 3, type: 'train' },
  { id: 'kanjurmarg', name: 'Kanjurmarg', lat: 19.1290, lng: 72.9380, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 3, type: 'train' },
  { id: 'bhandup', name: 'Bhandup', lat: 19.1430, lng: 72.9370, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 3, type: 'train' },
  { id: 'nahur', name: 'Nahur', lat: 19.1540, lng: 72.9460, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 3, type: 'train' },
  { id: 'mulund', name: 'Mulund', lat: 19.1720, lng: 72.9560, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 3, type: 'train' },
  { id: 'thane', name: 'Thane', lat: 19.1860, lng: 72.9750, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 4, type: 'train' },
  { id: 'diva', name: 'Diva', lat: 19.1960, lng: 73.0450, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 4, type: 'train' },
  { id: 'dombivli', name: 'Dombivli', lat: 19.2180, lng: 73.0860, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 4, type: 'train' },
  { id: 'kalyan', name: 'Kalyan', lat: 19.2400, lng: 73.1300, line: 'Central Line', lineColor: LINE_COLORS.central, zone: 5, type: 'train' },
];

// ─── Western Line ─────────────────────────────────────────────
const westernStations: Station[] = [
  { id: 'churchgate', name: 'Churchgate', lat: 18.9322, lng: 72.8264, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 1, type: 'train' },
  { id: 'marine-lines', name: 'Marine Lines', lat: 18.9440, lng: 72.8237, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 1, type: 'train' },
  { id: 'charni-road', name: 'Charni Road', lat: 18.9519, lng: 72.8189, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 1, type: 'train' },
  { id: 'grant-road', name: 'Grant Road', lat: 18.9643, lng: 72.8166, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 1, type: 'train' },
  { id: 'mumbai-central', name: 'Mumbai Central', lat: 18.9690, lng: 72.8193, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 1, type: 'train' },
  { id: 'mahalaxmi', name: 'Mahalaxmi', lat: 18.9830, lng: 72.8210, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 1, type: 'train' },
  { id: 'lower-parel', name: 'Lower Parel', lat: 18.9935, lng: 72.8300, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 1, type: 'train' },
  { id: 'elphinstone-road', name: 'Elphinstone Road', lat: 19.0037, lng: 72.8327, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 1, type: 'train' },
  { id: 'dadar-western', name: 'Dadar', lat: 19.0170, lng: 72.8420, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 2, type: 'train' },
  { id: 'matunga-road', name: 'Matunga Road', lat: 19.0270, lng: 72.8460, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 2, type: 'train' },
  { id: 'mahim-junction', name: 'Mahim Junction', lat: 19.0390, lng: 72.8420, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 2, type: 'train' },
  { id: 'bandra', name: 'Bandra', lat: 19.0540, lng: 72.8400, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 2, type: 'train' },
  { id: 'khar-road', name: 'Khar Road', lat: 19.0680, lng: 72.8380, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 2, type: 'train' },
  { id: 'santacruz', name: 'Santacruz', lat: 19.0810, lng: 72.8400, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 2, type: 'train' },
  { id: 'vile-parle', name: 'Vile Parle', lat: 19.0990, lng: 72.8430, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 3, type: 'train' },
  { id: 'andheri-western', name: 'Andheri', lat: 19.1190, lng: 72.8460, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 3, type: 'train' },
  { id: 'jogeshwari', name: 'Jogeshwari', lat: 19.1340, lng: 72.8480, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 3, type: 'train' },
  { id: 'goregaon', name: 'Goregaon', lat: 19.1550, lng: 72.8490, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 3, type: 'train' },
  { id: 'malad', name: 'Malad', lat: 19.1860, lng: 72.8490, line: 'Western Line', lineColor: LINE_COLORS.western, zone: 3, type: 'train' },
];

// ─── Metro Line 1 ─────────────────────────────────────────────
const metroStations: Station[] = [
  { id: 'versova', name: 'Versova', lat: 19.1307, lng: 72.8156, line: 'Metro Line 1', lineColor: LINE_COLORS.metro1, zone: 1, type: 'metro' },
  { id: 'dn-nagar', name: 'D.N. Nagar', lat: 19.1235, lng: 72.8264, line: 'Metro Line 1', lineColor: LINE_COLORS.metro1, zone: 1, type: 'metro' },
  { id: 'azad-nagar', name: 'Azad Nagar', lat: 19.1186, lng: 72.8362, line: 'Metro Line 1', lineColor: LINE_COLORS.metro1, zone: 1, type: 'metro' },
  { id: 'andheri-metro', name: 'Andheri', lat: 19.1197, lng: 72.8468, line: 'Metro Line 1', lineColor: LINE_COLORS.metro1, zone: 1, type: 'metro' },
  { id: 'weh', name: 'Western Express Highway', lat: 19.1102, lng: 72.8569, line: 'Metro Line 1', lineColor: LINE_COLORS.metro1, zone: 1, type: 'metro' },
  { id: 'chakala', name: 'Chakala', lat: 19.1070, lng: 72.8627, line: 'Metro Line 1', lineColor: LINE_COLORS.metro1, zone: 1, type: 'metro' },
  { id: 'airport-road', name: 'Airport Road', lat: 19.1033, lng: 72.8697, line: 'Metro Line 1', lineColor: LINE_COLORS.metro1, zone: 2, type: 'metro' },
  { id: 'marol-naka', name: 'Marol Naka', lat: 19.1010, lng: 72.8776, line: 'Metro Line 1', lineColor: LINE_COLORS.metro1, zone: 2, type: 'metro' },
  { id: 'saki-naka', name: 'Saki Naka', lat: 19.1003, lng: 72.8894, line: 'Metro Line 1', lineColor: LINE_COLORS.metro1, zone: 2, type: 'metro' },
  { id: 'asalpha', name: 'Asalpha', lat: 19.0991, lng: 72.8984, line: 'Metro Line 1', lineColor: LINE_COLORS.metro1, zone: 2, type: 'metro' },
  { id: 'jagruti-nagar', name: 'Jagruti Nagar', lat: 19.0978, lng: 72.9080, line: 'Metro Line 1', lineColor: LINE_COLORS.metro1, zone: 2, type: 'metro' },
  { id: 'ghatkopar-metro', name: 'Ghatkopar', lat: 19.0860, lng: 72.9085, line: 'Metro Line 1', lineColor: LINE_COLORS.metro1, zone: 2, type: 'metro' },
];

// ─── Transit Lines ────────────────────────────────────────────
export const transitLines: TransitLine[] = [
  {
    id: 'central-line', name: 'Central Line', color: LINE_COLORS.central,
    icon: '🚆', stations: centralStations, type: 'train', avgSpeed: 45, baseFare: 5, perKmFare: 0.6,
  },
  {
    id: 'western-line', name: 'Western Line', color: LINE_COLORS.western,
    icon: '🚆', stations: westernStations, type: 'train', avgSpeed: 45, baseFare: 5, perKmFare: 0.6,
  },
  {
    id: 'metro-line-1', name: 'Metro Line 1', color: LINE_COLORS.metro1,
    icon: '🚇', stations: metroStations, type: 'metro', avgSpeed: 35, baseFare: 10, perKmFare: 1.2,
  },
];

// ─── Exports ──────────────────────────────────────────────────
export const allStations: Station[] = [...centralStations, ...westernStations, ...metroStations];

export function getStationById(id: string): Station | undefined {
  return allStations.find(s => s.id === id);
}

export function getLineForStation(stationId: string): TransitLine | undefined {
  return transitLines.find(l => l.stations.some(s => s.id === stationId));
}
