import { Sun, Zap, Leaf, Globe2 } from "lucide-react";

const IMPACTS = [
  { icon: Sun, label: "Renewable Energy" },
  { icon: Zap, label: "Local Energy Trading" },
  { icon: Leaf, label: "Reduced Grid Dependency" },
  { icon: Globe2, label: "Lower Carbon Impact" },
];

export default function EnvironmentalImpact() {
  return (
    <section id="about" className="bg-eco-600 py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Environmental Impact
        </h2>
        <p className="text-eco-50 max-w-2xl mx-auto mb-14">
          Trading surplus solar energy locally encourages better use of
          rooftop solar and reduces reliance on the wider grid.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {IMPACTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="bg-white/10 rounded-2xl p-6 hover:bg-white/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
