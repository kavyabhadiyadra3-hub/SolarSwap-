import { Zap, TrendingUp, IndianRupee, Activity, Gauge, LineChart } from "lucide-react";

const CONDITION_STYLES = {
  "High Supply": "text-eco-700 bg-eco-100",
  Balanced: "text-slate-600 bg-slate-100",
  "High Demand": "text-solar-600 bg-solar-100",
};

const CONGESTION_STYLES = {
  Low: "text-eco-700 bg-eco-100",
  Medium: "text-solar-600 bg-solar-100",
  High: "text-red-600 bg-red-100",
};

// Compact "Market Conditions" strip shown on the Marketplace page.
// Values are computed client-side from already-loaded listings via
// src/utils/marketAnalysis.js + src/utils/pricingEngine.js — no extra
// Supabase calls. Demand and congestion are clearly labelled as simulated.
export default function MarketConditionsPanel({ analysis, dynamicPrice }) {
  const items = [
    {
      icon: Zap,
      label: "Available Energy",
      value: `${analysis.totalSupply} kWh`,
    },
    {
      icon: TrendingUp,
      label: "Estimated Demand*",
      value: `${analysis.estimatedDemand} kWh`,
    },
    {
      icon: IndianRupee,
      label: "Average Seller Price",
      value: `₹${analysis.avgPrice.toFixed(2)}/kWh`,
    },
    {
      icon: Activity,
      label: "Market Condition",
      value: analysis.marketCondition,
      badge: CONDITION_STYLES[analysis.marketCondition],
    },
    {
      icon: Gauge,
      label: "Grid Congestion*",
      value: analysis.congestionLevel,
      badge: CONGESTION_STYLES[analysis.congestionLevel],
    },
    {
      icon: LineChart,
      label: "Current Market Price",
      value: `₹${dynamicPrice.dynamicPrice.toFixed(2)}/kWh`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-ink-900 text-sm">Market Conditions</h2>
        <span className="text-[11px] text-slate-400">
          * Simulated — no real grid/demand feed
        </span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                {item.badge ? (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.badge}`}>
                    {item.value}
                  </span>
                ) : (
                  <p className="font-bold text-ink-900 text-sm">{item.value}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
