// Global carbon trading routes — hardcoded realistic data
// Based on EU ETS, China ETS, CORSIA, voluntary carbon markets

export interface ArcRoute {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  label?: string;
  volumeMtCO2?: number; // approximate annual trade volume
}

export const CARBON_TRADE_ROUTES: ArcRoute[] = [
  // EU ETS trades (intra-Europe)
  { startLat: 52.52, startLng: 13.40,  endLat: 48.86, endLng: 2.35,   label: "DE→FR ETS",       volumeMtCO2: 45 },
  { startLat: 52.52, startLng: 13.40,  endLat: 51.51, endLng: -0.13,  label: "DE→GB ETS",       volumeMtCO2: 30 },
  { startLat: 51.51, startLng: -0.13,  endLat: 52.37, endLng: 4.90,   label: "GB→NL ETS",       volumeMtCO2: 25 },
  { startLat: 48.86, startLng: 2.35,   endLat: 40.42, endLng: -3.70,  label: "FR→ES ETS",       volumeMtCO2: 20 },
  { startLat: 50.85, startLng: 4.35,   endLat: 52.52, endLng: 13.40,  label: "BE→DE ETS",       volumeMtCO2: 18 },
  { startLat: 59.33, startLng: 18.07,  endLat: 52.52, endLng: 13.40,  label: "SE→DE ETS",       volumeMtCO2: 15 },
  { startLat: 52.52, startLng: 13.40,  endLat: 55.68, endLng: 12.57,  label: "DE→DK ETS",       volumeMtCO2: 12 },
  // EU ETS ↔ Global
  { startLat: 48.86, startLng: 2.35,   endLat: 25.20, endLng: 55.27,  label: "FR→UAE Carbon",   volumeMtCO2: 8 },
  { startLat: 52.52, startLng: 13.40,  endLat: -26.20, endLng: 28.04, label: "DE→ZA Offset",    volumeMtCO2: 6 },
  { startLat: 51.51, startLng: -0.13,  endLat: -23.55, endLng: -46.63,label: "GB→BR REDD+",     volumeMtCO2: 5 },
  // China ETS
  { startLat: 39.91, startLng: 116.39, endLat: 31.23, endLng: 121.47, label: "BEI→SHA China ETS",volumeMtCO2: 120 },
  { startLat: 39.91, startLng: 116.39, endLat: 22.28, endLng: 114.16, label: "BEI→HK China ETS", volumeMtCO2: 60 },
  { startLat: 31.23, startLng: 121.47, endLat: 22.54, endLng: 114.06, label: "SHA→GZ China ETS", volumeMtCO2: 80 },
  // China → International
  { startLat: 39.91, startLng: 116.39, endLat: 51.51, endLng: -0.13,  label: "CN→EU Carbon Link",volumeMtCO2: 15 },
  { startLat: 39.91, startLng: 116.39, endLat: 40.71, endLng: -74.01, label: "CN→US Voluntary",  volumeMtCO2: 10 },
  // US Voluntary Markets
  { startLat: 40.71, startLng: -74.01, endLat: -3.47,  endLng: -62.22,label: "US→Amazon REDD+",  volumeMtCO2: 12 },
  { startLat: 37.77, startLng: -122.42, endLat: 0.32,  endLng: 37.91, label: "US→Kenya Wind",    volumeMtCO2: 8 },
  { startLat: 40.71, startLng: -74.01, endLat: -1.29,  endLng: 36.82, label: "US→Kenya Reforest",volumeMtCO2: 5 },
  // CORSIA Aviation
  { startLat: 51.51, startLng: -0.13,  endLat: -33.87, endLng: 151.21,label: "Heathrow CORSIA",  volumeMtCO2: 3 },
  { startLat: 40.71, startLng: -74.01, endLat: 1.35,   endLng: 103.82,label: "JFK CORSIA",       volumeMtCO2: 4 },
  // Southeast Asia voluntary
  { startLat: 1.35,  startLng: 103.82, endLat: -6.21,  endLng: 106.85,label: "SG→ID Mangrove",   volumeMtCO2: 7 },
  { startLat: 13.75, startLng: 100.52, endLat: 16.87,  endLng: 96.19, label: "TH→MM Reforest",   volumeMtCO2: 4 },
  // India
  { startLat: 28.61, startLng: 77.21,  endLat: 51.51,  endLng: -0.13, label: "IN→GB Carbon Mkt", volumeMtCO2: 9 },
  { startLat: 28.61, startLng: 77.21,  endLat: 25.20,  endLng: 55.27, label: "IN→UAE Carbon",    volumeMtCO2: 6 },
  // Africa offsets
  { startLat: -1.29, startLng: 36.82,  endLat: 52.52,  endLng: 13.40, label: "KE→DE Forest Offset",volumeMtCO2: 5},
  { startLat: 5.60,  startLng: -0.19,  endLat: 51.51,  endLng: -0.13, label: "GH→UK Clean Cook",  volumeMtCO2: 3 },
  // South America
  { startLat: -3.47, startLng: -62.22, endLat: 48.86,  endLng: 2.35,  label: "Amazon→EU REDD+",  volumeMtCO2: 18 },
  { startLat: -23.55, startLng: -46.63,endLat: 52.52,  endLng: 13.40, label: "BR→DE Carbon",     volumeMtCO2: 8 },
  // Australia
  { startLat: -33.87, startLng: 151.21,endLat: 35.69,  endLng: 139.69,label: "AU→JP Carbon",     volumeMtCO2: 10 },
  { startLat: -33.87, startLng: 151.21,endLat: 51.51,  endLng: -0.13, label: "AU→UK Safeguard",  volumeMtCO2: 5 },
];
