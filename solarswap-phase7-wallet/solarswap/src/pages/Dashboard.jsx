import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../utils/auth.jsx";
import ProsumerDashboard from "./dashboard/ProsumerDashboard.jsx";
import ConsumerDashboard from "./dashboard/ConsumerDashboard.jsx";
import AdminDashboard from "./dashboard/AdminDashboard.jsx";

const ROLE_LABELS = {
  prosumer: "Prosumer",
  consumer: "Consumer",
  admin: "Admin",
};

// Dashboard now renders a different view depending on the logged-in
// user's role. ProtectedRoute (see App.jsx) guarantees `user` exists here.
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 mb-1">
            Welcome, {user?.name || "there"}
          </h1>
          <p className="text-slate-600">
            {ROLE_LABELS[user?.role] || "User"} dashboard overview.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition self-start"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {user?.role === "prosumer" && <ProsumerDashboard />}
      {user?.role === "consumer" && <ConsumerDashboard />}
      {user?.role === "admin" && <AdminDashboard />}
    </div>
  );
}
