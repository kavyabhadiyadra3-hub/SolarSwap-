import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/auth.jsx";

// Wrap /login and /register so a logged-in user is sent straight to
// their dashboard instead of seeing the auth forms again.
export default function GuestRoute({ children }) {
  const { loggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Checking your session…
      </div>
    );
  }

  if (loggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
