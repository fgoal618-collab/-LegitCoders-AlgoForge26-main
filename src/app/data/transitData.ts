// Real Mumbai Transit Data - sourced from CSV datasets
// Central Line, Western Line, Metro Line 1

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  line: string;
  lineColor: string;
  zone: number;
}

export interface TransitLine {
  id: string;
  name: string;
  color: string;
  icon: string;
  stations: Station[];
  type: 'train' | 'metro';
  avgSpeed: number; // km/h
  baseFare: number;
  perKmFare: number;
}

// Central Line Stations (from mumbai_central_line.csv)
const centralLineStations: Station[] = [
  { id: "csmt", name: "CSMT", lat: 18.9398, lng: 72.8355, line: "Central Line", lineColor: "#E53935", zone: 1 },
  { id: "masjid", name: "Masjid", lat: 18.9460, lng: 72.8380, line: "Central Line", lineColor: "#E53935", zone: 1 },
  { id: "sandhurst-road", name: "Sandhurst Road", lat: 18.9580, lng: 72.8440, line: "Central Line", lineColor: "#E53935", zone: 1 },
  { id: "byculla", name: "Byculla", lat: 18.9760, lng: 72.8330, line: "Central Line", lineColor: "#E53935", zone: 1 },
  { id: "chinchpokli", name: "Chinchpokli", lat: 18.9840, lng: 72.8330, line: "Central Line", lineColor: "#E53935", zone: 1 },
  { id: "currey-road", name: "Currey Road", lat: 18.9940, lng: 72.8330, line: "Central Line", lineColor: "#E53935", zone: 1 },
  { id: "parel", name: "Parel", lat: 19.0020, lng: 72.8420, line: "Central Line", lineColor: "#E53935", zone: 1 },
  { id: "dadar-central", name: "Dadar", lat: 19.0170, lng: 72.8420, line: "Central Line", lineColor: "#E53935", zone: 2 },
  { id: "matunga", name: "Matunga", lat: 19.0270, lng: 72.8570, line: "Central Line", lineColor: "#E53935", zone: 2 },
  { id: "sion", name: "Sion", lat: 19.0430, lng: 72.8640, line: "Central Line", lineColor: "#E53935", zone: 2 },
  { id: "kurla", name: "Kurla", lat: 19.0720, lng: 72.8780, line: "Central Line", lineColor: "#E53935", zone: 2 },
  { id: "vidyavihar", name: "Vidyavihar", lat: 19.0790, lng: 72.8960, line: "Central Line", lineColor: "#E53935", zone: 2 },
  { id: "ghatkopar-central", name: "Ghatkopar", lat: 19.0850, lng: 72.9080, line: "Central Line", lineColor: "#E53935", zone: 3 },
  { id: "vikhroli", name: "Vikhroli", lat: 19.1110, lng: 72.9280, line: "Central Line", lineColor: "#E53935", zone: 3 },
  { id: "kanjurmarg", name: "Kanjurmarg", lat: 19.1290, lng: 72.9380, line: "Central Line", lineColor: "#E53935", zone: 3 },
  { id: "bhandup", name: "Bhandup", lat: 19.1430, lng: 72.9370, line: "Central Line", lineColor: "#E53935", zone: 3 },
  { id: "nahur", name: "Nahur", lat: 19.1540, lng: 72.9460, line: "Central Line", lineColor: "#E53935", zone: 3 },
  { id: "mulund", name: "Mulund", lat: 19.1720, lng: 72.9560, line: "Central Line", lineColor: "#E53935", zone: 3 },
  { id: "thane", name: "Thane", lat: 19.1860, lng: 72.9750, line: "Central Line", lineColor: "#E53935", zone: 4 },
  { id: "diva", name: "Diva", lat: 19.1960, lng: 73.0450, line: "Central Line", lineColor: "#E53935", zone: 4 },
  { id: "dombivli", name: "Dombivli", lat: 19.2180, lng: 73.0860, line: "Central Line", lineColor: "#E53935", zone: 4 },
  { id: "kalyan", name: "Kalyan", lat: 19.2400, lng: 73.1300, line: "Central Line", lineColor: "#E53935", zone: 5 },
];

