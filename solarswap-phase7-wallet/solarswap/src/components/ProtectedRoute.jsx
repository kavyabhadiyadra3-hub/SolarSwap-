import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/auth.jsx";

// Wrap any route that should only be visible to logged-in users.
// Example: <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
export default function ProtectedRoute({ children }) {
  const { loggedIn, loading } = useAuth();

  // Wait for the initial Supabase session check (e.g. on page refresh)
  // before deciding whether to redirect, otherwise a logged-in user would
  // briefly get bounced to /login every time they reload the page.
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Checking your session…
      </div>
    );
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
