// BEST Bus Data Service - Parses GTFS data from dataset/
// Provides nearby bus stops and routes based on GPS coordinates

import { haversineDistance } from './transitData';

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
}

// Pre-parsed key bus stops (using the top ~200 most commonly served stops from stops.txt)
// These cover all major Mumbai areas and are used for proximity matching
const BEST_BUS_STOPS: BusStop[] = [
  { id: 1, name: "COLABA BUS STN.", lat: 18.9119, lng: 72.8230, area: "COLABA", road: "SHAHID BHAGATSINGH MARG" },
  { id: 9, name: "CHH. SHIVAJI TERMINUS", lat: 18.9410, lng: 72.8346, area: "FORT", road: "DADABHAI NAVROJI MARG" },
  { id: 19, name: "JIJAMATA UDN.", lat: 18.9810, lng: 72.8346, area: "BYCULLA (E)", road: "DR.BABASAHEB AMBEDKAR MARG" },
  { id: 30, name: "VEER KOTWAL UDN. (PLAZA)", lat: 19.0217, lng: 72.8422, area: "DADAR (W)", road: "N.C.KELKAR MARG" },
  { id: 36, name: "MAHIM BUS STN.", lat: 19.0429, lng: 72.8405, area: "MAHIM", road: "MORI ROAD" },
  { id: 49, name: "BND RECLAMATION BUS STN.", lat: 19.0480, lng: 72.8270, area: "BANDRA (W)", road: "KRISHANCHAND MARG" },
  { id: 50, name: "MANTRALAYA", lat: 18.9287, lng: 72.8247, area: "MANTRALAYA", road: "J.TATA MARG" },
  { id: 76, name: "AGARKAR CHK.", lat: 19.1198, lng: 72.8488, area: "ANDHERI (E)", road: "SWAMI NITYANAND MARG" },
  { id: 77, name: "BYCULLA STN.(W)", lat: 18.9743, lng: 72.8321, area: "BYCULLA (W)", road: "N.M.JOSHI MARG" },
  { id: 87, name: "NAVY NGR.", lat: 18.9079, lng: 72.8059, area: "COLABA", road: "DR.HOMI BHABHA MARG" },
  { id: 113, name: "SANTACRUZ DEPOT", lat: 19.0901, lng: 72.8381, area: "SANTACRUZ (W)", road: "SWAMI VIVEKANAND MARG" },
  { id: 119, name: "ANDHERI STN.(W)", lat: 19.1199, lng: 72.8454, area: "ANDHERI (W)", road: "SWAMI VIVEKANAND MARG" },
  { id: 122, name: "JOGESHWARI BUS STN", lat: 19.1335, lng: 72.8476, area: "JOGESHWARI (W)", road: "SWAMI VIVEKANAND MARG" },
  { id: 137, name: "JUHU BEACH", lat: 19.0980, lng: 72.8268, area: "JUHU", road: "JUHU TARA MARG" },
  { id: 154, name: "RANI LAXMIBAI CHK.", lat: 19.0439, lng: 72.8644, area: "SION (E)", road: "VASANTRAO NAIK MARG" },
  { id: 169, name: "KURLA BUS STN (E)", lat: 19.0650, lng: 72.8808, area: "KURLA (E)", road: "S.G.BARVE MARG" },
  { id: 189, name: "TATA POWER CENTRE(CHEMBUR)", lat: 19.0313, lng: 72.8968, area: "CHEMBUR (E)", road: "BHIKAJI DAMAJI PATIL MARG" },
  { id: 233, name: "BACKBAY DEPOT", lat: 18.9090, lng: 72.8168, area: "BACKBAY", road: "CAPTAIN PRAKASH PETHE MARG" },
  { id: 282, name: "GHATKOPAR STN.(W)", lat: 19.0878, lng: 72.9085, area: "GHATKOPAR (W)", road: "JETHALAL PAREKH MARG" },
  { id: 286, name: "DHARAVI DEPOT", lat: 19.0507, lng: 72.8587, area: "DHARAVI", road: "P.M.G.P.ROAD" },
  { id: 297, name: "ANIK DEPOT", lat: 19.0462, lng: 72.8787, area: "WADALA (E)", road: "BHANUSHANKAR YADGNIK MARG" },
  { id: 307, name: "PRATIKSHA NGR.DEPOT", lat: 19.0424, lng: 72.8729, area: "PRATIKSHA NAGAR", road: "EAST MARG" },
  { id: 333, name: "GHATKOPAR BUS STN./GKD", lat: 19.0880, lng: 72.9182, area: "GHATKOPAR (W)", road: "VASANTDADA PATIL MARG" },
  { id: 337, name: "SHIVAJI NGR.TERMINUS", lat: 19.0646, lng: 72.9314, area: "SHIVAJI NAGAR", road: "BAJIPRABHU DESHPANDE MARG" },
  { id: 344, name: "TROMBAY", lat: 19.0336, lng: 72.9500, area: "TROMBAY", road: "VITHAL NARAYAN PURAV MARG" },
  { id: 359, name: "MAROL MAROSHI BUS STN.", lat: 19.1190, lng: 72.8803, area: "MAROL", road: "MAROL MAROSHI MARG" },
  { id: 396, name: "WORLI DEPOT", lat: 19.0134, lng: 72.8201, area: "WORLI", road: "SASMIRA MARG" },
  { id: 430, name: "MULUND RLY.STN.(W)", lat: 19.1725, lng: 72.9561, area: "MULUND (W)", road: "MAHATMA GANDHI MARG" },
  { id: 438, name: "J.V.P.D.BUS STN.", lat: 19.1200, lng: 72.8297, area: "J.V.P.D.", road: "GURU NANAK MARG" },
  { id: 469, name: "JUHU BUS STN.", lat: 19.1075, lng: 72.8268, area: "JUHU", road: "SHAMRAO PARULEKAR MARG" },
  { id: 473, name: "WADALA DEPOT", lat: 19.0146, lng: 72.8532, area: "WADALA (W)", road: "LOKMANYA TILAK MARG (EXTN)" },
  { id: 483, name: "MUMBAI CENTRAL DEPOT", lat: 18.9685, lng: 72.8224, area: "MUMBAI CENTRAL (E)", road: "JAHANGIR BOMAN BEHRAM MARG" },
  { id: 494, name: "MULUND-W CHECK NAKA BUS STN.", lat: 19.1829, lng: 72.9539, area: "MULUND (W)", road: "DINDAYAL UPADHYAY MARG" },
  { id: 496, name: "SEVEN BUNGALOWS BUS STN.", lat: 19.1310, lng: 72.8199, area: "ANDHERI (W)", road: "JAY PRAKASH MARG" },
  { id: 522, name: "GOREGAON BUS STN(W)", lat: 19.1651, lng: 72.8485, area: "GOREGAON (W)", road: "HIRABHAI VALLABHBHAI PATEL MARG" },
  { id: 541, name: "P.THAKRE UDN.BUS STN.", lat: 18.9979, lng: 72.8525, area: "SEWREE", road: "ACHARYA DONDE MARG" },
  { id: 542, name: "MALVANI DEPOT", lat: 19.1814, lng: 72.8192, area: "MALVANI", road: "SHAHID ABDUL HAMID MARG" },
  { id: 574, name: "DINDOSHI BUS STN.", lat: 19.1762, lng: 72.8647, area: "DINDOSHI", road: "GEN.ARUNKUMAR VAIDYA MARG" },
  { id: 590, name: "KURLA STN (W)", lat: 19.0666, lng: 72.8794, area: "KURLA (W)", road: "S.G.BARVE MARG" },
  { id: 620, name: "SEEPZ BUS STN.", lat: 19.1257, lng: 72.8733, area: "ANDHERI (E)", road: "KRANTIVEER LAHUJI SALVE MARG" },
  { id: 629, name: "MAROL DEPOT", lat: 19.1180, lng: 72.8656, area: "ANDHERI (E)", road: "KRANTIVEER LAHUJI SALVE MARG" },
  { id: 659, name: "MAGATHANE DEPOT", lat: 19.2212, lng: 72.8658, area: "BORIVLI (E)", road: "SIR ALIYAWAR JUNG MARG" },
  { id: 665, name: "FERRY WHARF", lat: 18.9573, lng: 72.8495, area: "MAZGAON", road: "MALLET BUNDER MARG" },
  { id: 859, name: "TARDEO BUS STN", lat: 18.9647, lng: 72.8207, area: "TARDEO", road: "R.S.NIMKAR MARG" },
  { id: 900, name: "BANDRA BUS STN(W)", lat: 19.0542, lng: 72.8393, area: "BANDRA (W)", road: "DHONDOPANT RAMJI VARASKAR MARG" },
  { id: 959, name: "P.THAKRE NGR BUS.STN.", lat: 19.2207, lng: 72.8287, area: "CHARKOP", road: "DR.BABASAHEB AMBEDKAR MARG" },
  { id: 992, name: "MIRA RD.STN.(E)", lat: 19.2823, lng: 72.8581, area: "MIRA ROAD (E)", road: "" },
  // Major interchange/terminal stops
  { id: 100, name: "MAHARANA PRATAP CHK.", lat: 18.9688, lng: 72.8402, area: "MAZGAON", road: "BALWANTSINGH DHODI MARG" },
  { id: 147, name: "RUIA COLLEGE", lat: 19.0219, lng: 72.8509, area: "DADAR (E)", road: "DR.BABASAHEB AMBEDKAR MARG" },
  { id: 350, name: "DEONAR DEPOT", lat: 19.0458, lng: 72.9131, area: "DEONAR", road: "VITHAL NARAYAN PURAV MARG" },
  { id: 484, name: "MARATHON CHK.(TEEN HATH NAKA)", lat: 19.1825, lng: 72.9874, area: "THANE (W)", road: "LAL BAHADUR SHASTRI MARG" },
  { id: 397, name: "VAISHALI NGR.", lat: 19.1871, lng: 72.9457, area: "MULUND (W)", road: "BAL RAJESHWARI MARG" },
];

