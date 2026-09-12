import { Sun, Zap, Home as HomeIcon, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Hero section — first thing visitors see.
// Right-side visual shows a simple Solar Home -> Energy -> Nearby Home flow.
export default function Hero() {
  const navigate = useNavigate();

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-eco-50 via-white to-white"
    >
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-eco-700 bg-eco-100 px-3 py-1 rounded-full mb-5">
            <Sun className="w-3.5 h-3.5" />
            Peer-to-peer renewable energy
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-ink-900 leading-tight mb-5">
            Trade Solar Energy.
            <br />
            <span className="text-eco-600">Power Your Community.</span>
          </h1>

          <p className="text-slate-600 text-lg mb-8 max-w-lg">
            SolarSwap connects rooftop solar owners with nearby consumers,
            making surplus renewable energy more valuable, local, and
            accessible.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-eco-600 px-6 py-3 rounded-xl hover:bg-eco-700 transition shadow-lg shadow-eco-600/20"
            >
              Start Trading
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/marketplace")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-6 py-3 rounded-xl hover:bg-slate-50 transition"
            >
              Explore Marketplace
            </button>
          </div>
        </div>

        {/* Right: simple visual flow */}
        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
            <div className="flex items-center justify-between gap-3">
              {/* Solar Home */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-solar-100 flex items-center justify-center">
                  <HomeIcon className="w-8 h-8 text-solar-600" />
                </div>
                <span className="text-xs font-semibold text-slate-600 text-center">
                  Solar Home
                </span>
              </div>

              {/* Arrow + energy */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <Zap className="w-6 h-6 text-eco-500 animate-pulse" />
                <div className="h-0.5 w-full bg-gradient-to-r from-solar-400 to-eco-500 rounded-full" />
                <span className="text-[11px] text-slate-400">surplus energy</span>
              </div>

              {/* Nearby Home */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-eco-100 flex items-center justify-center">
                  <HomeIcon className="w-8 h-8 text-eco-600" />
                </div>
                <span className="text-xs font-semibold text-slate-600 text-center">
                  Nearby Home
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-extrabold text-ink-900">4.2 kWh</p>
                <p className="text-xs text-slate-500">Surplus available</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-extrabold text-eco-600">₹5.80/kWh</p>
                <p className="text-xs text-slate-500">Current P2P price</p>
              </div>
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute -z-10 -top-10 -right-10 w-56 h-56 bg-solar-200/40 rounded-full blur-3xl" />
          <div className="absolute -z-10 -bottom-10 -left-10 w-56 h-56 bg-eco-200/40 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
}
