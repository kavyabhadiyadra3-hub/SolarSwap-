import { createClient } from "@supabase/supabase-js";

// Reads from a .env file at the project root (see .env.example).
// Vite only exposes variables prefixed with VITE_ to the browser.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // Don't crash the app — let the rest of the UI keep working, but every
  // auth call will return a clear "not configured" error until this is fixed.
  console.warn(
    "[SolarSwap] Supabase is not configured. Create a .env file at the " +
      "project root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, " +
      "then restart `npm run dev`. See .env.example."
  );
}

// Placeholder values keep createClient() from throwing when the real
// env vars are missing, so the app still renders (auth just won't work).
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "public-anon-key-placeholder"
);