// Western Line Stations (from mumbai_train_stations_coords.csv)
const westernLineStations: Station[] = [
  { id: "churchgate", name: "Churchgate", lat: 18.9322, lng: 72.8264, line: "Western Line", lineColor: "#1E88E5", zone: 1 },
  { id: "marine-lines", name: "Marine Lines", lat: 18.9440, lng: 72.8237, line: "Western Line", lineColor: "#1E88E5", zone: 1 },
  { id: "charni-road", name: "Charni Road", lat: 18.9519, lng: 72.8189, line: "Western Line", lineColor: "#1E88E5", zone: 1 },
  { id: "grant-road", name: "Grant Road", lat: 18.9643, lng: 72.8166, line: "Western Line", lineColor: "#1E88E5", zone: 1 },
  { id: "mumbai-central", name: "Mumbai Central", lat: 18.9690, lng: 72.8193, line: "Western Line", lineColor: "#1E88E5", zone: 1 },
  { id: "mahalaxmi", name: "Mahalaxmi", lat: 18.9830, lng: 72.8210, line: "Western Line", lineColor: "#1E88E5", zone: 1 },
  { id: "lower-parel", name: "Lower Parel", lat: 18.9935, lng: 72.8300, line: "Western Line", lineColor: "#1E88E5", zone: 1 },
  { id: "elphinstone-road", name: "Elphinstone Road", lat: 19.0037, lng: 72.8327, line: "Western Line", lineColor: "#1E88E5", zone: 1 },
  { id: "dadar-western", name: "Dadar", lat: 19.0170, lng: 72.8420, line: "Western Line", lineColor: "#1E88E5", zone: 2 },
  { id: "matunga-road", name: "Matunga Road", lat: 19.0270, lng: 72.8460, line: "Western Line", lineColor: "#1E88E5", zone: 2 },
  { id: "mahim-junction", name: "Mahim Junction", lat: 19.0390, lng: 72.8420, line: "Western Line", lineColor: "#1E88E5", zone: 2 },
  { id: "bandra", name: "Bandra", lat: 19.0540, lng: 72.8400, line: "Western Line", lineColor: "#1E88E5", zone: 2 },
  { id: "khar-road", name: "Khar Road", lat: 19.0680, lng: 72.8380, line: "Western Line", lineColor: "#1E88E5", zone: 2 },
  { id: "santacruz", name: "Santacruz", lat: 19.0810, lng: 72.8400, line: "Western Line", lineColor: "#1E88E5", zone: 2 },
  { id: "vile-parle", name: "Vile Parle", lat: 19.0990, lng: 72.8430, line: "Western Line", lineColor: "#1E88E5", zone: 3 },
  { id: "andheri-western", name: "Andheri", lat: 19.1190, lng: 72.8460, line: "Western Line", lineColor: "#1E88E5", zone: 3 },
  { id: "jogeshwari", name: "Jogeshwari", lat: 19.1340, lng: 72.8480, line: "Western Line", lineColor: "#1E88E5", zone: 3 },
  { id: "goregaon", name: "Goregaon", lat: 19.1550, lng: 72.8490, line: "Western Line", lineColor: "#1E88E5", zone: 3 },
  { id: "malad", name: "Malad", lat: 19.1860, lng: 72.8490, line: "Western Line", lineColor: "#1E88E5", zone: 3 },
];

// Metro Line 1 Stations (from mumbai_metro_stations_coords.csv)
const metroLine1Stations: Station[] = [
  { id: "versova", name: "Versova", lat: 19.1307, lng: 72.8156, line: "Metro Line 1", lineColor: "#43A047", zone: 1 },
  { id: "dn-nagar", name: "D.N. Nagar", lat: 19.1235, lng: 72.8264, line: "Metro Line 1", lineColor: "#43A047", zone: 1 },
  { id: "azad-nagar", name: "Azad Nagar", lat: 19.1186, lng: 72.8362, line: "Metro Line 1", lineColor: "#43A047", zone: 1 },
  { id: "andheri-metro", name: "Andheri", lat: 19.1197, lng: 72.8468, line: "Metro Line 1", lineColor: "#43A047", zone: 1 },
  { id: "weh", name: "Western Express Highway", lat: 19.1102, lng: 72.8569, line: "Metro Line 1", lineColor: "#43A047", zone: 1 },
  { id: "chakala", name: "Chakala", lat: 19.1070, lng: 72.8627, line: "Metro Line 1", lineColor: "#43A047", zone: 1 },
  { id: "airport-road", name: "Airport Road", lat: 19.1033, lng: 72.8697, line: "Metro Line 1", lineColor: "#43A047", zone: 2 },
  { id: "marol-naka", name: "Marol Naka", lat: 19.1010, lng: 72.8776, line: "Metro Line 1", lineColor: "#43A047", zone: 2 },
  { id: "saki-naka", name: "Saki Naka", lat: 19.1003, lng: 72.8894, line: "Metro Line 1", lineColor: "#43A047", zone: 2 },
  { id: "asalpha", name: "Asalpha", lat: 19.0991, lng: 72.8984, line: "Metro Line 1", lineColor: "#43A047", zone: 2 },
  { id: "jagruti-nagar", name: "Jagruti Nagar", lat: 19.0978, lng: 72.9080, line: "Metro Line 1", lineColor: "#43A047", zone: 2 },
  { id: "ghatkopar-metro", name: "Ghatkopar", lat: 19.0860, lng: 72.9085, line: "Metro Line 1", lineColor: "#43A047", zone: 2 },
];

