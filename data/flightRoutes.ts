// Major international flight routes — hardcoded realistic data
// Used as arcs on the 3D hero globe

export interface ArcRoute {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  label?: string;
}

export const FLIGHT_ROUTES: ArcRoute[] = [
  // Trans-Atlantic
  { startLat: 40.71, startLng: -74.01, endLat: 51.51, endLng: -0.13,  label: "JFK–LHR" },
  { startLat: 40.71, startLng: -74.01, endLat: 48.86, endLng: 2.35,   label: "JFK–CDG" },
  { startLat: 33.75, startLng: -84.39, endLat: 51.51, endLng: -0.13,  label: "ATL–LHR" },
  { startLat: 41.88, startLng: -87.63, endLat: 52.52, endLng: 13.40,  label: "ORD–BER" },
  // Trans-Pacific
  { startLat: 34.05, startLng: -118.24, endLat: 35.69, endLng: 139.69, label: "LAX–NRT" },
  { startLat: 34.05, startLng: -118.24, endLat: 22.28, endLng: 114.16, label: "LAX–HKG" },
  { startLat: 37.77, startLng: -122.42, endLat: 35.69, endLng: 139.69, label: "SFO–NRT" },
  { startLat: 49.28, startLng: -123.12, endLat: 35.69, endLng: 139.69, label: "YVR–NRT" },
  // Europe–Asia
  { startLat: 51.51, startLng: -0.13,  endLat: 28.61, endLng: 77.21,  label: "LHR–DEL" },
  { startLat: 51.51, startLng: -0.13,  endLat: 1.35,  endLng: 103.82, label: "LHR–SIN" },
  { startLat: 48.86, startLng: 2.35,   endLat: 25.20, endLng: 55.27,  label: "CDG–DXB" },
  { startLat: 52.52, startLng: 13.40,  endLat: 35.69, endLng: 139.69, label: "BER–NRT" },
  { startLat: 55.75, startLng: 37.62,  endLat: 28.61, endLng: 77.21,  label: "SVO–DEL" },
  // Middle East hub
  { startLat: 25.20, startLng: 55.27,  endLat: 28.61, endLng: 77.21,  label: "DXB–DEL" },
  { startLat: 25.20, startLng: 55.27,  endLat: 1.35,  endLng: 103.82, label: "DXB–SIN" },
  { startLat: 25.20, startLng: 55.27,  endLat: -33.87, endLng: 151.21,label: "DXB–SYD" },
  { startLat: 24.47, startLng: 54.37,  endLat: 51.51, endLng: -0.13,  label: "AUH–LHR" },
  // Asia internal
  { startLat: 35.69, startLng: 139.69, endLat: 22.28, endLng: 114.16, label: "NRT–HKG" },
  { startLat: 35.69, startLng: 139.69, endLat: 1.35,  endLng: 103.82, label: "NRT–SIN" },
  { startLat: 22.28, startLng: 114.16, endLat: 1.35,  endLng: 103.82, label: "HKG–SIN" },
  { startLat: 28.61, startLng: 77.21,  endLat: 1.35,  endLng: 103.82, label: "DEL–SIN" },
  // Americas
  { startLat: 40.71, startLng: -74.01, endLat: -23.55, endLng: -46.63,label: "JFK–GRU" },
  { startLat: 33.75, startLng: -84.39, endLat: 19.43, endLng: -99.13, label: "ATL–MEX" },
  { startLat: -23.55, startLng: -46.63, endLat: 48.86, endLng: 2.35,  label: "GRU–CDG" },
  // Africa
  { startLat: 51.51, startLng: -0.13,  endLat: -26.20, endLng: 28.04, label: "LHR–JNB" },
  { startLat: 25.20, startLng: 55.27,  endLat: -1.29,  endLng: 36.82, label: "DXB–NBO" },
  { startLat: 48.86, startLng: 2.35,   endLat: 5.60,   endLng: -0.19, label: "CDG–ACC" },
  // Australia
  { startLat: 1.35,  startLng: 103.82, endLat: -33.87, endLng: 151.21,label: "SIN–SYD" },
  { startLat: -33.87, startLng: 151.21, endLat: 51.51, endLng: -0.13, label: "SYD–LHR" },
  // Polar
  { startLat: 40.71, startLng: -74.01, endLat: 55.75,  endLng: 37.62, label: "JFK–SVO" },
];
