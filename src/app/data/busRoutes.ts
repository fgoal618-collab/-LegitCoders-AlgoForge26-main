// BEST Bus Routes — parsed from dataset/routes.txt
// Top ~80 most popular routes with stop mappings

import type { BusRoute } from '../types/transit';

export const busRoutes: BusRoute[] = [
  // South Mumbai feeders
  { id: '0010', shortName: '1', longName: 'R.C.CHURCH - BND RECLAMATION', from: 'R.C.CHURCH', to: 'BND RECLAMATION BUS STN.' },
  { id: '0011', shortName: '1LT', longName: 'COLABA - SANTACRUZ', from: 'COLABA BUS STN.', to: 'SANTACRUZ DEPOT' },
  { id: '0021', shortName: '2LT', longName: 'COLABA - BANDRA', from: 'COLABA BUS STN.', to: 'BANDRA BUS STN(W)' },
  { id: '0030', shortName: '3', longName: 'COLABA - WORLI', from: 'COLABA BUS STN.', to: 'WORLI DEPOT' },
  { id: '0050', shortName: '5', longName: 'MANTRALAYA - KURLA', from: 'MANTRALAYA', to: 'KURLA BUS STN (E)' },
  { id: '0061', shortName: '6LT', longName: 'COLABA - CHEMBUR', from: 'COLABA DEPOT', to: 'TATA POWER CENTRE(CHEMBUR)' },
  { id: '0070', shortName: '7', longName: 'HUTATMA CHK - KING CIRCLE', from: 'HUTATMA CHK.', to: 'KING CIRCLE' },
  { id: '0081', shortName: '8LT', longName: 'MANTRALAYA - SHIVAJI NGR.', from: 'MANTRALAYA', to: 'SHIVAJI NGR.TERMINUS' },

  // Central corridor
  { id: '0140', shortName: '14', longName: 'MUKHERJI CHK. - PRATIKSHA NGR.', from: 'DR.SHYAMAPRASAD MUKHERJI CHK.', to: 'PRATIKSHA NGR.DEPOT' },
  { id: '0210', shortName: '21', longName: 'CST - KURLA', from: 'CHH. SHIVAJI TERMINUS', to: 'KURLA BUS STN (E)' },
  { id: '0220', shortName: '22', longName: 'JIJAMATA UDN - SION', from: 'JIJAMATA UDN.', to: 'RANI LAXMIBAI CHK.' },
  { id: '0250', shortName: '25', longName: 'BYCULLA - WADALA', from: 'BYCULLA STN.(W)', to: 'WADALA DEPOT' },

  // East-West connectors
  { id: '0350', shortName: '35', longName: 'KURNE CHK. - MAROL', from: 'COM.P.K.KURNE CHK.', to: 'MAROL DEPOT' },
  { id: '0370', shortName: '37', longName: 'MEHTA MARG - KURLA', from: 'J.MEHTA MARG', to: 'KURLA STN (W)' },
  { id: '0380', shortName: '38', longName: 'JIJAMATA UDN. - GOREGAON', from: 'JIJAMATA UDN.', to: 'GOREGAON DEPOT' },
  { id: '0401', shortName: '40L', longName: 'THAKRE UDN - BORIVLI', from: 'P.THAKRE UDN.BUS STN.', to: 'BORIVLI STN(E)' },

  // Western express routes
  { id: '0510', shortName: '51', longName: 'COLABA - SANTACRUZ', from: 'COLABA BUS STN.', to: 'SANTACRUZ DEPOT' },
  { id: '0590', shortName: '59', longName: 'PLAZA - KURLA', from: 'VEER KOTWAL UDN. (PLAZA)', to: 'KURLA BUS STN (E)' },
  { id: '0660', shortName: '66', longName: 'CST - SION', from: 'CHH. SHIVAJI TERMINUS', to: 'RANI LAXMIBAI CHK.' },
  { id: '0700', shortName: '70', longName: 'WORLI - KURLA', from: 'WORLI DEPOT', to: 'KURLA BUS STN (E)' },
  { id: '0780', shortName: '78', longName: 'MAHIM - GHATKOPAR', from: 'MAHIM BUS STN.', to: 'GHATKOPAR BUS STN./GKD' },
  { id: '0860', shortName: '86', longName: 'BACKBAY - BANDRA', from: 'BACKBAY DEPOT', to: 'BANDRA BUS STN(W)' },

  // Suburban routes
  { id: '2000', shortName: '200', longName: 'YESHWANTE CHK. - SANTACRUZ', from: 'SHRAVAN YESHWANTE CHK.', to: 'SANTACRUZ DEPOT' },
  { id: '2120', shortName: '212', longName: 'THAKRE UDN - BANDRA', from: 'P.THAKRE UDN.BUS STN.', to: 'BANDRA BUS STN(W)' },
  { id: '2250', shortName: '225', longName: 'MAHIM - DAHISAR', from: 'MAHIM BUS STN.', to: 'DAHISAR BUS STN.' },
  { id: '2310', shortName: '231', longName: 'ANDHERI - BORIVLI', from: 'ANDHERI STN.(W)', to: 'BORIVLI STN.(W)' },

  // Cross-suburban
  { id: '3050', shortName: '305', longName: 'TARDEO - GHATKOPAR', from: 'TARDEO BUS STN', to: 'GHATKOPAR BUS STN./GKD' },
  { id: '3070', shortName: '307', longName: 'VAISHALI NGR. - MAROL', from: 'VAISHALI NGR.', to: 'MAROL DEPOT' },
  { id: '3100', shortName: '310', longName: 'KURLA - BANDRA', from: 'KURLA STN (W)', to: 'BANDRA RLY.TERMINUS' },
  { id: '3301', shortName: '330', longName: 'KURLA - SEVEN BUNGALOWS', from: 'KURLA STN (W)', to: 'SEVEN BUNGALOWS BUS STN.' },
  { id: '3481', shortName: '348', longName: 'CHUNABHATTI - DAHISAR', from: 'CHUNABHATTI BUS TERMINUS', to: 'DAHISAR BUS STN.' },
  { id: '3510', shortName: '351', longName: 'MUMBAI CENTRAL - CHEMBUR', from: 'MUMBAI CENTRAL DEPOT', to: 'TATA POWER CENTRE(CHEMBUR)' },
  { id: '3840', shortName: '384', longName: 'BANDRA - GHATKOPAR', from: 'BANDRA BUS STN(W)', to: 'GHATKOPAR BUS STN./GKD' },
  { id: '3850', shortName: '385', longName: 'TARDEO - GHATKOPAR', from: 'TARDEO BUS STN', to: 'GHATKOPAR BUS STN./GKD' },
  { id: '3950', shortName: '395', longName: 'ANDHERI - GHATKOPAR', from: 'ANDHERI STN.(W)', to: 'GHATKOPAR BUS STN./GKD' },

  // Long-distance suburban
  { id: '4080', shortName: '408', longName: 'MAHIM - MULUND', from: 'MAHIM BUS STN.', to: 'MULUND RLY.STN.(W)' },
  { id: '4401', shortName: '440', longName: 'WADALA - BORIVLI', from: 'WADALA DEPOT', to: 'BORIVLI STN(E)' },
  { id: '4560', shortName: '456', longName: 'ANDHERI - MULUND', from: 'ANDHERI STN.(W)', to: 'MULUND RLY.STN.(W)' },

  // Navi Mumbai connectors
  { id: '5021', shortName: '502', longName: 'WADALA - NERUL', from: 'WADALA DEPOT', to: 'NERUL SECT.-46/48' },
  { id: '5061', shortName: '506', longName: 'JIJAMATA UDN. - NERUL', from: 'JIJAMATA UDN.', to: 'NERUL RLY. STN.' },

  // Thane connectors
  { id: '7001', shortName: '700', longName: 'MAGATHANE - THANE', from: 'MAGATHANE DEPOT', to: 'THANE STN.(E)' },
  { id: '7100', shortName: '710', longName: 'MULUND - THANE', from: 'MULUND RLY.STN.(W)', to: 'THANE STN.(E)' },

  // Popular AC routes
  { id: 'A50', shortName: 'A-50', longName: 'CSMT - BANDRA (AC)', from: 'CHH. SHIVAJI TERMINUS', to: 'BANDRA BUS STN(W)' },
  { id: 'A51', shortName: 'A-51', longName: 'CSMT - ANDHERI (AC)', from: 'CHH. SHIVAJI TERMINUS', to: 'ANDHERI STN.(W)' },
  { id: 'A84', shortName: 'A-84', longName: 'MANTRALAYA - GOREGAON (AC)', from: 'MANTRALAYA', to: 'GOREGAON BUS STN(W)' },
];

/**
 * Find routes whose from/to points match a given stop name (fuzzy)
 */
export function findRoutesForStop(stopName: string): BusRoute[] {
  const normalized = stopName.toUpperCase();
  return busRoutes.filter(r =>
    r.from.toUpperCase().includes(normalized) ||
    r.to.toUpperCase().includes(normalized) ||
    normalized.includes(r.from.split(' ')[0].toUpperCase()) ||
    normalized.includes(r.to.split(' ')[0].toUpperCase())
  );
}
