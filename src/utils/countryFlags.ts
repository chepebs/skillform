/**
 * Convert a country code to a flag emoji
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "US", "MX", "CR")
 * @returns Flag emoji string
 */
export const getCountryFlag = (countryCode: string | null | undefined): string => {
  if (!countryCode) return '';
  
  // Convert country code to flag emoji
  // Each letter is converted to a regional indicator symbol
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

/**
 * Get the URL for a country flag image
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param width - Width of the flag image (default: 40)
 * @returns URL to the flag image
 */
export const getFlagImageUrl = (countryCode: string | null | undefined, width: number = 40): string | null => {
  if (!countryCode) return null;
  return `https://flagcdn.com/w${width}/${countryCode.toLowerCase()}.png`;
};

/**
 * Common country codes for Central America and Latin America
 */
export const LATAM_COUNTRY_CODES: Record<string, string> = {
  'Costa Rica': 'CR',
  'Guatemala': 'GT',
  'El Salvador': 'SV',
  'Honduras': 'HN',
  'Nicaragua': 'NI',
  'Panama': 'PA',
  'Mexico': 'MX',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Chile': 'CL',
  'Argentina': 'AR',
  'Brazil': 'BR',
  'Ecuador': 'EC',
  'Venezuela': 'VE',
  'Bolivia': 'BO',
  'Paraguay': 'PY',
  'Uruguay': 'UY',
  'Dominican Republic': 'DO',
  'Puerto Rico': 'PR',
  'Cuba': 'CU',
  'United States': 'US',
  'Spain': 'ES',
};
