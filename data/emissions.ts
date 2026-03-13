// Real-world CO₂ emissions data (MtCO₂/year) — sourced from World Bank / Global Carbon Project
// Hard-coded per year for use in the hero section heatmap
// Countries represented as ISO alpha-3 codes with approximate lat/lng centroids

export interface CountryEmission {
  id: string;       // ISO3 country code
  name: string;
  lat: number;
  lng: number;
  emissions: Record<number, number>; // year → MtCO₂
}

export const EMISSIONS_DATA: CountryEmission[] = [
  { id: "CHN", name: "China",         lat: 35.86, lng: 104.19,
    emissions: { 2000:3405, 2005:5860, 2010:9000, 2015:9847, 2020:10900, 2024:12000 }},
  { id: "USA", name: "United States", lat: 37.09, lng: -95.71,
    emissions: { 2000:5798, 2005:5766, 2010:5442, 2015:5036, 2020:4437, 2024:4800 }},
  { id: "IND", name: "India",         lat: 20.59, lng: 78.96,
    emissions: { 2000: 965, 2005:1160, 2010:1627, 2015:2180, 2020:2302, 2024:2900 }},
  { id: "RUS", name: "Russia",        lat: 61.52, lng: 105.32,
    emissions: { 2000:1427, 2005:1571, 2010:1581, 2015:1531, 2020:1431, 2024:1600 }},
  { id: "JPN", name: "Japan",         lat: 36.20, lng: 138.25,
    emissions: { 2000:1173, 2005:1236, 2010:1171, 2015:1143, 2020: 995, 2024:1050 }},
  { id: "DEU", name: "Germany",       lat: 51.16, lng: 10.45,
    emissions: { 2000: 822, 2005: 796, 2010: 745, 2015: 729, 2020: 639, 2024: 610 }},
  { id: "KOR", name: "South Korea",   lat: 35.91, lng: 127.77,
    emissions: { 2000: 440, 2005: 485, 2010: 565, 2015: 589, 2020: 576, 2024: 590 }},
  { id: "IRN", name: "Iran",          lat: 32.43, lng: 53.69,
    emissions: { 2000: 321, 2005: 436, 2010: 540, 2015: 592, 2020: 618, 2024: 680 }},
  { id: "SAU", name: "Saudi Arabia",  lat: 23.88, lng: 45.08,
    emissions: { 2000: 311, 2005: 379, 2010: 474, 2015: 576, 2020: 548, 2024: 610 }},
  { id: "CAN", name: "Canada",        lat: 56.13, lng: -106.35,
    emissions: { 2000: 531, 2005: 548, 2010: 532, 2015: 547, 2020: 488, 2024: 530 }},
  { id: "GBR", name: "United Kingdom",lat: 55.38, lng: -3.44,
    emissions: { 2000: 534, 2005: 549, 2010: 490, 2015: 404, 2020: 325, 2024: 310 }},
  { id: "BRA", name: "Brazil",        lat: -14.24, lng: -51.93,
    emissions: { 2000: 322, 2005: 358, 2010: 420, 2015: 475, 2020: 427, 2024: 480 }},
  { id: "MEX", name: "Mexico",        lat: 23.63, lng: -102.55,
    emissions: { 2000: 368, 2005: 406, 2010: 415, 2015: 469, 2020: 388, 2024: 430 }},
  { id: "AUS", name: "Australia",     lat: -25.27, lng: 133.78,
    emissions: { 2000: 340, 2005: 374, 2010: 395, 2015: 380, 2020: 353, 2024: 380 }},
  { id: "ZAF", name: "South Africa",  lat: -30.56, lng: 22.94,
    emissions: { 2000: 332, 2005: 370, 2010: 396, 2015: 393, 2020: 341, 2024: 370 }},
  { id: "IDN", name: "Indonesia",     lat: -0.79, lng: 113.92,
    emissions: { 2000: 260, 2005: 325, 2010: 418, 2015: 535, 2020: 590, 2024: 670 }},
  { id: "TUR", name: "Turkey",        lat: 38.96, lng: 35.24,
    emissions: { 2000: 198, 2005: 246, 2010: 304, 2015: 368, 2020: 373, 2024: 420 }},
  { id: "POL", name: "Poland",        lat: 51.92, lng: 19.15,
    emissions: { 2000: 288, 2005: 296, 2010: 302, 2015: 288, 2020: 280, 2024: 270 }},
  { id: "FRA", name: "France",        lat: 46.23, lng: 2.21,
    emissions: { 2000: 370, 2005: 367, 2010: 355, 2015: 323, 2020: 277, 2024: 285 }},
  { id: "NGA", name: "Nigeria",       lat: 9.08, lng: 8.68,
    emissions: { 2000: 101, 2005: 114, 2010: 77, 2015: 84, 2020: 74, 2024: 90 }},
];

/** Interpolate emissions for any year between known data points */
export function getEmissionForYear(country: CountryEmission, year: number): number {
  const known = Object.keys(country.emissions).map(Number).sort((a, b) => a - b);
  if (year <= known[0]) return country.emissions[known[0]];
  if (year >= known[known.length - 1]) return country.emissions[known[known.length - 1]];
  for (let i = 0; i < known.length - 1; i++) {
    if (year >= known[i] && year <= known[i + 1]) {
      const pct = (year - known[i]) / (known[i + 1] - known[i]);
      return Math.round(country.emissions[known[i]] + pct * (country.emissions[known[i + 1]] - country.emissions[known[i]]));
    }
  }
  return 0;
}

/** Max emission across all countries and all years (for normalisation) */
export const MAX_EMISSION = 12000;
