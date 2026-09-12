import { Sun, ListChecks, GitMerge, Handshake } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Generate",
    icon: Sun,
    description: "Solar owners generate renewable energy from rooftop panels.",
  },
  {
    number: "02",
    title: "List",
    icon: ListChecks,
    description: "Prosumers list their surplus energy on SolarSwap.",
  },
  {
    number: "03",
    title: "Match",
    icon: GitMerge,
    description:
      "The platform finds suitable nearby consumers using price, distance, availability, and grid conditions.",
  },
  {
    number: "04",
    title: "Trade",
    icon: Handshake,
    description:
      "Consumers purchase energy and the transaction is recorded digitally.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-3xl md:text-4xl font-extrabold text-ink-900 mb-3">
          How It Works
        </h2>
        <p className="text-slate-600">
          From rooftop generation to a completed trade — SolarSwap handles
          the matching and record-keeping in between.
        </p>
      </div>

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
  );
}
