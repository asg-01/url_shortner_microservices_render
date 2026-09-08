/**
 * Country data: code → { name, lat, lng, flag }
 * Used by the analytics globe for centroid positioning
 * and by the region table for display names + flags.
 */
const COUNTRIES = {
  AF: { name: 'Afghanistan', lat: 33.93, lng: 67.71, flag: '🇦🇫' },
  AL: { name: 'Albania', lat: 41.15, lng: 20.17, flag: '🇦🇱' },
  DZ: { name: 'Algeria', lat: 28.03, lng: 1.66, flag: '🇩🇿' },
  AR: { name: 'Argentina', lat: -38.42, lng: -63.62, flag: '🇦🇷' },
  AM: { name: 'Armenia', lat: 40.07, lng: 45.04, flag: '🇦🇲' },
  AU: { name: 'Australia', lat: -25.27, lng: 133.78, flag: '🇦🇺' },
  AT: { name: 'Austria', lat: 47.52, lng: 14.55, flag: '🇦🇹' },
  AZ: { name: 'Azerbaijan', lat: 40.14, lng: 47.58, flag: '🇦🇿' },
  BH: { name: 'Bahrain', lat: 26.07, lng: 50.55, flag: '🇧🇭' },
  BD: { name: 'Bangladesh', lat: 23.68, lng: 90.36, flag: '🇧🇩' },
  BY: { name: 'Belarus', lat: 53.71, lng: 27.95, flag: '🇧🇾' },
  BE: { name: 'Belgium', lat: 50.50, lng: 4.47, flag: '🇧🇪' },
  BO: { name: 'Bolivia', lat: -16.29, lng: -63.59, flag: '🇧🇴' },
  BA: { name: 'Bosnia', lat: 43.92, lng: 17.68, flag: '🇧🇦' },
  BR: { name: 'Brazil', lat: -14.24, lng: -51.93, flag: '🇧🇷' },
  BG: { name: 'Bulgaria', lat: 42.73, lng: 25.49, flag: '🇧🇬' },
  KH: { name: 'Cambodia', lat: 12.57, lng: 104.99, flag: '🇰🇭' },
  CA: { name: 'Canada', lat: 56.13, lng: -106.35, flag: '🇨🇦' },
  CL: { name: 'Chile', lat: -35.68, lng: -71.54, flag: '🇨🇱' },
  CN: { name: 'China', lat: 35.86, lng: 104.20, flag: '🇨🇳' },
  CO: { name: 'Colombia', lat: 4.57, lng: -74.30, flag: '🇨🇴' },
  CR: { name: 'Costa Rica', lat: 9.75, lng: -83.75, flag: '🇨🇷' },
  HR: { name: 'Croatia', lat: 45.10, lng: 15.20, flag: '🇭🇷' },
  CU: { name: 'Cuba', lat: 21.52, lng: -77.78, flag: '🇨🇺' },
  CY: { name: 'Cyprus', lat: 35.13, lng: 33.43, flag: '🇨🇾' },
  CZ: { name: 'Czechia', lat: 49.82, lng: 15.47, flag: '🇨🇿' },
  DK: { name: 'Denmark', lat: 56.26, lng: 9.50, flag: '🇩🇰' },
  DO: { name: 'Dominican Republic', lat: 18.74, lng: -70.16, flag: '🇩🇴' },
  EC: { name: 'Ecuador', lat: -1.83, lng: -78.18, flag: '🇪🇨' },
  EG: { name: 'Egypt', lat: 26.82, lng: 30.80, flag: '🇪🇬' },
  SV: { name: 'El Salvador', lat: 13.79, lng: -88.90, flag: '🇸🇻' },
  EE: { name: 'Estonia', lat: 58.60, lng: 25.01, flag: '🇪🇪' },
  ET: { name: 'Ethiopia', lat: 9.15, lng: 40.49, flag: '🇪🇹' },
  FI: { name: 'Finland', lat: 61.92, lng: 25.75, flag: '🇫🇮' },
  FR: { name: 'France', lat: 46.23, lng: 2.21, flag: '🇫🇷' },
  GE: { name: 'Georgia', lat: 42.32, lng: 43.36, flag: '🇬🇪' },
  DE: { name: 'Germany', lat: 51.17, lng: 10.45, flag: '🇩🇪' },
  GH: { name: 'Ghana', lat: 7.95, lng: -1.02, flag: '🇬🇭' },
  GR: { name: 'Greece', lat: 39.07, lng: 21.82, flag: '🇬🇷' },
  GT: { name: 'Guatemala', lat: 15.78, lng: -90.23, flag: '🇬🇹' },
  HN: { name: 'Honduras', lat: 15.20, lng: -86.24, flag: '🇭🇳' },
  HK: { name: 'Hong Kong', lat: 22.40, lng: 114.11, flag: '🇭🇰' },
  HU: { name: 'Hungary', lat: 47.16, lng: 19.50, flag: '🇭🇺' },
  IS: { name: 'Iceland', lat: 64.96, lng: -19.02, flag: '🇮🇸' },
  IN: { name: 'India', lat: 20.59, lng: 78.96, flag: '🇮🇳' },
  ID: { name: 'Indonesia', lat: -0.79, lng: 113.92, flag: '🇮🇩' },
  IR: { name: 'Iran', lat: 32.43, lng: 53.69, flag: '🇮🇷' },
  IQ: { name: 'Iraq', lat: 33.22, lng: 43.68, flag: '🇮🇶' },
  IE: { name: 'Ireland', lat: 53.14, lng: -7.69, flag: '🇮🇪' },
  IL: { name: 'Israel', lat: 31.05, lng: 34.85, flag: '🇮🇱' },
  IT: { name: 'Italy', lat: 41.87, lng: 12.57, flag: '🇮🇹' },
  JM: { name: 'Jamaica', lat: 18.11, lng: -77.30, flag: '🇯🇲' },
  JP: { name: 'Japan', lat: 36.20, lng: 138.25, flag: '🇯🇵' },
  JO: { name: 'Jordan', lat: 30.59, lng: 36.24, flag: '🇯🇴' },
  KZ: { name: 'Kazakhstan', lat: 48.02, lng: 66.92, flag: '🇰🇿' },
  KE: { name: 'Kenya', lat: -0.02, lng: 37.91, flag: '🇰🇪' },
  KW: { name: 'Kuwait', lat: 29.31, lng: 47.48, flag: '🇰🇼' },
  KG: { name: 'Kyrgyzstan', lat: 41.20, lng: 74.77, flag: '🇰🇬' },
  LV: { name: 'Latvia', lat: 56.88, lng: 24.60, flag: '🇱🇻' },
  LB: { name: 'Lebanon', lat: 33.85, lng: 35.86, flag: '🇱🇧' },
  LY: { name: 'Libya', lat: 26.34, lng: 17.23, flag: '🇱🇾' },
  LT: { name: 'Lithuania', lat: 55.17, lng: 23.88, flag: '🇱🇹' },
  LU: { name: 'Luxembourg', lat: 49.82, lng: 6.13, flag: '🇱🇺' },
  MY: { name: 'Malaysia', lat: 4.21, lng: 101.98, flag: '🇲🇾' },
  MX: { name: 'Mexico', lat: 23.63, lng: -102.55, flag: '🇲🇽' },
  MA: { name: 'Morocco', lat: 31.79, lng: -7.09, flag: '🇲🇦' },
  MM: { name: 'Myanmar', lat: 21.91, lng: 95.96, flag: '🇲🇲' },
  NP: { name: 'Nepal', lat: 28.39, lng: 84.12, flag: '🇳🇵' },
  NL: { name: 'Netherlands', lat: 52.13, lng: 5.29, flag: '🇳🇱' },
  NZ: { name: 'New Zealand', lat: -40.90, lng: 174.89, flag: '🇳🇿' },
  NG: { name: 'Nigeria', lat: 9.08, lng: 8.68, flag: '🇳🇬' },
  KP: { name: 'North Korea', lat: 40.34, lng: 127.51, flag: '🇰🇵' },
  NO: { name: 'Norway', lat: 60.47, lng: 8.47, flag: '🇳🇴' },
  OM: { name: 'Oman', lat: 21.47, lng: 55.98, flag: '🇴🇲' },
  PK: { name: 'Pakistan', lat: 30.38, lng: 69.35, flag: '🇵🇰' },
  PA: { name: 'Panama', lat: 8.54, lng: -80.78, flag: '🇵🇦' },
  PY: { name: 'Paraguay', lat: -23.44, lng: -58.44, flag: '🇵🇾' },
  PE: { name: 'Peru', lat: -9.19, lng: -75.02, flag: '🇵🇪' },
  PH: { name: 'Philippines', lat: 12.88, lng: 121.77, flag: '🇵🇭' },
  PL: { name: 'Poland', lat: 51.92, lng: 19.15, flag: '🇵🇱' },
  PT: { name: 'Portugal', lat: 39.40, lng: -8.22, flag: '🇵🇹' },
  QA: { name: 'Qatar', lat: 25.35, lng: 51.18, flag: '🇶🇦' },
  RO: { name: 'Romania', lat: 45.94, lng: 24.97, flag: '🇷🇴' },
  RU: { name: 'Russia', lat: 61.52, lng: 105.32, flag: '🇷🇺' },
  SA: { name: 'Saudi Arabia', lat: 23.89, lng: 45.08, flag: '🇸🇦' },
  SN: { name: 'Senegal', lat: 14.50, lng: -14.45, flag: '🇸🇳' },
  RS: { name: 'Serbia', lat: 44.02, lng: 21.01, flag: '🇷🇸' },
  SG: { name: 'Singapore', lat: 1.35, lng: 103.82, flag: '🇸🇬' },
  SK: { name: 'Slovakia', lat: 48.67, lng: 19.70, flag: '🇸🇰' },
  SI: { name: 'Slovenia', lat: 46.15, lng: 14.99, flag: '🇸🇮' },
  ZA: { name: 'South Africa', lat: -30.56, lng: 22.94, flag: '🇿🇦' },
  KR: { name: 'South Korea', lat: 35.91, lng: 127.77, flag: '🇰🇷' },
  ES: { name: 'Spain', lat: 40.46, lng: -3.75, flag: '🇪🇸' },
  LK: { name: 'Sri Lanka', lat: 7.87, lng: 80.77, flag: '🇱🇰' },
  SE: { name: 'Sweden', lat: 60.13, lng: 18.64, flag: '🇸🇪' },
  CH: { name: 'Switzerland', lat: 46.82, lng: 8.23, flag: '🇨🇭' },
  TW: { name: 'Taiwan', lat: 23.70, lng: 120.96, flag: '🇹🇼' },
  TZ: { name: 'Tanzania', lat: -6.37, lng: 34.89, flag: '🇹🇿' },
  TH: { name: 'Thailand', lat: 15.87, lng: 100.99, flag: '🇹🇭' },
  TN: { name: 'Tunisia', lat: 33.89, lng: 9.54, flag: '🇹🇳' },
  TR: { name: 'Turkey', lat: 38.96, lng: 35.24, flag: '🇹🇷' },
  UA: { name: 'Ukraine', lat: 48.38, lng: 31.17, flag: '🇺🇦' },
  AE: { name: 'UAE', lat: 23.42, lng: 53.85, flag: '🇦🇪' },
  GB: { name: 'United Kingdom', lat: 55.38, lng: -3.44, flag: '🇬🇧' },
  US: { name: 'United States', lat: 37.09, lng: -95.71, flag: '🇺🇸' },
  UY: { name: 'Uruguay', lat: -32.52, lng: -55.77, flag: '🇺🇾' },
  UZ: { name: 'Uzbekistan', lat: 41.38, lng: 64.59, flag: '🇺🇿' },
  VE: { name: 'Venezuela', lat: 6.42, lng: -66.59, flag: '🇻🇪' },
  VN: { name: 'Vietnam', lat: 14.06, lng: 108.28, flag: '🇻🇳' },
  ZW: { name: 'Zimbabwe', lat: -19.02, lng: 29.15, flag: '🇿🇼' },
  UNKNOWN: { name: 'Unknown', lat: 0, lng: 0, flag: '🌍' },
};

/**
 * Get country info by code. Falls back to UNKNOWN.
 * @param {string} code — ISO 3166-1 alpha-2 code
 * @returns {{ name: string, lat: number, lng: number, flag: string }}
 */
export const getCountryInfo = (code) => {
  const upper = (code || '').toUpperCase();
  return COUNTRIES[upper] || COUNTRIES.UNKNOWN;
};

/**
 * Get all country entries as an array
 * @returns {Array<{ code: string, name: string, lat: number, lng: number, flag: string }>}
 */
export const getAllCountries = () => {
  return Object.entries(COUNTRIES).map(([code, data]) => ({ code, ...data }));
};

export default COUNTRIES;
