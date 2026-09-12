import { useNavigate } from "react-router-dom";

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-8 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Your Energy. Your Community. Your Choice.
        </h2>
        <p className="text-slate-300 max-w-xl mx-auto mb-8">
          Join the future of local renewable energy trading.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="text-sm font-semibold text-ink-900 bg-white px-8 py-3 rounded-xl hover:bg-slate-100 transition"
        >
          Get Started
        </button>

        {/* Decorative glow */}
        <div className="absolute -z-0 -top-16 -right-16 w-64 h-64 bg-eco-500/20 rounded-full blur-3xl" />
        <div className="absolute -z-0 -bottom-16 -left-16 w-64 h-64 bg-solar-500/20 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
