export type LatLng = [number, number];

export interface ResolvedLocation {
  coords: LatLng;
  city: string;
  area: string;
  displayName: string;
}

// Curated database of coordinates for Indian cities, hospital hubs, and areas
export const KNOWN_PLACES: {
  keywords: string[];
  city: string;
  area: string;
  coords: LatLng;
}[] = [
  // ── Gwalior & Madhya Pradesh ──────────────────────────────────────────────
  {
    keywords: ["indiranagar, gwalior", "indiranagar gwalior", "indira nagar gwalior", "indiranagar,gwalior", "indiranagar"],
    city: "Gwalior",
    area: "Indiranagar",
    coords: [26.2235, 78.1750],
  },
  {
    keywords: ["apollo demo hospital", "apollo hospital gwalior", "city centre gwalior", "city center gwalior", "city centre"],
    city: "Gwalior",
    area: "City Centre",
    coords: [26.2085, 78.1925],
  },
  {
    keywords: ["jah hospital", "jaya arogya", "lashkar"],
    city: "Gwalior",
    area: "Lashkar",
    coords: [26.2032, 78.1610],
  },
  {
    keywords: ["morar", "morar gwalior"],
    city: "Gwalior",
    area: "Morar",
    coords: [26.2285, 78.2250],
  },
  {
    keywords: ["thatipur", "thatipur gwalior"],
    city: "Gwalior",
    area: "Thatipur",
    coords: [26.2150, 78.2050],
  },
  {
    keywords: ["maharaj bada", "bada gwalior"],
    city: "Gwalior",
    area: "Maharaj Bada",
    coords: [26.2005, 78.1585],
  },
  {
    keywords: ["gwalior fort", "hazira gwalior"],
    city: "Gwalior",
    area: "Hazira",
    coords: [26.2300, 78.1695],
  },
  {
    keywords: ["gwalior"],
    city: "Gwalior",
    area: "Central Gwalior",
    coords: [26.2183, 78.1828],
  },
  {
    keywords: ["aiims bhopal", "bhopal"],
    city: "Bhopal",
    area: "Saket Nagar",
    coords: [23.2085, 77.4580],
  },
  {
    keywords: ["bombay hospital indore", "vijay nagar indore", "indore"],
    city: "Indore",
    area: "Vijay Nagar",
    coords: [22.7565, 75.8925],
  },

  // ── Bengaluru & Karnataka ──────────────────────────────────────────────────
  {
    keywords: ["manipal hospital, old airport rd", "manipal hospital", "hal old airport", "old airport rd", "hal"],
    city: "Bengaluru",
    area: "HAL 2nd Stage",
    coords: [12.9592, 77.6534],
  },
  {
    keywords: ["indiranagar, bengaluru", "indiranagar bangalore"],
    city: "Bengaluru",
    area: "Indiranagar",
    coords: [12.9784, 77.6408],
  },
  {
    keywords: ["narayana health city", "bommasandra", "narayana"],
    city: "Bengaluru",
    area: "Bommasandra",
    coords: [12.8167, 77.6917],
  },
  {
    keywords: ["fortis hospital", "fortis, bannerghatta", "bannerghatta"],
    city: "Bengaluru",
    area: "Bannerghatta Rd",
    coords: [12.8938, 77.5973],
  },
  {
    keywords: ["columbia asia referral hospital", "columbia asia", "yeshwanthpur"],
    city: "Bengaluru",
    area: "Yeshwanthpur",
    coords: [13.0189, 77.5562],
  },
  {
    keywords: ["st. john's medical college", "st. johns", "sarjapur"],
    city: "Bengaluru",
    area: "Sarjapur Rd",
    coords: [12.9317, 77.6186],
  },
  {
    keywords: ["koramangala"],
    city: "Bengaluru",
    area: "Koramangala",
    coords: [12.9352, 77.6245],
  },
  {
    keywords: ["whitefield"],
    city: "Bengaluru",
    area: "Whitefield",
    coords: [12.9698, 77.7499],
  },
  {
    keywords: ["hsr layout", "hsr"],
    city: "Bengaluru",
    area: "HSR Layout",
    coords: [12.9121, 77.6446],
  },
  {
    keywords: ["bengaluru", "bangalore"],
    city: "Bengaluru",
    area: "Central Bengaluru",
    coords: [12.9716, 77.5946],
  },

  // ── Delhi & NCR ────────────────────────────────────────────────────────────
  {
    keywords: ["red cross blood bank", "red cross rd", "central delhi"],
    city: "Delhi",
    area: "Central Delhi",
    coords: [28.6225, 77.2100],
  },
  {
    keywords: ["aiims new delhi", "aiims delhi", "ansari nagar"],
    city: "Delhi",
    area: "Ansari Nagar",
    coords: [28.5672, 77.2100],
  },
  {
    keywords: ["safdarjung hospital", "safdarjung"],
    city: "Delhi",
    area: "Safdarjung",
    coords: [28.5695, 77.2065],
  },
  {
    keywords: ["connaught place", "cp delhi"],
    city: "Delhi",
    area: "Connaught Place",
    coords: [28.6315, 77.2167],
  },
  {
    keywords: ["max hospital saket", "saket"],
    city: "Delhi",
    area: "Saket",
    coords: [28.5244, 77.2150],
  },
  {
    keywords: ["delhi", "new delhi", "noida", "gurgaon"],
    city: "Delhi",
    area: "NCR",
    coords: [28.6139, 77.2090],
  },

  // ── Mumbai & Maharashtra ───────────────────────────────────────────────────
  {
    keywords: ["kem hospital mumbai", "kem hospital", "parel"],
    city: "Mumbai",
    area: "Parel",
    coords: [18.9985, 72.8425],
  },
  {
    keywords: ["lilavati hospital", "bandra"],
    city: "Mumbai",
    area: "Bandra West",
    coords: [19.0515, 72.8290],
  },
  {
    keywords: ["hinduja hospital", "mahim"],
    city: "Mumbai",
    area: "Mahim",
    coords: [19.0345, 72.8395],
  },
  {
    keywords: ["andheri"],
    city: "Mumbai",
    area: "Andheri",
    coords: [19.1197, 72.8464],
  },
  {
    keywords: ["mumbai", "bombay"],
    city: "Mumbai",
    area: "South Mumbai",
    coords: [19.0760, 72.8777],
  },
  {
    keywords: ["ruby hall clinic", "kem pune", "pune"],
    city: "Pune",
    area: "Shivajinagar",
    coords: [18.5325, 73.8765],
  },

  // ── Hyderabad, Chennai, Kolkata, Jaipur, Lucknow, Chandigarh ───────────────
  {
    keywords: ["apollo jubilee hills", "hyderabad", "secunderabad"],
    city: "Hyderabad",
    area: "Jubilee Hills",
    coords: [17.4165, 78.4110],
  },
  {
    keywords: ["apollo greams rd", "chennai", "madras"],
    city: "Chennai",
    area: "Greams Road",
    coords: [13.0605, 80.2520],
  },
  {
    keywords: ["sskm hospital", "kolkata", "calcutta"],
    city: "Kolkata",
    area: "Bhowanipore",
    coords: [22.5385, 88.3440],
  },
  {
    keywords: ["sms hospital", "jaipur"],
    city: "Jaipur",
    area: "JLN Marg",
    coords: [26.8965, 75.8185],
  },
  {
    keywords: ["sgpgi", "lucknow"],
    city: "Lucknow",
    area: "Raebareli Rd",
    coords: [26.7455, 80.9380],
  },
  {
    keywords: ["pgimer", "chandigarh"],
    city: "Chandigarh",
    area: "Sector 12",
    coords: [30.7650, 76.7750],
  },
];

