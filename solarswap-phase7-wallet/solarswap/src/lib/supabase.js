import { createClient } from "@supabase/supabase-js";

// Reads from a .env file at the project root (see .env.example).
// Vite only exposes variables prefixed with VITE_ to the browser.
// Supports VITE_SUPABASE_PUBLISHABLE_KEY and legacy VITE_SUPABASE_ANON_KEY.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== "YOUR_SUPABASE_PROJECT_URL" &&
    supabaseKey !== "YOUR_SUPABASE_ANON_KEY" &&
    supabaseKey !== "YOUR_SUPABASE_PUBLISHABLE_KEY"
);

if (!supabaseUrl || !supabaseKey || !isConfigured) {
  console.warn("Supabase environment variables are missing.");
  console.warn(
    "[SolarSwap] Supabase is not configured. Create a .env file at the " +
      "project root with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY), " +
      "then restart `npm run dev`. See .env.example."
  );
}

export const isSupabaseConfigured = isConfigured;

// Fallback prevents createClient() from crashing the entire app if env vars are missing/placeholder
export const supabase = createClient(
  isConfigured ? supabaseUrl : "https://placeholder.supabase.co",
  isConfigured ? supabaseKey : "public-anon-key-placeholder"
);
