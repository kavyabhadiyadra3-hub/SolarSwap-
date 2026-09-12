// SolarSwap · Phase 6 · Dynamic Pricing Engine
//
// Computes a reference "Current Market Price" from market-analysis output.
// This is a market-wide REFERENCE price for context and recommendations.
// It never overwrites a seller's own `price_per_kwh` — sellers keep full
// control of what they list at (see marketplace.js / CreateListingForm).
//
// Formula (explainable, bounded):
//
//   Dynamic Price = Base Price × (1 + Demand Adjustment − Supply Adjustment + Congestion Adjustment)
//
//   Demand Adjustment   grows when estimated demand exceeds available supply.
//   Supply Adjustment   grows when available supply exceeds estimated demand.
//   Congestion Adjustment  a flat bump based on simulated grid congestion.
//
// All adjustments are clamped so the final price can only move within
// [-MAX_DECREASE, +MAX_INCREASE] of the base price — no runaway prices.

export const PRICING_CONSTANTS = {
  // How strongly a demand > supply gap pushes price up.
  DEMAND_SENSITIVITY: 0.25,
  // How strongly a supply > demand gap pushes price down.
  SUPPLY_SENSITIVITY: 0.2,
  // Flat adjustment added per simulated congestion level.
  CONGESTION_ADJUSTMENT: {
    Low: 0,
    Medium: 0.05,
    High: 0.12,
  },
  // Hard limits so the demo never produces an unrealistic price.
  MAX_INCREASE: 0.3, // price can rise at most 30% above base
  MAX_DECREASE: 0.25, // price can fall at most 25% below base
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// calculateDynamicPrice({ basePrice, totalSupply, estimatedDemand, congestionLevel })
// basePrice: average seller price from analyzeMarket() (₹/kWh)
// totalSupply / estimatedDemand: from analyzeMarket()
// congestionLevel: "Low" | "Medium" | "High" from analyzeMarket()
export function calculateDynamicPrice({
  basePrice,
  totalSupply,
  estimatedDemand,
  congestionLevel,
}) {
  const {
    DEMAND_SENSITIVITY,
    SUPPLY_SENSITIVITY,
    CONGESTION_ADJUSTMENT,
    MAX_INCREASE,
    MAX_DECREASE,
  } = PRICING_CONSTANTS;

  const safeSupply = totalSupply > 0 ? totalSupply : 1;
  const ratio = estimatedDemand / safeSupply; // >1 => demand exceeds supply

  let demandAdjustment = 0;
  let supplyAdjustment = 0;

  if (ratio > 1) {
    demandAdjustment = Math.min((ratio - 1) * DEMAND_SENSITIVITY, MAX_INCREASE);
  } else if (ratio < 1) {
    supplyAdjustment = Math.min((1 - ratio) * SUPPLY_SENSITIVITY, MAX_DECREASE);
  }

  const congestionAdjustment = CONGESTION_ADJUSTMENT[congestionLevel] ?? 0;

  const rawAdjustment = demandAdjustment - supplyAdjustment + congestionAdjustment;
  const totalAdjustment = clamp(rawAdjustment, -MAX_DECREASE, MAX_INCREASE);

  const dynamicPrice = Math.max(basePrice * (1 + totalAdjustment), 0.01);

  return {
    dynamicPrice: round(dynamicPrice),
    basePrice: round(basePrice),
    demandAdjustment: round(demandAdjustment, 3),
    supplyAdjustment: round(supplyAdjustment, 3),
    congestionAdjustment: round(congestionAdjustment, 3),
    totalAdjustment: round(totalAdjustment, 3),
    totalAdjustmentPct: round(totalAdjustment * 100, 1),
  };
}

// Small helper for listing cards: compares a listing's own price against
// the current market price and returns a simple competitiveness label.
export function comparePriceToMarket(listingPrice, marketPrice) {
  if (!marketPrice) return null;
  const diffPct = ((listingPrice - marketPrice) / marketPrice) * 100;
  if (diffPct <= -2) return { label: "Below Market Price", tone: "good", diffPct: round(diffPct, 1) };
  if (diffPct >= 2) return { label: "Above Market Price", tone: "high", diffPct: round(diffPct, 1) };
  return { label: "At Market Price", tone: "neutral", diffPct: round(diffPct, 1) };
}
