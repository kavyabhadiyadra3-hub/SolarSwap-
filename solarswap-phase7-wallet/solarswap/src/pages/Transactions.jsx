import { useEffect, useState } from "react";
import { Loader2, AlertCircle, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useAuth } from "../utils/auth.jsx";
import { fetchMyTransactions, fetchProfileNames } from "../lib/marketplace.js";

const STATUS_STYLES = {
  completed: "bg-eco-100 text-eco-700",
  pending: "bg-solar-100 text-solar-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function Transactions() {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    setLoading(true);
    setError("");

    fetchMyTransactions(user.id)
      .then(async (data) => {
        if (!isMounted) return;
        setTransactions(data);

        const counterpartIds = data.map((t) => (t.buyer_id === user.id ? t.seller_id : t.buyer_id));
        const nameMap = await fetchProfileNames(counterpartIds);
        if (isMounted) setNames(nameMap);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink-900 mb-2">Transaction History</h1>
        <p className="text-slate-600">Every energy trade you've bought or sold on SolarSwap.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-slate-500 py-16">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading your transactions…
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <p className="text-center text-slate-500 py-16">
          No transactions yet. Visit the Marketplace to buy or sell energy.
        </p>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div className="space-y-3">
          {transactions.map((t) => {
            const isBuyer = t.buyer_id === user.id;
            const counterpartId = isBuyer ? t.seller_id : t.buyer_id;
            const counterpartName = names[counterpartId] || "Unknown user";

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isBuyer ? "bg-eco-100 text-eco-600" : "bg-solar-100 text-solar-600"
                    }`}
                  >
                    {isBuyer ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">
                      {isBuyer ? `Bought from ${counterpartName}` : `Sold to ${counterpartName}`}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(t.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-slate-600 text-right">
                  <p>
                    {t.energy_amount} kWh @ ₹{Number(t.price_per_kwh).toFixed(2)}/kWh
                  </p>
                  <p className="font-bold text-ink-900">₹{Number(t.total_amount).toFixed(2)}</p>
                </div>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                    STATUS_STYLES[t.status] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {t.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
