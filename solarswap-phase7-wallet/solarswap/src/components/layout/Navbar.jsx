import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Sun, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../../utils/auth.jsx";

// Top navigation bar shown on every page.
// Main nav links stay the same for everyone; the right-side action
// buttons change depending on whether the user is logged in.
const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Marketplace", to: "/marketplace" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `transition-colors ${isActive ? "text-eco-600 font-semibold" : "hover:text-eco-600"}`;

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-solar-400 to-eco-500 flex items-center justify-center">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">SolarSwap</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {loggedIn ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm font-semibold text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-900 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-semibold text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-sm font-semibold text-white bg-eco-600 px-4 py-2 rounded-lg hover:bg-eco-700 transition"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-eco-600 font-semibold" : "text-slate-600 hover:text-eco-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            {loggedIn ? (
              <>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/dashboard");
                  }}
                  className="text-sm font-semibold text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition text-left"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-900 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                  className="text-sm font-semibold text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition text-left"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/register");
                  }}
                  className="text-sm font-semibold text-white bg-eco-600 px-4 py-2 rounded-lg hover:bg-eco-700 transition"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
