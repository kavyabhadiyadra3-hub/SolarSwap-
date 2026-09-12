import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Mail, Lock, User, Zap, Home, AlertCircle } from "lucide-react";
import { useAuth } from "../utils/auth.jsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLES = [
  {
    id: "prosumer",
    icon: Zap,
    title: "Prosumer",
    emoji: "☀",
    description: "Sell your surplus solar energy.",
    activeClasses: "border-solar-500 bg-solar-50 text-solar-700",
  },
  {
    id: "consumer",
    icon: Home,
    title: "Consumer",
    emoji: "🏠",
    description: "Buy renewable energy from nearby producers.",
    activeClasses: "border-eco-500 bg-eco-50 text-eco-700",
  },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return "Please fill in all fields.";
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (password !== confirmPassword) {
      return "Password and confirm password do not match.";
    }
    if (!role) {
      return "Please select whether you are a Prosumer or a Consumer.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const result = await register({ name: name.trim(), email: email.trim(), password, role });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    // Depending on your Supabase project's Auth settings, "Confirm email"
    // may be required before a session exists. If so, there's nothing to
    // redirect into yet — show a message instead of sending them to /login
    // (which would just look like a silent failure).
    if (result.needsEmailConfirmation) {
      setConfirmationSent(true);
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16 bg-gradient-to-b from-eco-50 via-white to-white">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-solar-400 to-eco-500 flex items-center justify-center">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">SolarSwap</span>
        </div>

        <h1 className="text-2xl font-extrabold text-ink-900 text-center mb-1">
          Create your account
        </h1>
        <p className="text-sm text-slate-500 text-center mb-8">
          Join SolarSwap as a prosumer or a consumer.
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-3 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {confirmationSent && (
          <div className="bg-eco-50 border border-eco-100 text-eco-700 text-sm rounded-lg p-4 mb-5">
            <p className="font-semibold mb-1">Account created — check your email</p>
            <p>
              We sent a confirmation link to <strong>{email.trim()}</strong>. Click it,
              then come back and log in.
            </p>
            <Link to="/login" className="inline-block mt-3 font-semibold text-eco-700 hover:underline">
              Go to Login →
            </Link>
          </div>
        )}

        {!confirmationSent && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-eco-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-eco-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-eco-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-eco-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isActive = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`text-left p-3 rounded-lg border transition ${
                      isActive ? r.activeClasses : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-bold">{r.emoji} {r.title}</span>
                    </div>
                    <p className="text-xs opacity-80">{r.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-sm font-semibold text-white bg-eco-600 px-4 py-2.5 rounded-lg hover:bg-eco-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating account…" : "Create Account"}
          </button>
        </form>
        )}

        {!confirmationSent && (
        <p className="text-sm text-slate-500 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-eco-600 font-semibold hover:underline">
            Log in
          </Link>
        </p>
        )}
      </div>
    </div>
  );
}
