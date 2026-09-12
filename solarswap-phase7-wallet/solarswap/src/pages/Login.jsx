import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../utils/auth.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    const result = await login({ email: email.trim(), password });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
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
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 text-center mb-8">
          Log in to manage your energy trading account.
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-3 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert("Password reset is UI-only for now.")}
                className="text-xs font-semibold text-eco-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-eco-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-sm font-semibold text-white bg-eco-600 px-4 py-2.5 rounded-lg hover:bg-eco-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Logging in…" : "Login"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <button
          type="button"
          disabled
          title="Google sign-in is coming in a later phase."
          className="w-full text-sm font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg cursor-not-allowed"
        >
          Continue with Google (Coming Soon)
        </button>

        <p className="text-sm text-slate-500 text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-eco-600 font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
