/**
 * Transit, Distance, and Route Estimation Utility for CommuteX
 */

export const CITY_COORDINATES = {
  // North India
  "chandigarh": { lat: 30.7333, lng: 76.7794, name: "Chandigarh" },
  "delhi": { lat: 28.6139, lng: 77.2090, name: "New Delhi" },
  "new delhi": { lat: 28.6139, lng: 77.2090, name: "New Delhi" },
  "gurgaon": { lat: 28.4595, lng: 77.0266, name: "Gurgaon" },
  "gurugram": { lat: 28.4595, lng: 77.0266, name: "Gurugram" },
  "noida": { lat: 28.5355, lng: 77.3910, name: "Noida" },
  "greater noida": { lat: 28.4744, lng: 77.5040, name: "Greater Noida" },
  "ghaziabad": { lat: 28.6692, lng: 77.4538, name: "Ghaziabad" },
  "faridabad": { lat: 28.4089, lng: 77.3178, name: "Faridabad" },
  "panchkula": { lat: 30.6942, lng: 76.8606, name: "Panchkula" },
  "mohali": { lat: 30.7046, lng: 76.7179, name: "Mohali" },
  "zirakpur": { lat: 30.6425, lng: 76.8173, name: "Zirakpur" },
  "amritsar": { lat: 31.6340, lng: 74.8723, name: "Amritsar" },
  "ludhiana": { lat: 30.9010, lng: 75.8573, name: "Ludhiana" },
  "jalandhar": { lat: 31.3260, lng: 75.5762, name: "Jalandhar" },
  "shimla": { lat: 31.1048, lng: 77.1734, name: "Shimla" },
  "dehradun": { lat: 30.3165, lng: 78.0322, name: "Dehradun" },
  "jaipur": { lat: 26.9124, lng: 75.7873, name: "Jaipur" },
  "agra": { lat: 27.1767, lng: 78.0081, name: "Agra" },
  "lucknow": { lat: 26.8467, lng: 80.9462, name: "Lucknow" },
  "kanpur": { lat: 26.4499, lng: 80.3319, name: "Kanpur" },

  // West India
  "mumbai": { lat: 19.0760, lng: 72.8777, name: "Mumbai" },
  "pune": { lat: 18.5204, lng: 73.8567, name: "Pune" },
  "navi mumbai": { lat: 19.0330, lng: 73.0297, name: "Navi Mumbai" },
  "thane": { lat: 19.2183, lng: 72.9781, name: "Thane" },
  "ahmedabad": { lat: 23.0225, lng: 72.5714, name: "Ahmedabad" },
  "surat": { lat: 21.1702, lng: 72.8311, name: "Surat" },
  "vadodara": { lat: 22.3072, lng: 73.1812, name: "Vadodara" },
  "nagpur": { lat: 21.1458, lng: 79.0882, name: "Nagpur" },
  "nashik": { lat: 19.9975, lng: 73.7898, name: "Nashik" },
  "goa": { lat: 15.2993, lng: 74.1240, name: "Goa" },

  // South India
  "bangalore": { lat: 12.9716, lng: 77.5946, name: "Bengaluru" },
  "bengaluru": { lat: 12.9716, lng: 77.5946, name: "Bengaluru" },
  "hyderabad": { lat: 17.3850, lng: 78.4867, name: "Hyderabad" },
  "chennai": { lat: 13.0827, lng: 80.2707, name: "Chennai" },
  "kochi": { lat: 9.9312, lng: 76.2673, name: "Kochi" },
  "coimbatore": { lat: 11.0168, lng: 76.9558, name: "Coimbatore" },
  "mysore": { lat: 12.2958, lng: 76.6394, name: "Mysuru" },
  "mysuru": { lat: 12.2958, lng: 76.6394, name: "Mysuru" },

  // East & Central
  "kolkata": { lat: 22.5726, lng: 88.3639, name: "Kolkata" },
  "howrah": { lat: 22.5958, lng: 88.2636, name: "Howrah" },
  "patna": { lat: 25.5941, lng: 85.1376, name: "Patna" },
  "bhubaneswar": { lat: 20.2961, lng: 85.8245, name: "Bhubaneswar" },
  "indore": { lat: 22.7196, lng: 75.8577, name: "Indore" },
  "bhopal": { lat: 23.2599, lng: 77.4126, name: "Bhopal" }
};

/**
 * Find best matching city coordinate from location string
 */
export const getCoordinates = (locationStr = "") => {
  if (!locationStr) return null;
  const normalized = locationStr.toLowerCase();

  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(key)) {
      return coords;
    }
  }

  // Fallback hash-based deterministic coordinates in India bounds if unknown
  let hash = 0;
  for (let i = 0; i < locationStr.length; i++) {
    hash = (hash << 5) - hash + locationStr.charCodeAt(i);
    hash |= 0;
  }
  const lat = 18 + Math.abs(hash % 12); // between 18N and 30N
  const lng = 73 + Math.abs((hash >> 4) % 15); // between 73E and 88E
  return { lat, lng, name: locationStr.split(",")[0] };
};

/**
 * Haversine formula to calculate accurate great-circle distance (km)
 */
const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(coords2.lat - coords1.lat);
  const dLng = toRad(coords2.lng - coords1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1.lat)) *
      Math.cos(toRad(coords2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculates road distance between two locations
 * Applies a 1.25 road curvature factor to great-circle distance
 */
export const estimateRoadDistance = (fromStr, toStr) => {
  const fromCoords = getCoordinates(fromStr);
  const toCoords = getCoordinates(toStr);

  if (!fromCoords || !toCoords) return 120; // sensible fallback km

  const direct = haversineDistance(fromCoords, toCoords);
  if (direct < 5) return 15; // intra-city min

  // Highway road factor in India is ~1.22 to 1.30
  const roadKm = Math.round(direct * 1.25);
  return roadKm;
};

/**
 * Calculates estimated travel duration formatted as string
 */
export const estimateTravelDuration = (distanceKm, transportMode = "car") => {
  const mode = (transportMode || "").toLowerCase();
  let avgSpeedKmH = 65; // average highway speed in India for passenger cars

  if (mode.includes("bike") || mode.includes("motorcycle")) {
    avgSpeedKmH = 55;
  } else if (mode.includes("suv") || mode.includes("sedan")) {
    avgSpeedKmH = 70;
  } else if (mode.includes("bus")) {
    avgSpeedKmH = 50;
  }

  const hours = distanceKm / avgSpeedKmH;
  const totalMinutes = Math.round(hours * 60);

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h === 0) return `${m} mins`;
  if (m === 0) return `${h} hr${h > 1 ? "s" : ""}`;
  return `${h} hr${h > 1 ? "s" : ""} ${m} mins`;
};