/**
 * Resolve geographic coordinates giving highest priority to:
 * 1. Explicit coordinates filled in database/request/donor
 * 2. Explicit city context filled by requester/donor (e.g. Gwalior)
 * 3. Matched area/hospital keywords
 */
export function resolveLocationCoordinates(
  text?: string,
  cityContext?: string,
  areaContext?: string,
  fallbackCoords?: LatLng
): ResolvedLocation {
  // 1. Priority #1: Explicit coordinates from database / request / donor
  if (fallbackCoords && fallbackCoords[0] && fallbackCoords[1]) {
    const isGwaliorLat = fallbackCoords[0] > 26.0 && fallbackCoords[0] < 26.5;
    const isBengaluruLat = fallbackCoords[0] > 12.5 && fallbackCoords[0] < 13.5;
    const isDelhiLat = fallbackCoords[0] > 28.3 && fallbackCoords[0] < 28.9;
    const isMumbaiLat = fallbackCoords[0] > 18.8 && fallbackCoords[0] < 19.3;

    const detectedCity =
      cityContext ||
      (isGwaliorLat
        ? "Gwalior"
        : isBengaluruLat
        ? "Bengaluru"
        : isDelhiLat
        ? "Delhi"
        : isMumbaiLat
        ? "Mumbai"
        : "Local Area");

    const detectedArea = areaContext || "Emergency Destination";

    return {
      coords: fallbackCoords,
      city: detectedCity,
      area: detectedArea,
      displayName: `${detectedArea}, ${detectedCity}`,
    };
  }

  const cleanCity = (cityContext || "").toLowerCase().trim();
  const cleanText = (text || "").toLowerCase().trim();
  const cleanArea = (areaContext || "").toLowerCase().trim();

  // 2. Priority #2: Explicit City Context Constraint (e.g. requester/donor filled "Gwalior")
  if (cleanCity) {
    const cityPlaces = KNOWN_PLACES.filter((p) => p.city.toLowerCase() === cleanCity);
    if (cityPlaces.length > 0) {
      // Find area match within this city
      for (const place of cityPlaces) {
        for (const kw of place.keywords) {
          if (cleanText.includes(kw) || cleanArea.includes(kw)) {
            return {
              coords: place.coords,
              city: place.city,
              area: place.area,
              displayName: `${place.area}, ${place.city}`,
            };
          }
        }
      }
      // If no specific hospital in this city matched, use the city's primary center
      const defaultInCity = cityPlaces[0];
      return {
        coords: defaultInCity.coords,
        city: defaultInCity.city,
        area: areaContext || defaultInCity.area,
        displayName: `${areaContext || defaultInCity.area}, ${defaultInCity.city}`,
      };
    }
  }

  // 3. Priority #3: Match across all known places by text / area keywords
  const combined = [cleanText, cleanArea, cleanCity].filter(Boolean).join(" ");
  if (combined) {
    for (const place of KNOWN_PLACES) {
      for (const kw of place.keywords) {
        if (combined.includes(kw.toLowerCase())) {
          return {
            coords: place.coords,
            city: place.city,
            area: place.area,
            displayName: `${place.area}, ${place.city}`,
          };
        }
      }
    }
  }

  // 4. Default to Gwalior if "gwalior" appears in any user context, else primary hub
  if (combined.includes("gwalior")) {
    return {
      coords: [26.2235, 78.1750],
      city: "Gwalior",
      area: "Indiranagar",
      displayName: "Indiranagar, Gwalior",
    };
  }

  return {
    coords: [26.2183, 78.1828],
    city: "Gwalior",
    area: "Indiranagar",
    displayName: "Indiranagar, Gwalior",
  };
}

