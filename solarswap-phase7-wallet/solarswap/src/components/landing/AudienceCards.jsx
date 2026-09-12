import { Sun, ShoppingCart, Check } from "lucide-react";

const PROSUMER_FEATURES = [
  "Sell surplus energy",
  "Set availability",
  "Track earnings",
  "Support local renewable energy",
];

const CONSUMER_FEATURES = [
  "Discover nearby sellers",
  "Compare prices",
  "Buy renewable energy",
  "Track savings",
];

export default function AudienceCards() {
  return (
    <section id="marketplace" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-3xl md:text-4xl font-extrabold text-ink-900 mb-3">
          Built for Both Sides of the Trade
        </h2>
        <p className="text-slate-600">
          Whether you generate solar power or want to buy it locally,
          SolarSwap has a place for you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Prosumer card */}
        <div className="rounded-2xl bg-gradient-to-br from-solar-50 to-white border border-solar-100 p-8 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-solar-500 flex items-center justify-center mb-5">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-ink-900 mb-2">Prosumer</h3>
          <p className="text-slate-600 mb-6">
            Turn your solar surplus into value.
          </p>
          <ul className="space-y-3 mb-8">
            {PROSUMER_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-solar-600 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button className="w-full text-sm font-semibold text-white bg-solar-500 px-6 py-3 rounded-xl hover:bg-solar-600 transition">
            Sell Energy
          </button>
        </div>

        {/* Consumer card */}
        <div className="rounded-2xl bg-gradient-to-br from-eco-50 to-white border border-eco-100 p-8 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-eco-600 flex items-center justify-center mb-5">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-ink-900 mb-2">Consumer</h3>
          <p className="text-slate-600 mb-6">
            Buy cleaner energy from nearby producers.
          </p>
          <ul className="space-y-3 mb-8">
            {CONSUMER_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-eco-600 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button className="w-full text-sm font-semibold text-white bg-eco-600 px-6 py-3 rounded-xl hover:bg-eco-700 transition">
            Buy Energy
          </button>
        </div>
      </div>
    </section>
  );
}
