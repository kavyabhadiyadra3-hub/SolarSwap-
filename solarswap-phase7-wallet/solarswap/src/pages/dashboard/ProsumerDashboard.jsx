import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Home, TrendingUp, IndianRupee, Zap } from "lucide-react";
import MiniBarChart from "../../components/charts/MiniBarChart.jsx";
import WalletCard from "../../components/wallet/WalletCard.jsx";
import CreateListingForm from "../../components/marketplace/CreateListingForm.jsx";
import MyListings from "../../components/marketplace/MyListings.jsx";
import ProsumerMarketInsight from "../../components/marketplace/ProsumerMarketInsight.jsx";
import { useAuth } from "../../utils/auth.jsx";
import { fetchWalletBalance, fetchMyTransactions } from "../../lib/marketplace.js";

// These three remain simulated placeholders — Phase 7 is wallet/transactions
// only; there's no real solar-generation or home-consumption feed to source
// them from yet (that's a different, later phase).
const STATIC_STAT_CARDS = [
  { icon: Sun, label: "Solar Generation", value: "8.4 kWh", tone: "bg-solar-100 text-solar-600" },
  { icon: Home, label: "Home Consumption", value: "3.1 kWh", tone: "bg-slate-100 text-slate-600" },
  { icon: TrendingUp, label: "Available Surplus", value: "5.3 kWh", tone: "bg-eco-100 text-eco-600" },
];

const GENERATION_DATA = [
  { label: "Mon", value: 7.8 },
  { label: "Tue", value: 8.1 },
  { label: "Wed", value: 6.5 },
  { label: "Thu", value: 8.9 },
  { label: "Fri", value: 9.2 },
  { label: "Sat", value: 8.4 },
  { label: "Sun", value: 7.6 },
];

export default function ProsumerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listingsRefreshKey, setListingsRefreshKey] = useState(0);

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
    // Re-fetch wallet/transactions whenever a listing changes too, since a
    // new sale (via a purchase against one of this seller's listings) is
    // the thing that would move the wallet balance.
  }, [user, listingsRefreshKey]);

  const sales = useMemo(
    () => transactions.filter((t) => t.seller_id === user?.id),
    [transactions, user?.id]
  );

  const totalEarnings = useMemo(
    () => sales.reduce((sum, t) => sum + Number(t.total_amount || 0), 0),
    [sales]
  );

  const energySold = useMemo(
    () => sales.reduce((sum, t) => sum + Number(t.energy_amount || 0), 0),
    [sales]
  );

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <WalletCard loading={walletLoading} error={walletError} balance={balance} tone="solar" />

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-solar-100 text-solar-600">
            <IndianRupee className="w-5 h-5" />
          </div>
          {txLoading ? (
            <p className="text-2xl font-extrabold text-ink-900">—</p>
          ) : txError ? (
            <p className="text-xs text-red-600">{txError}</p>
          ) : (
            <p className="text-2xl font-extrabold text-ink-900">₹{totalEarnings.toFixed(2)}</p>
          )}
          <p className="text-sm text-slate-500 mt-1">Total Earnings</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-eco-100 text-eco-600">
            <Zap className="w-5 h-5" />
          </div>
          {txLoading ? (
            <p className="text-2xl font-extrabold text-ink-900">—</p>
          ) : txError ? (
            <p className="text-xs text-red-600">{txError}</p>
          ) : (
            <p className="text-2xl font-extrabold text-ink-900">{energySold.toFixed(1)} kWh</p>
          )}
          <p className="text-sm text-slate-500 mt-1">Energy Sold</p>
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
          className="text-sm font-semibold text-white bg-solar-500 px-5 py-2.5 rounded-lg hover:bg-solar-600 transition"
        >
          Sell Energy
        </button>
        <button
          onClick={() => navigate("/marketplace")}
          className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-5 py-2.5 rounded-lg hover:bg-slate-50 transition"
        >
          View Marketplace
        </button>
        <button
          onClick={() => navigate("/transactions")}
          className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-5 py-2.5 rounded-lg hover:bg-slate-50 transition"
        >
          Transactions
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-10">
        <h2 className="font-bold text-ink-900 mb-6">Solar Generation This Week</h2>
        <MiniBarChart data={GENERATION_DATA} unit=" kWh" barClassName="bg-solar-500" />
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-ink-900 mb-4">Your Market Insight</h2>
          <ProsumerMarketInsight sellerId={user?.id} refreshKey={listingsRefreshKey} />
        </div>

        <CreateListingForm
          sellerId={user?.id}
          onCreated={() => setListingsRefreshKey((k) => k + 1)}
        />

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-ink-900 mb-4">Your Energy Listings</h2>
          <MyListings sellerId={user?.id} refreshKey={listingsRefreshKey} />
        </div>
      </div>
    </div>
  );
}
