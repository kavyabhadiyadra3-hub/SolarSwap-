import { TrendingDown, TrendingUp, Gauge } from "lucide-react";

const FACTORS = [
  {
    icon: TrendingDown,
    title: "High Solar Supply",
    result: "Lower Price",
    tone: "text-eco-600 bg-eco-50",
    description: "More surplus energy available in the area reduces price per kWh.",
  },
  {
    icon: TrendingUp,
    title: "High Demand",
    result: "Higher Price",
    tone: "text-solar-600 bg-solar-50",
    description: "More nearby buyers competing for the same surplus raises price.",
  },
  {
    icon: Gauge,
    title: "High Grid Congestion",
    result: "Adjusted Price",
    tone: "text-slate-600 bg-slate-100",
    description: "Local grid conditions are factored in to keep trades realistic.",
  },
];

export default function DynamicPricing() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink-900 mb-3">
            Dynamic Pricing
          </h2>
          <p className="text-slate-600">
            Prices on SolarSwap move with real market conditions — not a
            fixed rate.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FACTORS.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.tone}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-ink-900 mb-1">{f.title}</h3>
                <p className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${f.tone}`}>
                  → {f.result}
                </p>
                <p className="text-sm text-slate-600">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