// All Transit Lines
export const transitLines: TransitLine[] = [
  {
    id: "central-line",
    name: "Central Line",
    color: "#E53935",
    icon: "🚆",
    stations: centralLineStations,
    type: "train",
    avgSpeed: 45,
    baseFare: 5,
    perKmFare: 0.6,
  },
  {
    id: "western-line",
    name: "Western Line",
    color: "#1E88E5",
    icon: "🚆",
    stations: westernLineStations,
    type: "train",
    avgSpeed: 45,
    baseFare: 5,
    perKmFare: 0.6,
  },
  {
    id: "metro-line-1",
    name: "Metro Line 1",
    color: "#43A047",
    icon: "🚇",
    stations: metroLine1Stations,
    type: "metro",
    avgSpeed: 35,
    baseFare: 10,
    perKmFare: 1.2,
  },
];

// All stations combined
export const allStations: Station[] = [
  ...centralLineStations,
  ...westernLineStations,
  ...metroLine1Stations,
];

// Helper: Get all unique station names (for search/autocomplete)
export function getAllLocations() {
  const seen = new Set<string>();
  return allStations
    .filter((s) => {
      if (seen.has(s.name)) return false;
      seen.add(s.name);
      return true;
    })
    .map((s) => ({
      id: s.id,
      name: s.name,
      city: "Mumbai",
      lat: s.lat,
      lng: s.lng,
      lines: allStations.filter((st) => st.name === s.name).map((st) => st.line),
    }));
}

// Helper: distance between two coordinates (Haversine in km)
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Helper: Find nearest station to a GPS coordinate
export function findNearestStation(lat: number, lng: number): Station {
  let nearest = allStations[0];
  let minDist = Infinity;
  for (const s of allStations) {
    const d = haversineDistance(lat, lng, s.lat, s.lng);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  }
  return nearest;
}

