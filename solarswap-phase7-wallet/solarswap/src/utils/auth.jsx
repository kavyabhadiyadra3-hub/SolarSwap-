import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

const AuthContext = createContext(null);

// Turns a Supabase auth user (+ optional profiles row) into the simple
// { id, name, email, role } shape the rest of the app already expects
// (Navbar, Dashboard, etc. were built against this shape in Phase 3).
function buildAppUser(authUser, profile) {
  if (!authUser) return null;
  const meta = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email,
    name: profile?.full_name || meta.full_name || authUser.email,
    role: profile?.role || meta.role || "consumer",
  };
}

// Best-effort profile lookup. If the "profiles" table/trigger from
// supabase/schema.sql hasn't been set up yet, this just returns null and
// buildAppUser() falls back to the name/role stored on the auth user itself
// (from signUp metadata), so the app still works while it's being set up.
async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", userId)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

function mapAuthError(error) {
  const msg = (error?.message || "").toLowerCase();
  if (msg.includes("already registered") || msg.includes("already exists")) {
    return "An account with this email already exists.";
  }
  if (msg.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (msg.includes("password") && (msg.includes("6") || msg.includes("short") || msg.includes("weak"))) {
    return "Password is too weak. Use at least 6 characters.";
  }
  if (msg.includes("valid email") || msg.includes("invalid email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }
  return error?.message || "Something went wrong. Please try again.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true until the initial session check (on page load/refresh) finishes.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const resolveSession = async (session) => {
      const authUser = session?.user ?? null;
      const profile = authUser ? await fetchProfile(authUser.id) : null;
      if (!isMounted) return;
      setUser(buildAppUser(authUser, profile));
      setLoading(false);
    };

    // 1. Check for an existing session — this is what makes login
    //    survive a page refresh or reopening the app.
    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveSession(session);
    });

    // 2. React to future sign-in / sign-out / token-refresh events.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveSession(session);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const register = async ({ name, email, password, role }) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: "Supabase isn't configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file and restart the dev server.",
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name, role },
      },
    });

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    // If your Supabase project has "Confirm email" turned ON (the default),
    // signUp() succeeds but there is no session yet until the user clicks
    // the confirmation link in their inbox.
    const needsEmailConfirmation = !data.session;
    return { success: true, needsEmailConfirmation };
  };

  const login = async ({ email, password }) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: "Supabase isn't configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file and restart the dev server.",
      };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }
    return { success: true };
  };

  const logout = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        loggedIn: !!user,
        user,
        loading,
        register,
        login,
        logout,
        isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}
