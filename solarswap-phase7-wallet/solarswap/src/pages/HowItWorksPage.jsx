import {
  Sun,
  ListChecks,
  GitMerge,
  Handshake,
  TrendingDown,
  TrendingUp,
  Gauge,
  Users,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Generate",
    icon: Sun,
    description: "Solar prosumer generates renewable energy from rooftop panels.",
  },
  {
    number: "02",
    title: "List",
    icon: ListChecks,
    description: "Prosumer lists surplus energy on the SolarSwap marketplace.",
  },
  {
    number: "03",
    title: "Match",
    icon: GitMerge,
    description:
      "SolarSwap matches buyers and sellers based on price, distance, availability, and grid conditions.",
  },
  {
    number: "04",
    title: "Trade",
    icon: Handshake,
    description:
      "Consumer purchases the energy and the transaction is recorded digitally.",
  },
];

const PRICING_FACTORS = [
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

export default function HowItWorksPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-b from-eco-50 via-white to-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-extrabold text-ink-900 mb-4">
            How SolarSwap Works
          </h1>
          <p className="text-slate-600 text-lg">
            A simple four-step flow that turns rooftop solar surplus into a
            local, tradable resource.
          </p>
        </div>
      </section>

      {/* 4 steps */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-4xl font-extrabold text-slate-100 absolute top-4 right-5 group-hover:text-eco-100 transition-colors">
                  {step.number}
                </span>
                <div className="w-11 h-11 rounded-xl bg-eco-100 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-eco-600" />
                </div>
                <h3 className="font-bold text-ink-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dynamic pricing explanation */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-ink-900 mb-3">
              Dynamic Pricing
            </h2>
            <p className="text-slate-600">
              Prices on SolarSwap are not fixed — they respond to real supply
              and demand conditions in the local market.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_FACTORS.map((f) => {
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

      {/* Buyer/seller matching + grid congestion explanation */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <div className="w-11 h-11 rounded-xl bg-eco-100 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-eco-600" />
            </div>
            <h3 className="font-bold text-ink-900 mb-2 text-lg">
              Buyer–Seller Matching
            </h3>
            <p className="text-sm text-slate-600">
              When a consumer wants to buy energy, SolarSwap looks at all
              available listings nearby and ranks them using price, distance,
              and how much surplus energy is available — recommending the
              best overall match instead of just the cheapest option.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <div className="w-11 h-11 rounded-xl bg-solar-100 flex items-center justify-center mb-4">
              <Gauge className="w-5 h-5 text-solar-600" />
            </div>
            <h3 className="font-bold text-ink-900 mb-2 text-lg">
              Grid Congestion Consideration
            </h3>
            <p className="text-sm text-slate-600">
              SolarSwap factors in simulated local grid congestion so prices
              and matches stay realistic — congested areas see adjusted
              pricing to reflect real-world grid constraints.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-10">
          Note: This is a software simulation. No physical electricity is
          transferred through the platform.
        </p>
      </section>
    </div>
  );
}
