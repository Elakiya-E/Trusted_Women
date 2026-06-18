export interface CityBookingPoint {
  city: string;
  bookings: number;
  growthPct: number;
  density: number;
  repeatCustomers: number;
  topService: string;
  lat: number;
  lng: number;
  state: string;
}

export interface TopLocationEntry {
  rank: number;
  name: string;
  bookings: number;
  pct: number;
  trend: "up" | "down" | "stable";
}

const CITY_META: Record<
  string,
  Omit<CityBookingPoint, "city" | "bookings" | "density">
> = {
  Chennai: {
    growthPct: 12,
    repeatCustomers: 34,
    topService: "Hospital Attendant",
    lat: 13.0827,
    lng: 80.2707,
    state: "Tamil Nadu",
  },
  Bengaluru: {
    growthPct: 18,
    repeatCustomers: 41,
    topService: "Airport Pickup",
    lat: 12.9716,
    lng: 77.5946,
    state: "Karnataka",
  },
  Hyderabad: {
    growthPct: 9,
    repeatCustomers: 28,
    topService: "Elderly Care",
    lat: 17.385,
    lng: 78.4867,
    state: "Telangana",
  },
  Coimbatore: {
    growthPct: 7,
    repeatCustomers: 19,
    topService: "Railway Pickup",
    lat: 11.0168,
    lng: 76.9558,
    state: "Tamil Nadu",
  },
  Madurai: {
    growthPct: 5,
    repeatCustomers: 14,
    topService: "Home Support",
    lat: 9.9252,
    lng: 78.1198,
    state: "Tamil Nadu",
  },
  Mumbai: {
    growthPct: 15,
    repeatCustomers: 52,
    topService: "Women Driver",
    lat: 19.076,
    lng: 72.8777,
    state: "Maharashtra",
  },
  Delhi: {
    growthPct: 11,
    repeatCustomers: 38,
    topService: "Hospital Attendant",
    lat: 28.6139,
    lng: 77.209,
    state: "NCT of Delhi",
  },
};

const DEFAULT_BOOKINGS: Record<string, number> = {
  Chennai: 85,
  Bengaluru: 120,
  Hyderabad: 60,
  Coimbatore: 40,
  Madurai: 28,
  Mumbai: 95,
  Delhi: 72,
};

const PERIOD_MULTIPLIER: Record<string, number> = {
  Today: 0.06,
  "This Week": 0.28,
  "This Month": 1,
  "This Year": 1.35,
};

export const DEFAULT_TOP_LOCATIONS: TopLocationEntry[] = [
  { rank: 1, name: "Chennai Central", bookings: 85, pct: 24.1, trend: "up" },
  { rank: 2, name: "Bengaluru Airport", bookings: 72, pct: 20.5, trend: "up" },
  { rank: 3, name: "Coimbatore Junction", bookings: 40, pct: 11.4, trend: "up" },
];

function computeDensity(bookings: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((bookings / max) * 100);
}

export function generateDummyCityData(): CityBookingPoint[] {
  const max = Math.max(...Object.values(DEFAULT_BOOKINGS));
  return Object.keys(CITY_META).map((city) => {
    const meta = CITY_META[city];
    const bookings = DEFAULT_BOOKINGS[city] ?? 20;
    return {
      city,
      bookings,
      density: computeDensity(bookings, max),
      ...meta,
    };
  });
}

export function enrichCityStatsFromApi(
  cityStats: { city: string; bookings: number }[]
): CityBookingPoint[] {
  if (cityStats.length === 0) return generateDummyCityData();

  const max = Math.max(...cityStats.map((c) => c.bookings), 1);
  const knownCities = new Set(cityStats.map((c) => c.city.trim()));

  const fromApi = cityStats.map((c) => {
    const key = Object.keys(CITY_META).find(
      (k) => k.toLowerCase() === c.city.trim().toLowerCase()
    );
    const meta = key ? CITY_META[key] : CITY_META.Chennai;
    const cityName = key || c.city.trim();
    return {
      city: cityName,
      bookings: c.bookings,
      density: computeDensity(c.bookings, max),
      growthPct: meta.growthPct,
      repeatCustomers: Math.max(1, Math.round(c.bookings * 0.38)),
      topService: meta.topService,
      lat: meta.lat,
      lng: meta.lng,
      state: meta.state,
    };
  });

  // Ensure all 7 target cities appear on the map
  const missing = Object.keys(CITY_META).filter((city) => {
    return !Array.from(knownCities).some(
      (k) => k.toLowerCase() === city.toLowerCase()
    );
  });

  const padded = missing.map((city) => {
    const meta = CITY_META[city];
    const bookings = Math.max(8, Math.round(max * 0.12));
    return {
      city,
      bookings,
      density: computeDensity(bookings, max),
      growthPct: meta.growthPct,
      repeatCustomers: meta.repeatCustomers,
      topService: meta.topService,
      lat: meta.lat,
      lng: meta.lng,
      state: meta.state,
    };
  });

  return [...fromApi, ...padded];
}

export function applyMapFilters(
  cities: CityBookingPoint[],
  period: string,
  cityFilter: string,
  serviceFilter: string
): CityBookingPoint[] {
  const multiplier = PERIOD_MULTIPLIER[period] ?? 1;

  return cities
    .filter((c) => {
      if (cityFilter !== "All Cities" && c.city !== cityFilter) return false;
      if (
        serviceFilter !== "All Services" &&
        c.topService !== serviceFilter
      ) {
        return false;
      }
      return true;
    })
    .map((c) => ({
      ...c,
      bookings: Math.max(1, Math.round(c.bookings * multiplier)),
      repeatCustomers: Math.max(
        1,
        Math.round(c.repeatCustomers * multiplier)
      ),
    }));
}

export function aggregateStateBookings(
  cities: CityBookingPoint[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  cities.forEach((c) => {
    totals[c.state] = (totals[c.state] || 0) + c.bookings;
  });
  return totals;
}

export function getBookingColor(
  bookings: number,
  max: number
): string {
  if (max <= 0) return "#DBEAFE";
  const ratio = bookings / max;
  if (ratio < 0.33) return "#DBEAFE";
  if (ratio < 0.66) return "#818CF8";
  return "#4338CA";
}

/** Match GeoJSON state property names to our state keys */
export function matchGeoStateName(geoName: string): string {
  const n = geoName.trim();
  if (n === "Delhi" || n === "National Capital Territory of Delhi") {
    return "NCT of Delhi";
  }
  return n;
}
