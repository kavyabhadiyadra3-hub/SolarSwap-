// Simulated/demo statistics — clearly labeled as such.
const STATS = [
  { value: "1,250+", label: "Active Users" },
  { value: "8,450 kWh", label: "Clean Energy Traded" },
  { value: "2,380 kg", label: "CO₂ Avoided" },
  { value: "₹6.20", label: "Avg. P2P Price/kWh" },
];

export default function Stats() {
  return (
    <section className="bg-ink-900">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl md:text-3xl font-extrabold text-white">
                {stat.value}
              </p>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-slate-500 mt-8">
          * Demo statistics for illustration purposes only.
        </p>
      </div>
    </section>
  );
}
