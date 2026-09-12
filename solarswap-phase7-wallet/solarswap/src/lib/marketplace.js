import { supabase } from "./supabase.js";

// Small wrapper around every Supabase call the marketplace needs, so
// components stay focused on UI and error handling stays consistent.

function friendlyError(error, fallback) {
  return new Error(error?.message || fallback);
}

// --- Listings -----------------------------------------------------------

// Listings anyone can buy from: available + still has energy left.
// Includes the seller's full name via the profiles relationship.
export async function fetchAvailableListings() {
  const { data, error } = await supabase
    .from("energy_listings")
    .select(
      "id, seller_id, energy_amount, remaining_energy, price_per_kwh, location, availability_date, status, created_at, profiles(full_name)"
    )
    .eq("status", "available")
    .gt("remaining_energy", 0)
    .order("created_at", { ascending: false });

  if (error) throw friendlyError(error, "Could not load the marketplace right now.");
  return data;
}

// A prosumer's own listings, whatever their status (for their dashboard).
export async function fetchListingsBySeller(sellerId) {
  const { data, error } = await supabase
    .from("energy_listings")
    .select(
      "id, energy_amount, remaining_energy, price_per_kwh, location, availability_date, status, created_at"
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw friendlyError(error, "Could not load your listings right now.");
  return data;
}

export async function createListing({ sellerId, energyAmount, pricePerKwh, location, availabilityDate }) {
  const { data, error } = await supabase
    .from("energy_listings")
    .insert({
      seller_id: sellerId,
      energy_amount: energyAmount,
      remaining_energy: energyAmount,
      price_per_kwh: pricePerKwh,
      location,
      availability_date: availabilityDate,
      status: "available",
    })
    .select()
    .single();

  if (error) throw friendlyError(error, "Could not create the listing.");
  return data;
}

// --- Wallet (Phase 7) -----------------------------------------------------

// Demo/simulated wallet balance only — no real money. Always returns the
// CALLER's own balance; there is no way to fetch anyone else's via the
// client (see supabase/phase7_wallet.sql for why).
export async function fetchWalletBalance() {
  const { data, error } = await supabase.rpc("get_wallet_balance");
  if (error) throw friendlyError(error, "Unable to load wallet balance.");
  return Number(data);
}

// --- Purchases ------------------------------------------------------------

// Runs the purchase_energy() Postgres function (see supabase/phase5_marketplace.sql),
// which validates everything and updates the listing atomically.
export async function purchaseEnergy({ listingId, amount }) {
  const { data, error } = await supabase.rpc("purchase_energy", {
    p_listing_id: listingId,
    p_amount: amount,
  });

  if (error) throw friendlyError(error, "Unable to complete purchase. Please try again.");
  return data;
}

// --- Transactions -----------------------------------------------------------

export async function fetchMyTransactions(userId) {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, buyer_id, seller_id, listing_id, energy_amount, price_per_kwh, total_amount, status, created_at"
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw friendlyError(error, "Could not load your transactions.");
  return data;
}

// Given a list of user ids, returns a { [id]: full_name } lookup map.
// Used to show "Bought from ___" / "Sold to ___" without needing a
// PostgREST embed (transactions references profiles twice, which would
// need exact foreign-key constraint names to embed safely).
export async function fetchProfileNames(userIds) {
  const uniqueIds = [...new Set(userIds)].filter(Boolean);
  if (uniqueIds.length === 0) return {};

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", uniqueIds);

  if (error) throw friendlyError(error, "Could not load user details.");
  return Object.fromEntries(data.map((p) => [p.id, p.full_name]));
}
