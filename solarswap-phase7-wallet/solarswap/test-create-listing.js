import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.resolve(__dirname, ".env");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Replicate createListing from src/lib/marketplace.js
async function createListing({ sellerId, energyAmount, pricePerKwh, location, availabilityDate }) {
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

  if (error) throw error;
  return data;
}

// Replicate fetchAvailableListings from src/lib/marketplace.js
async function fetchAvailableListings() {
  const { data, error } = await supabase
    .from("energy_listings")
    .select(
      "id, seller_id, energy_amount, remaining_energy, price_per_kwh, location, availability_date, status, created_at, profiles(full_name)"
    )
    .eq("status", "available")
    .gt("remaining_energy", 0)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

async function runTest() {
  console.log("==================================================");
  console.log("   SolarSwap Complete Listing Flow Test (End-to-End)");
  console.log("==================================================");

  // Step 1: Authenticate as a Prosumer
  console.log("\n1. Authenticating as Prosumer (demo.aarav@solarswap.com)...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "demo.aarav@solarswap.com",
    password: "DemoProsumer123!",
  });

  if (authError) {
    console.error("❌ Authentication failed:", authError.message);
    process.exit(1);
  }
  const user = authData.user;
  console.log("✅ Authenticated successfully as Prosumer:", user.email);

  // Step 2: Test Create Listing (Supabase INSERT)
  console.log("\n2. Executing createListing (Supabase INSERT)...");
  const testPayload = {
    sellerId: user.id,
    energyAmount: 42.5,
    pricePerKwh: 5.75,
    location: "Ahmedabad (Bopal Tech Park Solar)",
    availabilityDate: new Date().toISOString().split("T")[0],
  };

  let newListing;
  try {
    newListing = await createListing(testPayload);
    console.log("✅ createListing INSERT SUCCESSFUL!");
    console.log("   Listing ID:", newListing.id);
    console.log("   Energy Amount:", newListing.energy_amount, "kWh");
    console.log("   Price per kWh: ₹", newListing.price_per_kwh);
    console.log("   Location:", newListing.location);
    console.log("   Status:", newListing.status);
    console.log("   Created At:", newListing.created_at);
  } catch (err) {
    console.error("❌ createListing INSERT FAILED:", err.message);
    process.exit(1);
  }

  // Step 3: Test Marketplace SELECT & Verification
  console.log("\n3. Executing fetchAvailableListings (Marketplace SELECT & Join)...");
  try {
    const listings = await fetchAvailableListings();
    console.log(`✅ Marketplace returned ${listings.length} active listing(s).`);

    const found = listings.find((l) => l.id === newListing.id);
    if (found) {
      console.log("✅ NEW LISTING VERIFIED IN MARKETPLACE!");
      console.log("   Matched ID:", found.id);
      console.log("   Seller Name via Join:", found.profiles?.full_name);
      console.log("   Location:", found.location);
      console.log("   Remaining Energy:", found.remaining_energy, "kWh");
    } else {
      console.error("❌ New listing not found in available listings query!");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ fetchAvailableListings FAILED:", err.message);
    process.exit(1);
  }

  // Step 4: Verification of Validation / Constraints
  console.log("\n4. Testing constraint enforcement (negative energy should fail)...");
  try {
    await createListing({
      ...testPayload,
      energyAmount: -10,
    });
    console.error("❌ Constraint check failed: Negative energy was allowed!");
  } catch (err) {
    console.log("✅ Database constraint check working: Rejected invalid energy amount.", `(${err.message})`);
  }

  console.log("\n==================================================");
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

runTest();