// Core: Find routes between two stations
export function findTransitRoutes(fromId: string, toId: string) {
  const fromStation = allStations.find((s) => s.id === fromId);
  const toStation = allStations.find((s) => s.id === toId);
  if (!fromStation || !toStation) return { routes: [], from: fromId, to: toId };

  const distance = haversineDistance(fromStation.lat, fromStation.lng, toStation.lat, toStation.lng);
  const routes = [];

  // Check if both on same line
  const fromLines = transitLines.filter((l) => l.stations.some((s) => s.id === fromId));
  const toLines = transitLines.filter((l) => l.stations.some((s) => s.id === toId));
  const commonLines = fromLines.filter((l) => toLines.some((tl) => tl.id === l.id));

  // Direct route (same line)
  for (const line of commonLines) {
    const fromIdx = line.stations.findIndex((s) => s.id === fromId);
    const toIdx = line.stations.findIndex((s) => s.id === toId);
    const stopsCount = Math.abs(toIdx - fromIdx);
    const timeMins = Math.round((distance / line.avgSpeed) * 60) + stopsCount * 1.5;
    const fare = Math.round(line.baseFare + distance * line.perKmFare);

    routes.push({
      id: `route-${line.id}-direct`,
      type: stopsCount <= 5 ? "fastest" : "cheapest",
      name: `${line.name} Direct`,
      from: fromStation.name,
      to: toStation.name,
      fromCoords: { lat: fromStation.lat, lng: fromStation.lng },
      toCoords: { lat: toStation.lat, lng: toStation.lng },
      distance: Math.round(distance * 10) / 10,
      timeMinutes: Math.round(timeMins),
      cost: fare,
      savings: Math.round(Math.max(0, distance * 12 - fare)),
      recommended: stopsCount <= 5,
      legs: [
        {
          mode: line.type,
          from: fromStation.name,
          to: toStation.name,
          line: line.name,
          lineColor: line.color,
          duration: Math.round(timeMins),
          distance: Math.round(distance * 10) / 10,
          cost: fare,
          stops: stopsCount,
          waitTime: 3,
          icon: line.icon,
        },
      ],
    });
  }

  // Multi-modal route: Auto + Train/Metro
  if (routes.length === 0 || distance > 5) {
    const nearestFromLine = findBestLine(fromStation);
    const nearestToLine = findBestLine(toStation);

    if (nearestFromLine && nearestToLine) {
      const autoToStation = Math.round(distance * 0.15);
      const trainDist = Math.max(1, distance - autoToStation * 0.1);
      const trainTime = Math.round((trainDist / 40) * 60);
      const trainFare = Math.round(5 + trainDist * 0.6);
      const autoFare = Math.round(30 + autoToStation * 12);
      const totalFare = trainFare + autoFare;
      const totalTime = trainTime + 12 + 5;

      routes.push({
        id: "route-multimodal",
        type: "balanced",
        name: "Auto + Train Combo",
        from: fromStation.name,
        to: toStation.name,
        fromCoords: { lat: fromStation.lat, lng: fromStation.lng },
        toCoords: { lat: toStation.lat, lng: toStation.lng },
        distance: Math.round(distance * 10) / 10,
        timeMinutes: totalTime,
        cost: totalFare,
        savings: Math.round(Math.max(0, distance * 12 - totalFare)),
        recommended: true,
        legs: [
          {
            mode: "auto",
            from: fromStation.name,
            to: nearestFromLine.station.name,
            line: "Auto Rickshaw",
            lineColor: "#FFA726",
            duration: 12,
            distance: Math.round(autoToStation * 0.1 * 10) / 10,
            cost: autoFare,
            stops: 0,
            waitTime: 2,
            icon: "🛺",
          },
          {
            mode: nearestFromLine.line.type,
            from: nearestFromLine.station.name,
            to: nearestToLine.station.name,
            line: nearestFromLine.line.name,
            lineColor: nearestFromLine.line.color,
            duration: trainTime,
            distance: Math.round(trainDist * 10) / 10,
            cost: trainFare,
            stops: Math.round(trainDist / 2),
            waitTime: 5,
            icon: nearestFromLine.line.icon,
          },
        ],
      });
    }
  }

  // Cab route (always available)
  const cabTime = Math.round((distance / 25) * 60) + 5;
  const cabFare = Math.round(50 + distance * 14);
  routes.push({
    id: "route-cab",
    type: "comfortable",
    name: "Cab Direct",
    from: fromStation.name,
    to: toStation.name,
    fromCoords: { lat: fromStation.lat, lng: fromStation.lng },
    toCoords: { lat: toStation.lat, lng: toStation.lng },
    distance: Math.round(distance * 10) / 10,
    timeMinutes: cabTime,
    cost: cabFare,
    savings: 0,
    recommended: false,
    legs: [
      {
        mode: "cab",
        from: fromStation.name,
        to: toStation.name,
        line: "Ola / Uber",
        lineColor: "#000000",
        duration: cabTime,
        distance: Math.round(distance * 10) / 10,
        cost: cabFare,
        stops: 0,
        waitTime: 4,
        icon: "🚕",
      },
    ],
  });

  // Sort: recommended first, then by cost
  routes.sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return a.cost - b.cost;
  });

  return { routes, from: fromStation.name, to: toStation.name };
}

function findBestLine(station: Station) {
  let bestMatch: { line: TransitLine; station: Station; dist: number } | null = null;
  for (const line of transitLines) {
    for (const s of line.stations) {
      const d = haversineDistance(station.lat, station.lng, s.lat, s.lng);
      if (!bestMatch || d < bestMatch.dist) {
        bestMatch = { line, station: s, dist: d };
      }
    }
  }
  return bestMatch;
}
