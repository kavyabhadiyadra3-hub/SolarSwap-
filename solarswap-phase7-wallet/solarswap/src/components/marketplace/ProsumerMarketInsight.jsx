import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle, TrendingUp, IndianRupee } from "lucide-react";
import { fetchAvailableListings, fetchListingsBySeller } from "../../lib/marketplace.js";
import { analyzeMarket } from "../../utils/marketAnalysis.js";
import { calculateDynamicPrice, comparePriceToMarket } from "../../utils/pricingEngine.js";

const POSITION_STYLES = {
  good: { label: "Competitive", tone: "text-eco-700 bg-eco-100" },
  high: { label: "Above Market", tone: "text-solar-600 bg-solar-100" },
  neutral: { label: "At Market Price", tone: "text-slate-600 bg-slate-100" },
};

// Phase 6, Part 7 — a small "Market Insight" card for the Prosumer
// dashboard. Informational only: it never changes the seller's stored
// price_per_kwh, it just shows how their own active listings compare to
// the current market reference price.
export default function ProsumerMarketInsight({ sellerId, refreshKey }) {
  const [marketListings, setMarketListings] = useState([]);
  const [ownListings, setOwnListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sellerId) return;
    let isMounted = true;
    setLoading(true);
    setError("");

    Promise.all([fetchAvailableListings(), fetchListingsBySeller(sellerId)])
      .then(([market, own]) => {
        if (!isMounted) return;
        setMarketListings(market);
        setOwnListings(own.filter((l) => l.status === "available"));
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
  }, [sellerId, refreshKey]);

  const analysis = useMemo(() => analyzeMarket(marketListings), [marketListings]);
  const dynamicPricing = useMemo(
    () =>
      calculateDynamicPrice({
        basePrice: analysis.avgPrice,
        totalSupply: analysis.totalSupply,
        estimatedDemand: analysis.estimatedDemand,
        congestionLevel: analysis.congestionLevel,
      }),
    [analysis]
  );

  const yourAvgPrice = useMemo(() => {
    if (ownListings.length === 0) return null;
    const total = ownListings.reduce((sum, l) => sum + Number(l.price_per_kwh || 0), 0);
    return total / ownListings.length;
  }, [ownListings]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm py-6">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading market insight…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-3">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  if (yourAvgPrice === null) {
    return (
      <p className="text-sm text-slate-500 py-2">
        Create an active listing to see how your price compares to the market.
      </p>
    );
  }

  const comparison = comparePriceToMarket(yourAvgPrice, dynamicPricing.dynamicPrice);
  const position = POSITION_STYLES[comparison?.tone] || POSITION_STYLES.neutral;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-solar-100 flex items-center justify-center shrink-0">
          <IndianRupee className="w-4 h-4 text-solar-600" />
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Your Price (avg. active listings)</p>
          <p className="font-bold text-ink-900 text-sm">₹{yourAvgPrice.toFixed(2)}/kWh</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-eco-100 flex items-center justify-center shrink-0">
          <TrendingUp className="w-4 h-4 text-eco-600" />
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Current Market Price</p>
          <p className="font-bold text-ink-900 text-sm">
            ₹{dynamicPricing.dynamicPrice.toFixed(2)}/kWh
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-1">Market Position</p>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${position.tone}`}>
          {position.label}
        </span>
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-1">Demand*</p>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full text-slate-600 bg-slate-100">
          {analysis.marketCondition}
        </span>
      </div>

      <p className="sm:col-span-2 text-[11px] text-slate-400">
        * Simulated demand/market condition — informational only. This never changes your
        listing's stored price.
      </p>
    </div>
  );
}
