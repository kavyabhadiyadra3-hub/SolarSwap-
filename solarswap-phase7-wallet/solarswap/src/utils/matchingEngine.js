// SolarSwap · Phase 6 · Smart Buyer-Seller Matching
//
// Ranks currently available listings for a Consumer using a deterministic,
// explainable 0–100 Match Score. No machine learning — just a weighted
// scoring formula over data the Marketplace already has.
//
// Weights (documented, sum to 100):
export const MATCH_WEIGHTS = {
  price: 0.35,
  distance: 0.25,
  availability: 0.15,
  energy: 0.15,
  congestion: 0.1,
};

// A component score >= this threshold earns a "why this match" reason.
const REASON_THRESHOLD = 70;

// ---- Estimated distance (simulated, no maps/GPS) ---------------------------
//
// The `location` field on a listing is free text (e.g. "Ahmedabad"). We
// recognize a handful of nearby Gujarat cities and use a fixed, documented
// distance table between them. Anything unrecognized falls back to a
// default "unknown distance" assumption. This is clearly an ESTIMATE, not
// real GPS/routing data.
const KNOWN_CITIES = ["ahmedabad", "gandhinagar", "vadodara", "surat"];

// Symmetric distance matrix in km (illustrative, not survey-accurate).
const DISTANCE_KM = {
  ahmedabad: { ahmedabad: 0, gandhinagar: 25, vadodara: 110, surat: 265 },
  gandhinagar: { ahmedabad: 25, gandhinagar: 0, vadodara: 130, surat: 290 },
  vadodara: { ahmedabad: 110, gandhinagar: 130, vadodara: 0, surat: 150 },
  surat: { ahmedabad: 265, gandhinagar: 290, vadodara: 150, surat: 0 },
};

const DEFAULT_UNKNOWN_DISTANCE_KM = 150;

function normalize(text = "") {
  return text.trim().toLowerCase();
}

// Finds a known city name mentioned inside a free-text location string.
function matchKnownCity(locationText) {
  const normalized = normalize(locationText);
  return KNOWN_CITIES.find((city) => normalized.includes(city)) || null;
}

// getEstimatedDistanceKm(consumerCity, listingLocationText)
export function getEstimatedDistanceKm(consumerCity, listingLocationText) {
  const from = matchKnownCity(consumerCity);
  const to = matchKnownCity(listingLocationText);

  if (from && to && DISTANCE_KM[from] && DISTANCE_KM[from][to] !== undefined) {
    return DISTANCE_KM[from][to];
  }
  if (from && to && from === to) return 0;
  return DEFAULT_UNKNOWN_DISTANCE_KM;
}

// The list of selectable "I am located in..." options shown in the UI.
export const SIMULATED_LOCATIONS = ["Ahmedabad", "Gandhinagar", "Vadodara", "Surat"];

// ---- Scoring constants ------------------------------------------------------

const SCORING_CONSTANTS = {
  // Price: a listing right at (or below) market price scores full marks;
  // each 1% above market price costs this many points.
  PRICE_PENALTY_PER_PERCENT_ABOVE_MARKET: 4,

  // Distance: points lost per km of estimated distance.
  DISTANCE_PENALTY_PER_KM: 0.35,

  // Energy: remaining_energy at/above this is treated as "plenty" (100 pts).
  ENERGY_REFERENCE_KWH: 50,

  // Availability: points lost per day until the listing's availability_date.
  AVAILABILITY_PENALTY_PER_DAY: 8,

  // Congestion → score mapping (mirrors the market-wide simulated level).
  CONGESTION_SCORE: { Low: 100, Medium: 60, High: 20 },
};

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scorePrice(listingPrice, marketPrice) {
  if (!marketPrice || marketPrice <= 0) return 50;
  const pctAboveMarket = ((listingPrice - marketPrice) / marketPrice) * 100;
  if (pctAboveMarket <= 0) return 100; // at or below market price
  return clampScore(100 - pctAboveMarket * SCORING_CONSTANTS.PRICE_PENALTY_PER_PERCENT_ABOVE_MARKET);
}

function scoreDistance(distanceKm) {
  return clampScore(100 - distanceKm * SCORING_CONSTANTS.DISTANCE_PENALTY_PER_KM);
}

function scoreEnergy(remainingEnergy) {
  const ratio = remainingEnergy / SCORING_CONSTANTS.ENERGY_REFERENCE_KWH;
  return clampScore(ratio * 100);
}

function scoreAvailability(availabilityDate, now) {
  const availableAt = new Date(availabilityDate);
  const daysUntil = Math.max((availableAt - now) / (1000 * 60 * 60 * 24), 0);
  return clampScore(100 - daysUntil * SCORING_CONSTANTS.AVAILABILITY_PENALTY_PER_DAY);
}

function scoreCongestion(congestionLevel) {
  return SCORING_CONSTANTS.CONGESTION_SCORE[congestionLevel] ?? 50;
}

// scoreListing(listing, context)
// context: { marketPrice, consumerLocation, congestionLevel, now }
export function scoreListing(listing, context) {
  const { marketPrice, consumerLocation, congestionLevel, now = new Date() } = context;

  const distanceKm = getEstimatedDistanceKm(consumerLocation, listing.location);

  const components = {
    price: scorePrice(Number(listing.price_per_kwh), marketPrice),
    distance: scoreDistance(distanceKm),
    availability: scoreAvailability(listing.availability_date, now),
    energy: scoreEnergy(Number(listing.remaining_energy)),
    congestion: scoreCongestion(congestionLevel),
  };

  const matchScore = clampScore(
    components.price * MATCH_WEIGHTS.price +
      components.distance * MATCH_WEIGHTS.distance +
      components.availability * MATCH_WEIGHTS.availability +
      components.energy * MATCH_WEIGHTS.energy +
      components.congestion * MATCH_WEIGHTS.congestion
  );

  const reasons = [];
  if (components.price >= REASON_THRESHOLD) reasons.push("Competitive price");
  if (components.distance >= REASON_THRESHOLD) reasons.push("Nearby seller");
  if (components.energy >= REASON_THRESHOLD) reasons.push("Enough energy available");
  if (components.availability >= REASON_THRESHOLD) reasons.push("Available soon");
  if (components.congestion >= REASON_THRESHOLD) reasons.push("Low grid congestion");

  return {
    matchScore,
    components,
    reasons,
    estimatedDistanceKm: distanceKm,
  };
}

// rankListings(listings, context) -> listings sorted best-match-first, each
// annotated with its match score / reasons / distance under `_match`.
export function rankListings(listings, context) {
  return listings
    .map((listing) => ({ ...listing, _match: scoreListing(listing, context) }))
    .sort((a, b) => b._match.matchScore - a._match.matchScore);
}
