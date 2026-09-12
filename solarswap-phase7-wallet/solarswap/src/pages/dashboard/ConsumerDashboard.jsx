import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Gauge, IndianRupee } from "lucide-react";
import MiniBarChart from "../../components/charts/MiniBarChart.jsx";
import WalletCard from "../../components/wallet/WalletCard.jsx";
import { useAuth } from "../../utils/auth.jsx";
import { fetchWalletBalance, fetchMyTransactions } from "../../lib/marketplace.js";

// These two remain simulated placeholders — Phase 7 is wallet/transactions
// only, and there's no real smart-meter usage feed or live P2P index feed
// to source them from yet (that's a different, later phase).
const STATIC_STAT_CARDS = [
  { icon: Gauge, label: "Today's Usage", value: "4.2 kWh", tone: "bg-slate-100 text-slate-600" },
  { icon: IndianRupee, label: "Current P2P Price", value: "₹6.20/kWh", tone: "bg-eco-100 text-eco-600" },
];

const USAGE_DATA = [
  { label: "Mon", value: 3.8 },
  { label: "Tue", value: 4.5 },
  { label: "Wed", value: 3.9 },
  { label: "Thu", value: 5.1 },
  { label: "Fri", value: 4.6 },
  { label: "Sat", value: 4.2 },
  { label: "Sun", value: 3.4 },
];

export default function ConsumerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [balance, setBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState("");

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    setWalletLoading(true);
    setWalletError("");
    fetchWalletBalance()
      .then((value) => {
        if (isMounted) setBalance(value);
      })
      .catch((err) => {
        if (isMounted) setWalletError(err.message);
      })
      .finally(() => {
        if (isMounted) setWalletLoading(false);
      });

    setTxLoading(true);
    setTxError("");
    fetchMyTransactions(user.id)
      .then((data) => {
        if (isMounted) setTransactions(data);
      })
      .catch((err) => {
        if (isMounted) setTxError(err.message);
      })
      .finally(() => {
        if (isMounted) setTxLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Purchases only — a Consumer account never sells, but filter explicitly
  // rather than assuming.
  const purchases = useMemo(
    () => transactions.filter((t) => t.buyer_id === user?.id),
    [transactions, user?.id]
  );

  const totalEnergyPurchased = useMemo(
    () => purchases.reduce((sum, t) => sum + Number(t.energy_amount || 0), 0),
    [purchases]
  );

  const totalSpent = useMemo(
    () => purchases.reduce((sum, t) => sum + Number(t.total_amount || 0), 0),
    [purchases]
  );

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <WalletCard loading={walletLoading} error={walletError} balance={balance} tone="eco" />

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-eco-100 text-eco-600">
            <Zap className="w-5 h-5" />
          </div>
          {txLoading ? (
            <p className="text-2xl font-extrabold text-ink-900">—</p>
          ) : txError ? (
            <p className="text-xs text-red-600">{txError}</p>
          ) : (
            <p className="text-2xl font-extrabold text-ink-900">
              {totalEnergyPurchased.toFixed(1)} kWh
            </p>
          )}
          <p className="text-sm text-slate-500 mt-1">Total Energy Purchased</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-solar-100 text-solar-600">
            <IndianRupee className="w-5 h-5" />
          </div>
          {txLoading ? (
            <p className="text-2xl font-extrabold text-ink-900">—</p>
          ) : txError ? (
            <p className="text-xs text-red-600">{txError}</p>
          ) : (
            <p className="text-2xl font-extrabold text-ink-900">₹{totalSpent.toFixed(2)}</p>
          )}
          <p className="text-sm text-slate-500 mt-1">Total Spent</p>
        </div>

        {STATIC_STAT_CARDS.map((stat) => {
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

      <div className="flex flex-wrap gap-3 mb-10">
        <button
          onClick={() => navigate("/marketplace")}
          className="text-sm font-semibold text-white bg-eco-600 px-5 py-2.5 rounded-lg hover:bg-eco-700 transition"
        >
          Buy Energy
        </button>
        <button
          onClick={() => navigate("/transactions")}
          className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-5 py-2.5 rounded-lg hover:bg-slate-50 transition"
        >
          View Transactions
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-ink-900 mb-6">Energy Usage This Week</h2>
        <MiniBarChart data={USAGE_DATA} unit=" kWh" barClassName="bg-eco-500" />
      </div>
    </div>
  );
}