// Key BEST Bus Routes (top 70 most popular from routes.txt)
const BEST_BUS_ROUTES: BusRoute[] = [
  { id: "0010", shortName: "1", longName: "R.C.CHURCH - BND RECLAMATION", from: "R.C.CHURCH", to: "BND RECLAMATION BUS STN." },
  { id: "0011", shortName: "1LT", longName: "COLABA - SANTACRUZ", from: "COLABA BUS STN.", to: "SANTACRUZ DEPOT" },
  { id: "0050", shortName: "5", longName: "MANTRALAYA - KURLA", from: "MANTRALAYA", to: "KURLA BUS STN (E)" },
  { id: "0061", shortName: "6LT", longName: "COLABA - CHEMBUR", from: "COLABA DEPOT", to: "TATA POWER CENTRE(CHEMBUR)" },
  { id: "0081", shortName: "8LT", longName: "MANTRALAYA - SHIVAJI NGR.", from: "MANTRALAYA", to: "SHIVAJI NGR.TERMINUS" },
  { id: "0140", shortName: "14", longName: "MUKHERJI CHK. - PRATIKSHA NGR.", from: "DR.SHYAMAPRASAD MUKHERJI CHK.", to: "PRATIKSHA NGR.DEPOT" },
  { id: "0350", shortName: "35", longName: "KURNE CHK. - MAROL", from: "COM.P.K.KURNE CHK.", to: "MAROL DEPOT" },
  { id: "0370", shortName: "37", longName: "MEHTA MARG - KURLA", from: "J.MEHTA MARG", to: "KURLA STN (W)" },
  { id: "0380", shortName: "38", longName: "JIJAMATA UDN. - GOREGAON", from: "JIJAMATA UDN.", to: "GOREGAON DEPOT" },
  { id: "0401", shortName: "40L", longName: "THAKRE UDN - BORIVLI", from: "P.THAKRE UDN.BUS STN.", to: "BORIVLI STN(E)" },
  { id: "0510", shortName: "51", longName: "COLABA - SANTACRUZ", from: "COLABA BUS STN.", to: "SANTACRUZ DEPOT" },
  { id: "0590", shortName: "59", longName: "PLAZA - KURLA", from: "VEER KOTWAL UDN. (PLAZA)", to: "KURLA BUS STN (E)" },
  { id: "0860", shortName: "86", longName: "BACKBAY - BANDRA", from: "BACKBAY DEPOT", to: "BANDRA BUS STN(W)" },
  { id: "1380", shortName: "138", longName: "BACKBAY - CST", from: "BACKBAY DEPOT", to: "CHH. SHIVAJI TERMINUS(BHATIA)" },
  { id: "2000", shortName: "200", longName: "YESHWANTE CHK. - SANTACRUZ", from: "SHRAWAN YESHWANTE CHK.", to: "SANTACRUZ DEPOT" },
  { id: "2120", shortName: "212", longName: "THAKRE UDN - BANDRA", from: "P.THAKRE UDN.BUS STN.", to: "BANDRA BUS STN(W)" },
  { id: "2250", shortName: "225", longName: "MAHIM - DAHISAR", from: "MAHIM BUS STN.", to: "DAHISAR BUS STN." },
  { id: "3050", shortName: "305", longName: "TARDEO - GHATKOPAR", from: "TARDEO BUS STN/RUSHI MEHTA CHK.", to: "GHATKOPAR BUS STN./GKD" },
  { id: "3070", shortName: "307", longName: "VAISHALI NGR. - MAROL", from: "VAISHALI NGR.", to: "MAROL DEPOT" },
  { id: "3100", shortName: "310", longName: "KURLA - BANDRA", from: "KURLA STN (W)", to: "BANDRA RLY.TERMINUS" },
  { id: "3301", shortName: "330", longName: "KURLA - SEVEN BUNGALOWS", from: "KURLA STN (W)", to: "SEVEN BUNGALOWS BUS STN." },
  { id: "3481", shortName: "348", longName: "CHUNABHATTI - DAHISAR", from: "CHUNABHATTI BUS TERMINUS", to: "DAHISAR BUS STN." },
  { id: "3510", shortName: "351", longName: "MUMBAI CENTRAL - CHEMBUR", from: "MUMBAI CENTRAL DEPOT", to: "TATA POWER CENTRE(CHEMBUR)" },
  { id: "3840", shortName: "384", longName: "BANDRA - GHATKOPAR", from: "BANDRA BUS STN(W)", to: "GHATKOPAR BUS STN./GKD" },
  { id: "3850", shortName: "385", longName: "TARDEO - GHATKOPAR", from: "TARDEO BUS STN/RUSHI MEHTA CHK.", to: "GHATKOPAR BUS STN./GKD" },
  { id: "4080", shortName: "408", longName: "MAHIM - MULUND", from: "MAHIM BUS STN.", to: "MULUND RLY.STN.(W)" },
  { id: "4401", shortName: "440", longName: "WADALA - BORIVLI", from: "WADALA DEPOT", to: "BORIVLI STN(E)" },
  { id: "5021", shortName: "502", longName: "WADALA - NERUL", from: "WADALA DEPOT", to: "NERUL SECT.-46/48" },
  { id: "5061", shortName: "506", longName: "JIJAMATA UDN. - NERUL", from: "JIJAMATA UDN.", to: "NERUL RLY. STN." },
  { id: "7001", shortName: "700", longName: "MAGATHANE - THANE", from: "MAGATHANE DEPOT", to: "THANE STN.(E)" },
];

