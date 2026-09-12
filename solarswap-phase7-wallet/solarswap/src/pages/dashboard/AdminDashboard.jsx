import { Users, Sun, ShoppingCart, Zap, Repeat, IndianRupee } from "lucide-react";

const STAT_CARDS = [
  { icon: Users, label: "Total Users", value: "1,250", tone: "bg-slate-100 text-slate-600" },
  { icon: Sun, label: "Active Prosumers", value: "430", tone: "bg-solar-100 text-solar-600" },
  { icon: ShoppingCart, label: "Active Consumers", value: "820", tone: "bg-eco-100 text-eco-600" },
  { icon: Zap, label: "Energy Traded", value: "8,450 kWh", tone: "bg-eco-100 text-eco-600" },
  { icon: Repeat, label: "Transactions", value: "2,380", tone: "bg-slate-100 text-slate-600" },
  { icon: IndianRupee, label: "Average P2P Price", value: "₹6.20/kWh", tone: "bg-solar-100 text-solar-600" },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex items-start gap-3 bg-slate-100 border border-slate-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-slate-600">
          Platform-wide monitoring view. All figures below are demo/mock
          data for this prototype.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${stat.tone}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-ink-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
