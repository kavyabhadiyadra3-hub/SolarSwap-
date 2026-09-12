import { MapPin, Zap, X, CalendarDays, Sparkles, Navigation } from "lucide-react";
import { comparePriceToMarket } from "../../utils/pricingEngine.js";

const PRICE_TONE_STYLES = {
  good: "text-eco-700 bg-eco-100",
  high: "text-solar-600 bg-solar-100",
  neutral: "text-slate-500 bg-slate-100",
};

// One listing card. Used both for the plain marketplace grid and for the
// "Recommended for You" featured spot (pass `featured` + `match` for that).
export default function ListingCard({
  listing,
  isOwnListing,
  canBuy,
  marketPrice,
  isBuyingOpen,
  isPurchasing,
  buyAmount,
  buyError,
  onOpenBuy,
  onCloseBuy,
  onAmountChange,
  onConfirmBuy,
  match, // { matchScore, reasons, estimatedDistanceKm } — omit to hide match info
  featured = false,
  walletBalance = 0,
  walletLoading = false,
}) {
  const priceComparison = comparePriceToMarket(Number(listing.price_per_kwh), marketPrice);

  return (
    <div
      className={`bg-white rounded-2xl border p-6 hover:shadow-lg transition-shadow flex flex-col ${
        featured ? "border-eco-300 ring-1 ring-eco-200" : "border-slate-200"
      }`}
    >
      {featured && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-eco-700 bg-eco-50 -mt-6 -mx-6 mb-4 px-6 py-2 rounded-t-2xl border-b border-eco-100">
          <Sparkles className="w-3.5 h-3.5" />
          BEST MATCH
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-ink-900">
          {listing.profiles?.full_name || "Unknown seller"}
        </h3>
        <span className="text-xs font-semibold text-eco-700 bg-eco-100 px-2.5 py-1 rounded-full capitalize">
          {listing.status}
        </span>
      </div>

      <div className="space-y-2 mb-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-solar-500" />
          {listing.remaining_energy} kWh available
          {listing.remaining_energy !== listing.energy_amount && (
            <span className="text-slate-400">of {listing.energy_amount} kWh</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          {listing.location}
          {match && (
            <span className="text-slate-400 inline-flex items-center gap-1">
              <Navigation className="w-3 h-3" />~{Math.round(match.estimatedDistanceKm)} km (est.)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-slate-400" />
          Available from {new Date(listing.availability_date).toLocaleDateString()}
        </div>
      </div>

      {/* Price vs market reference */}
      <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2 mb-4">
        <div>
          <p className="text-slate-400">Seller Price</p>
          <p className="font-bold text-ink-900 text-sm">
            ₹{Number(listing.price_per_kwh).toFixed(2)}/kWh
          </p>
        </div>
        <div className="text-right">
          <p className="text-slate-400">Market Price</p>
          <p className="font-semibold text-slate-600 text-sm">
            ₹{Number(marketPrice || 0).toFixed(2)}/kWh
          </p>
        </div>
        {priceComparison && (
          <span
            className={`font-semibold px-2 py-1 rounded-full ${PRICE_TONE_STYLES[priceComparison.tone]}`}
          >
            {priceComparison.label}
          </span>
        )}
      </div>

      {/* Match score + explainable reasons */}
      {match && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Match Score</span>
            <span className="text-sm font-extrabold text-eco-700">{match.matchScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-eco-500 rounded-full"
              style={{ width: `${match.matchScore}%` }}
            />
          </div>
          {match.reasons.length > 0 && (
            <ul className="space-y-0.5">
              {match.reasons.map((reason) => (
                <li key={reason} className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="text-eco-600">✓</span> {reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-extrabold text-ink-900">
            ₹{Number(listing.price_per_kwh).toFixed(2)}
            <span className="text-xs font-normal text-slate-400">/kWh</span>
          </span>

          {isOwnListing ? (
            <span className="text-xs font-semibold text-slate-400">Your listing</span>
          ) : !canBuy ? (
            <span className="text-xs text-slate-400 text-right max-w-[9rem]">
              Only consumer accounts can buy energy
            </span>
          ) : !isBuyingOpen ? (
            <button
              onClick={() => onOpenBuy(listing)}
              className="text-sm font-semibold text-white bg-eco-600 px-4 py-2 rounded-lg hover:bg-eco-700 transition"
            >
              Buy Energy
            </button>
          ) : null}
        </div>

        {isBuyingOpen && (
          <div className="border-t border-slate-100 pt-3 mt-1 space-y-2">
            {!walletLoading && (
              <p className="text-xs text-slate-400">
                Your Demo Wallet: <span className="font-semibold text-slate-600">₹{walletBalance.toFixed(2)}</span>
              </p>
            )}
            <label className="block text-xs font-semibold text-slate-500">
              Amount to buy (kWh)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.1"
                max={listing.remaining_energy}
                step="0.1"
                value={buyAmount ?? ""}
                onChange={(e) => onAmountChange(listing.id, e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-eco-500"
              />
              <button
                onClick={() => onConfirmBuy(listing)}
                disabled={isPurchasing}
                className="shrink-0 text-sm font-semibold text-white bg-eco-600 px-4 py-2 rounded-lg hover:bg-eco-700 transition disabled:opacity-60"
              >
                {isPurchasing ? "Buying…" : "Confirm"}
              </button>
              <button
                onClick={onCloseBuy}
                disabled={isPurchasing}
                className="shrink-0 text-slate-400 hover:text-slate-600 p-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Phase 7: purchase total + demo wallet preview */}
            {(() => {
              const amountNum = Number(buyAmount);
              if (!amountNum || amountNum <= 0) return null;
              const total = amountNum * Number(listing.price_per_kwh);
              const remaining = walletBalance - total;
              return (
                <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-slate-500">
                    Total: <span className="font-bold text-ink-900">₹{total.toFixed(2)}</span>
                  </span>
                  {!walletLoading && (
                    <span className={remaining < 0 ? "text-red-600 font-semibold" : "text-slate-500"}>
                      Remaining Balance: ₹{remaining.toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })()}

            {buyError && <p className="text-xs text-red-600">{buyError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
