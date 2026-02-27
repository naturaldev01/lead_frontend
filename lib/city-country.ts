// City to Country lookup service
// Uses dr5hn/countries-states-cities-database for comprehensive city data
// This includes districts and towns, not just major cities

interface CountryData {
  name: string;
  cities: string[];
}

// Cache for city-to-country mapping
let cityToCountryMap: Map<string, string> | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

// Normalize city name for comparison
function normalizeCity(city: string): string {
  return city
    // Turkish character normalization BEFORE lowercase (important!)
    .replace(/İ/g, "I")  // Turkish İ -> I
    .replace(/I/g, "i")  // Then I -> i (for consistent lowercase)
    .replace(/ı/g, "i")  // Turkish ı -> i
    .replace(/Ğ/g, "g")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/ş/g, "s")
    .replace(/Ö/g, "o")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "c")
    .replace(/ç/g, "c")
    .toLowerCase()
    .trim()
    // Common accent characters
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ý]/g, "y")
    // Remove extra whitespace
    .replace(/\s+/g, " ");
}

// Load city-country data from GitHub database
async function loadCityCountryData(): Promise<void> {
  if (cityToCountryMap !== null) return;
  if (isLoading && loadPromise) return loadPromise;

  isLoading = true;
  loadPromise = (async () => {
    try {
      // Using dr5hn/countries-states-cities-database - comprehensive database with 150k+ cities
      const response = await fetch(
        "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries%2Bcities.json"
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: CountryData[] = await response.json();

      cityToCountryMap = new Map();

      for (const countryData of data) {
        for (const city of countryData.cities) {
          const normalizedCity = normalizeCity(city);
          // Only set if not already set (first country wins for duplicates)
          if (!cityToCountryMap.has(normalizedCity)) {
            cityToCountryMap.set(normalizedCity, countryData.name);
          }
        }
      }

      console.log(`[CityCountry] Loaded ${cityToCountryMap.size} city mappings from comprehensive database`);
    } catch (error) {
      console.error("[CityCountry] Failed to load city-country data:", error);
      cityToCountryMap = new Map();
    } finally {
      isLoading = false;
    }
  })();

  return loadPromise;
}

// Get country by city name
export async function getCountryByCity(city: string): Promise<string | null> {
  if (!city || city.trim() === "") return null;

  await loadCityCountryData();

  if (!cityToCountryMap) return null;

  const normalizedCity = normalizeCity(city);
  return cityToCountryMap.get(normalizedCity) || null;
}

// Synchronous version - returns null if data not loaded yet
export function getCountryByCitySync(city: string): string | null {
  if (!city || city.trim() === "" || !cityToCountryMap) {
    return null;
  }

  const normalizedCity = normalizeCity(city);
  
  // Try exact match first
  let result = cityToCountryMap.get(normalizedCity);
  if (result) return result;
  
  // Try splitting by comma (e.g., "Fethiye, Muğla" -> try "Fethiye")
  if (city.includes(",")) {
    const parts = city.split(",").map(p => p.trim());
    for (const part of parts) {
      const normalizedPart = normalizeCity(part);
      result = cityToCountryMap.get(normalizedPart);
      if (result) return result;
    }
  }
  
  // Try splitting by dash or slash (e.g., "City/Province" or "City - Province")
  const splitChars = ["/", " - ", " / "];
  for (const splitter of splitChars) {
    if (city.includes(splitter)) {
      const parts = city.split(splitter).map(p => p.trim());
      for (const part of parts) {
        const normalizedPart = normalizeCity(part);
        result = cityToCountryMap.get(normalizedPart);
        if (result) return result;
      }
    }
  }
  
  // Try partial match for compound names (e.g., "Ekiti" in "Ado-Ekiti")
  // Only for inputs of 5+ characters to avoid false positives
  if (normalizedCity.length >= 5) {
    for (const [mapCity, country] of cityToCountryMap.entries()) {
      // Check if the input is a suffix (e.g., "ekiti" matches "ado-ekiti")
      // The map city must end with dash/space + our input
      if (mapCity.endsWith("-" + normalizedCity) || mapCity.endsWith(" " + normalizedCity)) {
        return country;
      }
    }
  }
  
  return null;
}

// Initialize the data (call this on app start)
export function initCityCountryData(): Promise<void> {
  return loadCityCountryData();
}

// Check if data is loaded
export function isCityCountryDataLoaded(): boolean {
  return cityToCountryMap !== null && cityToCountryMap.size > 0;
}