/**
 * Given a destination coordinate, synthesize a nearby donor origin coordinate within 2.5 - 4.5 km
 * in the same city if the donor's exact coordinates are not known.
 */
export function resolveNearbyDonorCoordinates(
  destination: LatLng,
  donorArea?: string,
  donorCity?: string
): ResolvedLocation {
  if (donorCity) {
    const cleanCity = donorCity.toLowerCase().trim();
    const cityPlaces = KNOWN_PLACES.filter((p) => p.city.toLowerCase() === cleanCity);
    if (cityPlaces.length > 1) {
      const donorBase =
        cityPlaces.find(
          (p) =>
            p.area.toLowerCase().includes("morar") ||
            p.area.toLowerCase().includes("thatipur") ||
            p.area.toLowerCase().includes("koramangala")
        ) || cityPlaces[1];

      return {
        coords: donorBase.coords,
        city: donorBase.city,
        area: donorArea || donorBase.area,
        displayName: `${donorArea || donorBase.area}, ${donorBase.city}`,
      };
    }
  }

  // Displace donor 2.5 - 3.5 km north-east/west of the hospital in the same city
  const latOffset = 0.0185;
  const lngOffset = -0.0165;
  const donorCoords: LatLng = [
    Number((destination[0] + latOffset).toFixed(5)),
    Number((destination[1] + lngOffset).toFixed(5)),
  ];

  return {
    coords: donorCoords,
    city: donorCity || "Gwalior",
    area: donorArea || "Morar",
    displayName: `${donorArea || "Morar"}, ${donorCity || "Gwalior"}`,
  };
}

/**
 * Generate realistic driving waypoints (7 points) connecting start to destination.
 */
export function generateDrivingRoute(
  start: LatLng,
  end: LatLng,
  pointsCount = 7
): LatLng[] {
  const route: LatLng[] = [start];
  const dLat = end[0] - start[0];
  const dLng = end[1] - start[1];

  for (let i = 1; i < pointsCount - 1; i++) {
    const t = i / (pointsCount - 1);
    // Add realistic road curve simulating city street navigation
    const curvature = Math.sin(t * Math.PI) * 0.003 * (i % 2 === 0 ? 1 : -0.8);
    const lat = start[0] + dLat * t + curvature;
    const lng = start[1] + dLng * t + curvature * 0.7;
    route.push([Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
  }

  route.push(end);
  return route;
}

/**
 * Calculate distance in km using Haversine formula with a 1.25x street routing factor.
 */
export function calculateDistanceKm(p1: LatLng, p2: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[0] * Math.PI) / 180) *
      Math.cos((p2[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number(Math.max(0.8, R * c * 1.25).toFixed(1));
}

/**
 * Calculate ETA in minutes based on distance and average urban speed (30 km/h).
 */
export function calculateEtaMinutes(distanceKm: number, avgSpeedKmh = 30): number {
  return Math.max(3, Math.round((distanceKm / avgSpeedKmh) * 60));
}
