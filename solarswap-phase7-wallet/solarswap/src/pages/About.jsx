import { Sun, Users, Leaf, Target } from "lucide-react";

export default function About() {
  return (
    <div>
      <section className="bg-gradient-to-b from-eco-50 via-white to-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-extrabold text-ink-900 mb-4">
            What is SolarSwap?
          </h1>
          <p className="text-slate-600 text-lg">
            SolarSwap is a peer-to-peer renewable energy marketplace that
            lets rooftop solar owners sell surplus energy directly to nearby
            consumers, instead of exporting it to the grid at low rates.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-extrabold text-ink-900 mb-4">
          Why P2P Renewable Energy Trading?
        </h2>
        <p className="text-slate-600 mb-4">
          Many rooftop solar owners generate more electricity than they use,
          especially during peak sunlight hours. Today, that surplus is
          usually exported back to the grid at a fixed, low feed-in rate —
          even though nearby households may be paying much higher prices for
          the same kind of clean energy.
        </p>
        <p className="text-slate-600">
          Peer-to-peer trading closes that gap. It lets solar owners earn
          more for their surplus, gives consumers access to cheaper renewable
          energy, and encourages more local, efficient use of the solar power
          that's already being generated in a neighborhood.
        </p>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-ink-900 mb-10 text-center">
            How SolarSwap Helps
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-11 h-11 rounded-xl bg-solar-100 flex items-center justify-center mb-4">
                <Sun className="w-5 h-5 text-solar-600" />
              </div>
              <h3 className="font-bold text-ink-900 mb-2">Solar Prosumers</h3>
              <p className="text-sm text-slate-600">
                Turn unused surplus energy into real earnings, instead of
                selling it back to the grid at low fixed rates.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-11 h-11 rounded-xl bg-eco-100 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-eco-600" />
              </div>
              <h3 className="font-bold text-ink-900 mb-2">Consumers</h3>
              <p className="text-sm text-slate-600">
                Access cleaner, often cheaper energy from producers in the
                same neighborhood.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-11 h-11 rounded-xl bg-eco-100 flex items-center justify-center mb-4">
                <Leaf className="w-5 h-5 text-eco-600" />
              </div>
              <h3 className="font-bold text-ink-900 mb-2">
                Local Renewable Usage
              </h3>
              <p className="text-sm text-slate-600">
                Keeps clean energy circulating within the local community
                rather than exporting it far away.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-11 h-11 rounded-xl bg-solar-100 flex items-center justify-center mb-4">
                <Target className="w-5 h-5 text-solar-600" />
              </div>
              <h3 className="font-bold text-ink-900 mb-2">
                Better Utilization
              </h3>
              <p className="text-sm text-slate-600">
                Makes sure surplus solar energy that would otherwise go to
                waste is put to good local use.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-ink-900 mb-4">
          Our Vision
        </h2>
        <p className="text-slate-600">
          We imagine neighborhoods where rooftop solar isn't just an
          individual investment, but a shared community resource — traded
          fairly, priced transparently, and used locally to reduce dependence
          on the wider grid.
        </p>
      </section>
    </div>
  );
}
