// SolarSwap · Phase 6 · Market Analysis
//
// Turns the list of currently AVAILABLE energy listings (as already fetched
// by fetchAvailableListings() for the Marketplace page) into a small set of
// market-condition numbers: total supply, an estimated demand figure,
// average seller price, a supply/demand classification, and a simulated
// grid-congestion level.
//
// IMPORTANT — what is real vs simulated:
//   - Total Supply, Active Sellers, Average Price: real, computed directly
//     from live Supabase data (the listings passed in).
//   - Estimated Demand: NOT real electricity demand. There is no demand
//     table and no smart-meter/grid feed in this project. Instead we use a
//     transparent, deterministic proxy described below.
//   - Grid Congestion: SIMULATED. There is no real grid integration.
//
// Why demand isn't read from `transactions`: the Phase 5 RLS policy on
// `transactions` only allows a user to see rows where they are the buyer or
// seller ("buyer_id = auth.uid() or seller_id = auth.uid()"), so a
// marketplace-wide transaction count is not visible to a regular logged-in
// user without a new SECURITY DEFINER database function. To avoid an
// unnecessary database change, Phase 6 instead derives a demand proxy from
// two things the Marketplace already loads:
//   1. A baseline consumer-interest assumption per active listing (a fixed,
//      documented constant — NOT measured demand).
//   2. How much of each listing's original energy_amount has already been
//      sold (energy_amount - remaining_energy), which is a real signal:
//      buyers have been actively absorbing that particular listing's supply.

// ---- Tunable constants (documented in one place) --------------------------

export const MARKET_CONSTANTS = {
  // Baseline assumption: absent any other signal, each active listing in
  // the market is assumed to draw around this many kWh of underlying
  // consumer interest. This keeps the demand estimate tied to how many
  // distinct sellers/segments are active, not merely how many kWh happen
  // to be listed (so a glut of untouched supply reads as high supply,
  // not as automatically-matching demand). Documented assumption, not
  // measured data.
  DEMAND_PER_LISTING_KWH: 30,

  // Each kWh already sold from a currently-active listing is assumed to
  // represent ~1.2 kWh of "pull-through" demand (buyers tend to keep
  // buying once a listing proves popular). This is a documented modelling
  // assumption for the prototype, not measured data.
  CONSUMED_SIGNAL_WEIGHT: 1.2,

  // Supply/demand ratio thresholds used to classify the market.
  HIGH_SUPPLY_RATIO: 1.2, // ratio above this => High Supply
  HIGH_DEMAND_RATIO: 0.8, // ratio below this => High Demand

  // Grid congestion: how much each factor contributes to the raw score.
  // - Location concentration: more listings crowded into fewer distinct
  //   locations is modelled as more strain on that local grid segment.
  // - Demand pressure: a market running hotter than supply also raises
  //   the simulated congestion score.
  CONGESTION_LOCATION_WEIGHT: 18,
  CONGESTION_DEMAND_WEIGHT: 40,
  CONGESTION_MEDIUM_THRESHOLD: 35,
  CONGESTION_HIGH_THRESHOLD: 65,
};

// ---- Helpers ---------------------------------------------------------------

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function classifyCondition(ratio) {
  if (ratio >= MARKET_CONSTANTS.HIGH_SUPPLY_RATIO) return "High Supply";
  if (ratio <= MARKET_CONSTANTS.HIGH_DEMAND_RATIO) return "High Demand";
  return "Balanced";
}

function classifyCongestion(rawScore) {
  if (rawScore >= MARKET_CONSTANTS.CONGESTION_HIGH_THRESHOLD) return "High";
  if (rawScore >= MARKET_CONSTANTS.CONGESTION_MEDIUM_THRESHOLD) return "Medium";
  return "Low";
}

// ---- Main entry point -------------------------------------------------------

// analyzeMarket(listings)
// listings: the array already returned by fetchAvailableListings() — no
// extra Supabase call required.
export function analyzeMarket(listings = []) {
  const activeListings = listings.filter(
    (l) => l.status === "available" && Number(l.remaining_energy) > 0
  );

  const activeSellers = new Set(activeListings.map((l) => l.seller_id)).size;

  const totalSupply = activeListings.reduce(
    (sum, l) => sum + Number(l.remaining_energy || 0),
    0
  );

  const totalOriginal = activeListings.reduce(
    (sum, l) => sum + Number(l.energy_amount || 0),
    0
  );

  const avgPrice =
    activeListings.length > 0
      ? activeListings.reduce((sum, l) => sum + Number(l.price_per_kwh || 0), 0) /
        activeListings.length
      : 0;

  // Demand proxy: a fixed baseline per active listing (consumer-interest
  // assumption) + a signal from energy already consumed out of these same
  // active listings. Note this is NOT scaled by totalSupply, so a large
  // volume of untouched supply correctly reads as high supply rather than
  // automatically implying matching demand.
  const consumedFromActiveListings = Math.max(totalOriginal - totalSupply, 0);
  const estimatedDemand =
    activeListings.length * MARKET_CONSTANTS.DEMAND_PER_LISTING_KWH +
    consumedFromActiveListings * MARKET_CONSTANTS.CONSUMED_SIGNAL_WEIGHT;

  const supplyDemandRatio = estimatedDemand > 0 ? totalSupply / estimatedDemand : 2;
  const marketCondition = classifyCondition(supplyDemandRatio);

  // Simulated grid congestion -------------------------------------------------
  const distinctLocations = new Set(
    activeListings.map((l) => (l.location || "").trim().toLowerCase()).filter(Boolean)
  ).size;

  const locationConcentration =
    distinctLocations > 0 ? activeListings.length / distinctLocations : activeListings.length;

  // How much hotter demand is running vs supply (0 when balanced/oversupplied).
  const demandPressure = supplyDemandRatio > 0 ? Math.max(1 - supplyDemandRatio, 0) : 1;

  const congestionRawScore =
    locationConcentration * MARKET_CONSTANTS.CONGESTION_LOCATION_WEIGHT * 0.4 +
    demandPressure * MARKET_CONSTANTS.CONGESTION_DEMAND_WEIGHT;

  const congestionLevel = classifyCongestion(congestionRawScore);

  return {
    totalSupply: round(totalSupply),
    totalOriginal: round(totalOriginal),
    activeSellers,
    avgPrice: round(avgPrice),
    estimatedDemand: round(estimatedDemand),
    supplyDemandRatio: round(supplyDemandRatio, 2),
    marketCondition, // "High Supply" | "Balanced" | "High Demand"
    congestionLevel, // "Low" | "Medium" | "High"
    congestionRawScore: round(congestionRawScore, 1),
    isSimulatedDemand: true,
    isSimulatedCongestion: true,
  };
}
