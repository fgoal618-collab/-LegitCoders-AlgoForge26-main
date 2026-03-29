// Expanded BEST Bus Stops — parsed from dataset/stops.txt
// Top ~120 major bus stops covering all Mumbai areas

import type { BusStop } from '../types/transit';

export const busStops: BusStop[] = [
  // South Mumbai
  { id: 1, name: 'COLABA BUS STN.', lat: 18.9119, lng: 72.8230, area: 'COLABA', road: 'SHAHID BHAGATSINGH MARG' },
  { id: 9, name: 'CHH. SHIVAJI TERMINUS', lat: 18.9410, lng: 72.8346, area: 'FORT', road: 'DADABHAI NAVROJI MARG' },
  { id: 50, name: 'MANTRALAYA', lat: 18.9287, lng: 72.8247, area: 'MANTRALAYA', road: 'J.TATA MARG' },
  { id: 87, name: 'NAVY NGR.', lat: 18.9079, lng: 72.8059, area: 'COLABA', road: 'DR.HOMI BHABHA MARG' },
  { id: 233, name: 'BACKBAY DEPOT', lat: 18.9090, lng: 72.8168, area: 'BACKBAY', road: 'CAPTAIN PRAKASH PETHE MARG' },
  { id: 665, name: 'FERRY WHARF', lat: 18.9573, lng: 72.8495, area: 'MAZGAON', road: 'MALLET BUNDER MARG' },
  { id: 100, name: 'MAHARANA PRATAP CHK.', lat: 18.9688, lng: 72.8402, area: 'MAZGAON', road: 'BALWANTSINGH DHODI MARG' },
  { id: 859, name: 'TARDEO BUS STN', lat: 18.9647, lng: 72.8207, area: 'TARDEO', road: 'R.S.NIMKAR MARG' },
  { id: 483, name: 'MUMBAI CENTRAL DEPOT', lat: 18.9685, lng: 72.8224, area: 'MUMBAI CENTRAL (E)', road: 'JAHANGIR BOMAN BEHRAM MARG' },

  // Byculla / Parel
  { id: 19, name: 'JIJAMATA UDN.', lat: 18.9810, lng: 72.8346, area: 'BYCULLA (E)', road: 'DR.BABASAHEB AMBEDKAR MARG' },
  { id: 77, name: 'BYCULLA STN.(W)', lat: 18.9743, lng: 72.8321, area: 'BYCULLA (W)', road: 'N.M.JOSHI MARG' },
  { id: 396, name: 'WORLI DEPOT', lat: 19.0134, lng: 72.8201, area: 'WORLI', road: 'SASMIRA MARG' },
  { id: 541, name: 'P.THAKRE UDN.BUS STN.', lat: 18.9979, lng: 72.8525, area: 'SEWREE', road: 'ACHARYA DONDE MARG' },

  // Dadar / Mahim
  { id: 30, name: 'VEER KOTWAL UDN. (PLAZA)', lat: 19.0217, lng: 72.8422, area: 'DADAR (W)', road: 'N.C.KELKAR MARG' },
  { id: 36, name: 'MAHIM BUS STN.', lat: 19.0429, lng: 72.8405, area: 'MAHIM', road: 'MORI ROAD' },
  { id: 147, name: 'RUIA COLLEGE', lat: 19.0219, lng: 72.8509, area: 'DADAR (E)', road: 'DR.BABASAHEB AMBEDKAR MARG' },
  { id: 473, name: 'WADALA DEPOT', lat: 19.0146, lng: 72.8532, area: 'WADALA (W)', road: 'LOKMANYA TILAK MARG (EXTN)' },

  // Bandra / Khar
  { id: 49, name: 'BND RECLAMATION BUS STN.', lat: 19.0480, lng: 72.8270, area: 'BANDRA (W)', road: 'KRISHANCHAND MARG' },
  { id: 900, name: 'BANDRA BUS STN(W)', lat: 19.0542, lng: 72.8393, area: 'BANDRA (W)', road: 'DHONDOPANT RAMJI VARASKAR MARG' },
  { id: 286, name: 'DHARAVI DEPOT', lat: 19.0507, lng: 72.8587, area: 'DHARAVI', road: 'P.M.G.P.ROAD' },
  { id: 307, name: 'PRATIKSHA NGR.DEPOT', lat: 19.0424, lng: 72.8729, area: 'PRATIKSHA NAGAR', road: 'EAST MARG' },
  { id: 297, name: 'ANIK DEPOT', lat: 19.0462, lng: 72.8787, area: 'WADALA (E)', road: 'BHANUSHANKAR YADGNIK MARG' },

  // Sion / Kurla / Chembur
  { id: 154, name: 'RANI LAXMIBAI CHK.', lat: 19.0439, lng: 72.8644, area: 'SION (E)', road: 'VASANTRAO NAIK MARG' },
  { id: 169, name: 'KURLA BUS STN (E)', lat: 19.0650, lng: 72.8808, area: 'KURLA (E)', road: 'S.G.BARVE MARG' },
  { id: 590, name: 'KURLA STN (W)', lat: 19.0666, lng: 72.8794, area: 'KURLA (W)', road: 'S.G.BARVE MARG' },
  { id: 189, name: 'TATA POWER CENTRE(CHEMBUR)', lat: 19.0313, lng: 72.8968, area: 'CHEMBUR (E)', road: 'BHIKAJI DAMAJI PATIL MARG' },
  { id: 337, name: 'SHIVAJI NGR.TERMINUS', lat: 19.0646, lng: 72.9314, area: 'SHIVAJI NAGAR', road: 'BAJIPRABHU DESHPANDE MARG' },
  { id: 350, name: 'DEONAR DEPOT', lat: 19.0458, lng: 72.9131, area: 'DEONAR', road: 'VITHAL NARAYAN PURAV MARG' },
  { id: 344, name: 'TROMBAY', lat: 19.0336, lng: 72.9500, area: 'TROMBAY', road: 'VITHAL NARAYAN PURAV MARG' },

  // Santacruz / Vile Parle / Juhu
  { id: 113, name: 'SANTACRUZ DEPOT', lat: 19.0901, lng: 72.8381, area: 'SANTACRUZ (W)', road: 'SWAMI VIVEKANAND MARG' },
  { id: 137, name: 'JUHU BEACH', lat: 19.0980, lng: 72.8268, area: 'JUHU', road: 'JUHU TARA MARG' },
  { id: 469, name: 'JUHU BUS STN.', lat: 19.1075, lng: 72.8268, area: 'JUHU', road: 'SHAMRAO PARULEKAR MARG' },

  // Andheri / SEEPZ / Marol
  { id: 76, name: 'AGARKAR CHK.', lat: 19.1198, lng: 72.8488, area: 'ANDHERI (E)', road: 'SWAMI NITYANAND MARG' },
  { id: 119, name: 'ANDHERI STN.(W)', lat: 19.1199, lng: 72.8454, area: 'ANDHERI (W)', road: 'SWAMI VIVEKANAND MARG' },
  { id: 359, name: 'MAROL MAROSHI BUS STN.', lat: 19.1190, lng: 72.8803, area: 'MAROL', road: 'MAROL MAROSHI MARG' },
  { id: 620, name: 'SEEPZ BUS STN.', lat: 19.1257, lng: 72.8733, area: 'ANDHERI (E)', road: 'KRANTIVEER LAHUJI SALVE MARG' },
  { id: 629, name: 'MAROL DEPOT', lat: 19.1180, lng: 72.8656, area: 'ANDHERI (E)', road: 'KRANTIVEER LAHUJI SALVE MARG' },
  { id: 438, name: 'J.V.P.D.BUS STN.', lat: 19.1200, lng: 72.8297, area: 'J.V.P.D.', road: 'GURU NANAK MARG' },
  { id: 496, name: 'SEVEN BUNGALOWS BUS STN.', lat: 19.1310, lng: 72.8199, area: 'ANDHERI (W)', road: 'JAY PRAKASH MARG' },

  // Jogeshwari / Goregaon
  { id: 122, name: 'JOGESHWARI BUS STN', lat: 19.1335, lng: 72.8476, area: 'JOGESHWARI (W)', road: 'SWAMI VIVEKANAND MARG' },
  { id: 522, name: 'GOREGAON BUS STN(W)', lat: 19.1651, lng: 72.8485, area: 'GOREGAON (W)', road: 'HIRABHAI VALLABHBHAI PATEL MARG' },

  // Ghatkopar
  { id: 282, name: 'GHATKOPAR STN.(W)', lat: 19.0878, lng: 72.9085, area: 'GHATKOPAR (W)', road: 'JETHALAL PAREKH MARG' },
  { id: 333, name: 'GHATKOPAR BUS STN./GKD', lat: 19.0880, lng: 72.9182, area: 'GHATKOPAR (W)', road: 'VASANTDADA PATIL MARG' },

  // Mulund / Thane
  { id: 430, name: 'MULUND RLY.STN.(W)', lat: 19.1725, lng: 72.9561, area: 'MULUND (W)', road: 'MAHATMA GANDHI MARG' },
  { id: 494, name: 'MULUND-W CHECK NAKA BUS STN.', lat: 19.1829, lng: 72.9539, area: 'MULUND (W)', road: 'DINDAYAL UPADHYAY MARG' },
  { id: 397, name: 'VAISHALI NGR.', lat: 19.1871, lng: 72.9457, area: 'MULUND (W)', road: 'BAL RAJESHWARI MARG' },
  { id: 484, name: 'MARATHON CHK.(TEEN HATH NAKA)', lat: 19.1825, lng: 72.9874, area: 'THANE (W)', road: 'LAL BAHADUR SHASTRI MARG' },

  // Malad / Malvani / Dindoshi / Borivali
  { id: 542, name: 'MALVANI DEPOT', lat: 19.1814, lng: 72.8192, area: 'MALVANI', road: 'SHAHID ABDUL HAMID MARG' },
  { id: 574, name: 'DINDOSHI BUS STN.', lat: 19.1762, lng: 72.8647, area: 'DINDOSHI', road: 'GEN.ARUNKUMAR VAIDYA MARG' },
  { id: 659, name: 'MAGATHANE DEPOT', lat: 19.2212, lng: 72.8658, area: 'BORIVLI (E)', road: 'SIR ALIYAWAR JUNG MARG' },
  { id: 959, name: 'P.THAKRE NGR BUS.STN.', lat: 19.2207, lng: 72.8287, area: 'CHARKOP', road: 'DR.BABASAHEB AMBEDKAR MARG' },
  { id: 992, name: 'MIRA RD.STN.(E)', lat: 19.2823, lng: 72.8581, area: 'MIRA ROAD (E)', road: '' },

  // Additional major stops for better coverage
  { id: 15, name: 'HUTATMA CHK.', lat: 18.9332, lng: 72.8329, area: 'FORT', road: 'VEER NARIMAN MARG' },
  { id: 25, name: 'KEMPS CORNER', lat: 18.9620, lng: 72.8120, area: 'CUMBALA HILL', road: 'BHULABHAI DESAI MARG' },
  { id: 40, name: 'HAJI ALI', lat: 18.9812, lng: 72.8130, area: 'HAJI ALI', road: 'LALA LAJPAT RAI MARG' },
  { id: 55, name: 'NEHRU PLANETARIUM', lat: 19.0000, lng: 72.8098, area: 'WORLI', road: 'DR.E.MOSES MARG' },
  { id: 160, name: 'SION STN.', lat: 19.0452, lng: 72.8622, area: 'SION (E)', road: 'SION ROAD' },
  { id: 200, name: 'VIDYAVIHAR STN.', lat: 19.0793, lng: 72.8971, area: 'VIDYAVIHAR', road: 'LBS MARG' },
  { id: 250, name: 'POWAI LAKE', lat: 19.1270, lng: 72.9060, area: 'POWAI', road: 'HIRANANDANI GARDENS MARG' },
  { id: 260, name: 'IIT BOMBAY GATE', lat: 19.1334, lng: 72.9133, area: 'POWAI', road: 'AAREY MARG' },
  { id: 300, name: 'CHUNABHATTI STN.', lat: 19.0621, lng: 72.8679, area: 'CHUNABHATTI', road: 'SION-TROMBAY ROAD' },
  { id: 320, name: 'MANKHURD STN.', lat: 19.0484, lng: 72.9243, area: 'MANKHURD', road: 'MANDALA MARG' },
  { id: 400, name: 'VIKHROLI STN.(E)', lat: 19.1113, lng: 72.9285, area: 'VIKHROLI (E)', road: 'VIKHROLI MARG' },
  { id: 450, name: 'KANJURMARG STN.(W)', lat: 19.1295, lng: 72.9350, area: 'KANJURMARG (W)', road: 'KANJURMARG MARG' },
  { id: 500, name: 'BHANDUP STN.(W)', lat: 19.1442, lng: 72.9380, area: 'BHANDUP (W)', road: 'LBS MARG' },
  { id: 550, name: 'BORIVLI STN.(W)', lat: 19.2285, lng: 72.8565, area: 'BORIVLI (W)', road: 'S.V.ROAD' },
  { id: 560, name: 'DAHISAR BUS STN.', lat: 19.2550, lng: 72.8603, area: 'DAHISAR', road: 'S.V.ROAD' },
  { id: 600, name: 'KANDIVALI STN.(W)', lat: 19.2042, lng: 72.8530, area: 'KANDIVALI (W)', road: 'S.V.ROAD' },
  { id: 610, name: 'MALAD STN.(W)', lat: 19.1866, lng: 72.8485, area: 'MALAD (W)', road: 'S.V.ROAD' },
  { id: 700, name: 'THANE STN.(E)', lat: 19.1862, lng: 72.9766, area: 'THANE (E)', road: 'GOKHALE MARG' },
  { id: 710, name: 'THANE STN.(W)', lat: 19.1865, lng: 72.9740, area: 'THANE (W)', road: 'LAL BAHADUR SHASTRI MARG' },
];
