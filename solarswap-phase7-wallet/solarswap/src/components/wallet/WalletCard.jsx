import { Wallet, Loader2, AlertCircle } from "lucide-react";

// Demo/simulated wallet balance display. Reused on the Consumer and
// Prosumer dashboards, and (in compact form) on the Marketplace buy panel.
// Never fetches anything itself — the parent owns loading/error/balance
// state so it can share one fetch across the wallet card and any derived
// stats (Total Spent, Total Earnings, etc).
export default function WalletCard({ loading, error, balance, tone = "eco" }) {
  const toneClasses =
    tone === "solar"
      ? "bg-solar-100 text-solar-600"
      : "bg-eco-100 text-eco-600";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${toneClasses}`}>
        <Wallet className="w-5 h-5" />
      </div>

      <p className="text-xs font-semibold text-slate-500 mb-1">Demo Wallet</p>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 py-1">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : error ? (
        <div className="flex items-start gap-1.5 text-red-600 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : (
        <p className="text-2xl font-extrabold text-ink-900">₹{balance.toFixed(2)}</p>
      )}

      <p className="text-[11px] text-slate-400 mt-1">Demo balance — not real money</p>
    </div>
  );
}