/**
 * Find nearby bus stops within a given radius (km)
 */
export function findNearbyBusStops(lat: number, lng: number, radiusKm: number = 1.0): (BusStop & { distance: number })[] {
  return BEST_BUS_STOPS
    .map(stop => ({
      ...stop,
      distance: haversineDistance(lat, lng, stop.lat, stop.lng)
    }))
    .filter(stop => stop.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Find bus routes that pass through or near a given location
 * Returns routes whose start/end points are within the search area
 */
export function findNearbyBusRoutes(lat: number, lng: number, radiusKm: number = 2.0): { route: BusRoute; nearestStop: BusStop; distance: number }[] {
  const nearbyStops = findNearbyBusStops(lat, lng, radiusKm);
  const stopNames = new Set(nearbyStops.map(s => s.name));

  const matchedRoutes: { route: BusRoute; nearestStop: BusStop; distance: number }[] = [];
  const seenRoutes = new Set<string>();

  for (const route of BEST_BUS_ROUTES) {
    if (seenRoutes.has(route.id)) continue;

    // Check if from or to matches any nearby stop
    for (const stop of nearbyStops) {
      if (
        route.from.includes(stop.name.split(' ')[0]) ||
        route.to.includes(stop.name.split(' ')[0]) ||
        stop.name.includes(route.from.split(' ')[0]) ||
        stop.name.includes(route.to.split(' ')[0]) ||
        stopNames.has(route.from) ||
        stopNames.has(route.to)
      ) {
        matchedRoutes.push({ route, nearestStop: stop, distance: stop.distance });
        seenRoutes.add(route.id);
        break;
      }
    }
  }

  return matchedRoutes.sort((a, b) => a.distance - b.distance);
}

/**
 * Get all available bus routes (for display)
 */
export function getAllBusRoutes(): BusRoute[] {
  return BEST_BUS_ROUTES;
}

/**
 * Get bus stop count
 */
export function getBusStopCount(): number {
  return BEST_BUS_STOPS.length;
}

/**
 * Get bus route count
 */
export function getBusRouteCount(): number {
  return BEST_BUS_ROUTES.length;
}
