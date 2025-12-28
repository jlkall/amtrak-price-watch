/**
 * Amtrak Station Code Mapping
 * 
 * Maps city names to Amtrak station codes.
 * Amtrak uses 3-letter codes (e.g., NYP for New York Penn, BOS for Boston).
 */

export const STATION_CODES: Record<string, string> = {
  // New York area
  'NYC': 'NYP', // New York Penn Station
  'New York': 'NYP',
  'New York City': 'NYP',
  'Manhattan': 'NYP',
  
  // Boston
  'Boston': 'BOS',
  'BOS': 'BOS',
  
  // Washington DC
  'DC': 'WAS', // Washington Union Station
  'Washington': 'WAS',
  'Washington DC': 'WAS',
  'Washington, DC': 'WAS',
  
  // Philadelphia
  'Philadelphia': 'PHL', // 30th Street Station
  'PHL': 'PHL',
  
  // Richmond
  'Richmond': 'RVR', // Richmond Staples Mill Road
  'RVR': 'RVR',
}

/**
 * Get Amtrak station code from city name
 * 
 * @param cityName - City name (e.g., "NYC", "New York", "Boston")
 * @returns Station code (e.g., "NYP", "BOS") or null if not found
 */
export function getStationCode(cityName: string): string | null {
  const normalized = cityName.trim()
  
  // Direct lookup
  if (STATION_CODES[normalized]) {
    return STATION_CODES[normalized]
  }
  
  // Case-insensitive lookup
  const upper = normalized.toUpperCase()
  for (const [key, code] of Object.entries(STATION_CODES)) {
    if (key.toUpperCase() === upper) {
      return code
    }
  }
  
  // Partial match (e.g., "New York" matches "New York City")
  for (const [key, code] of Object.entries(STATION_CODES)) {
    if (key.toLowerCase().includes(normalized.toLowerCase()) ||
        normalized.toLowerCase().includes(key.toLowerCase())) {
      return code
    }
  }
  
  return null
}

/**
 * Get city name from station code (reverse lookup)
 */
export function getCityName(stationCode: string): string | null {
  const upper = stationCode.toUpperCase()
  
  for (const [city, code] of Object.entries(STATION_CODES)) {
    if (code === upper) {
      return city
    }
  }
  
  return null
}

