import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env file manually so it works across all Node environments
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

const isPlaceholder =
  !supabaseUrl ||
  !supabaseKey ||
  supabaseUrl === "YOUR_SUPABASE_PROJECT_URL" ||
  supabaseKey === "YOUR_SUPABASE_ANON_KEY" ||
  supabaseKey === "YOUR_SUPABASE_PUBLISHABLE_KEY";

console.log("==========================================");
console.log("   SolarSwap Supabase Connection Tester   ");
console.log("==========================================");
console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? (isPlaceholder ? "[Placeholder detected]" : "[Configured]") : "[Missing]"}`);
console.log(`VITE_SUPABASE_PUBLISHABLE_KEY / ANON_KEY: ${supabaseKey ? (isPlaceholder ? "[Placeholder detected]" : "[Configured]") : "[Missing]"}`);
console.log("------------------------------------------");

if (isPlaceholder) {
  console.warn("⚠️ STATUS: Supabase environment variables are missing or set to placeholders.");
  console.log("Action Required:");
  console.log("Add valid VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to solarswap/.env");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Verifying connection to Supabase instance...");
  try {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    if (profileError) {
      console.error("❌ 'profiles' query failed:", profileError.message, `(Code: ${profileError.code})`);
    } else {
      console.log("✅ 'profiles' query SUCCESSFUL!");
      console.log(`Retrieved ${profileData.length} record(s) from 'profiles'.`);
    }

    console.log("Testing Marketplace query on 'energy_listings' with 'profiles(full_name)'...");
    const { data: listingData, error: listingError } = await supabase
      .from("energy_listings")
      .select(
        "id, seller_id, energy_amount, remaining_energy, price_per_kwh, location, availability_date, status, created_at, profiles(full_name)"
      )
      .eq("status", "available")
      .gt("remaining_energy", 0)
      .order("created_at", { ascending: false });

    if (listingError) {
      console.error("❌ 'energy_listings' marketplace query failed:", listingError.message, `(Code: ${listingError.code})`);
    } else {
      console.log("✅ 'energy_listings' marketplace query SUCCESSFUL!");
      console.log(`Retrieved ${listingData.length} available listing(s).`);
    }
  } catch (err) {
    console.error("❌ Connection / Network error:", err.message);
  }
}

testConnection();
