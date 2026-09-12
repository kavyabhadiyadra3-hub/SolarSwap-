import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, AlertCircle, MapPinned, Zap, X } from "lucide-react";
import { useAuth } from "../utils/auth.jsx";
import { fetchAvailableListings, fetchWalletBalance, purchaseEnergy } from "../lib/marketplace.js";
import { analyzeMarket } from "../utils/marketAnalysis.js";
import { calculateDynamicPrice } from "../utils/pricingEngine.js";
import { scoreListing, SIMULATED_LOCATIONS } from "../utils/matchingEngine.js";
import MarketConditionsPanel from "../components/marketplace/MarketConditionsPanel.jsx";
import ListingCard from "../components/marketplace/ListingCard.jsx";

const SORT_OPTIONS = [
  { value: "match", label: "Best Match" },
  { value: "price-asc", label: "Lowest Price" },
  { value: "energy-desc", label: "Highest Energy" },
  { value: "distance-asc", label: "Nearest" },
];

export default function Marketplace() {
  const { user } = useAuth();
  const canBuy = user?.role === "consumer";

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(10);
  const [minEnergy, setMinEnergy] = useState(0);

  // Phase 6: simulated "I am located in..." selector (no GPS/maps) used for
  // estimated distance in the matching engine. Defaults to Ahmedabad.
  const [consumerLocation, setConsumerLocation] = useState("Ahmedabad");
  const [sortBy, setSortBy] = useState(canBuy ? "match" : "price-asc");

  const [notice, setNotice] = useState(null); // { message, tone }

  // Per-listing "buy" UI state, keyed by listing id.
  const [buyAmounts, setBuyAmounts] = useState({});
  const [buyingOpenFor, setBuyingOpenFor] = useState(null);
  const [purchasingId, setPurchasingId] = useState(null);
  const [buyError, setBuyError] = useState("");

  // Phase 7: the buyer's own demo wallet balance, shown in the buy panel so
  // a Consumer can see their balance and the resulting remaining balance
  // before confirming. Only relevant for consumer accounts.
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(canBuy);

  const loadListings = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchAvailableListings();
      setListings(data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadWalletBalance = async () => {
    if (!canBuy) return;
    setWalletLoading(true);
    try {
      const value = await fetchWalletBalance();
      setWalletBalance(value);
    } catch {
      // Non-fatal: the buy panel just won't show a balance preview. The
      // purchase itself is still protected server-side either way.
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
    loadWalletBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Phase 6: market analysis + dynamic pricing --------------------------
  // Computed entirely from the listings already loaded above — no extra
  // Supabase requests.
  const marketAnalysisData = useMemo(() => analyzeMarket(listings), [listings]);

  const dynamicPricing = useMemo(
    () =>
      calculateDynamicPrice({
        basePrice: marketAnalysisData.avgPrice,
        totalSupply: marketAnalysisData.totalSupply,
        estimatedDemand: marketAnalysisData.estimatedDemand,
        congestionLevel: marketAnalysisData.congestionLevel,
      }),
    [marketAnalysisData]
  );

  // ---- Phase 6: smart matching ----------------------------------------------
  const matchContext = useMemo(
    () => ({
      marketPrice: dynamicPricing.dynamicPrice,
      consumerLocation,
      congestionLevel: marketAnalysisData.congestionLevel,
      now: new Date(),
    }),
    [dynamicPricing.dynamicPrice, consumerLocation, marketAnalysisData.congestionLevel]
  );

  const annotatedListings = useMemo(
    () => listings.map((l) => ({ ...l, _match: scoreListing(l, matchContext) })),
    [listings, matchContext]
  );

  const bestMatch = useMemo(() => {
    if (!canBuy) return null;
    const candidates = annotatedListings.filter((l) => l.seller_id !== user?.id);
    if (candidates.length === 0) return null;
    return [...candidates].sort((a, b) => b._match.matchScore - a._match.matchScore)[0];
  }, [annotatedListings, canBuy, user?.id]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return annotatedListings.filter((l) => {
      const sellerName = l.profiles?.full_name || "";
      const matchesSearch =
        !term || sellerName.toLowerCase().includes(term) || l.location.toLowerCase().includes(term);
      return matchesSearch && l.price_per_kwh <= maxPrice && l.remaining_energy >= minEnergy;
    });
  }, [annotatedListings, search, maxPrice, minEnergy]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "match":
        arr.sort((a, b) => b._match.matchScore - a._match.matchScore);
        break;
      case "price-asc":
        arr.sort((a, b) => a.price_per_kwh - b.price_per_kwh);
        break;
      case "energy-desc":
        arr.sort((a, b) => b.remaining_energy - a.remaining_energy);
        break;
      case "distance-asc":
        arr.sort((a, b) => a._match.estimatedDistanceKm - b._match.estimatedDistanceKm);
        break;
      default:
        break; // keep the newest-first order the query already returned
    }
    return arr;
  }, [filtered, sortBy]);

  // The main grid excludes the featured "Recommended for You" listing so it
  // isn't shown twice.
  const gridListings = bestMatch ? sorted.filter((l) => l.id !== bestMatch.id) : sorted;

  const openBuyFor = (listing) => {
    setBuyError("");
    setBuyingOpenFor(listing.id);
    setBuyAmounts((prev) => ({ ...prev, [listing.id]: prev[listing.id] ?? listing.remaining_energy }));
  };

  const closeBuy = () => {
    setBuyingOpenFor(null);
    setBuyError("");
  };

  const handleAmountChange = (listingId, value) => {
    setBuyAmounts((prev) => ({ ...prev, [listingId]: value }));
  };

  // Existing Phase 5 purchase flow — untouched. Recommendations only help
  // the consumer pick a listing; the actual purchase still goes through
  // the purchase_energy() RPC via purchaseEnergy().
  const handleConfirmBuy = async (listing) => {
    const amount = Number(buyAmounts[listing.id]);
    setBuyError("");

    if (!amount || amount <= 0) {
      setBuyError("Enter an amount greater than 0.");
      return;
    }
    if (amount > listing.remaining_energy) {
      setBuyError(`Only ${listing.remaining_energy} kWh available.`);
      return;
    }
    // Client-side pre-check for a snappier UX. This is purely a courtesy —
    // purchase_energy() re-checks the real balance server-side regardless,
    // so this can never be the only thing standing between a buyer and
    // spending more than they have.
    const estimatedTotal = amount * Number(listing.price_per_kwh);
    if (!walletLoading && estimatedTotal > walletBalance) {
      setBuyError("Insufficient demo wallet balance.");
      return;
    }

    setPurchasingId(listing.id);
    try {
      const transaction = await purchaseEnergy({ listingId: listing.id, amount });
      setNotice({
        message: `Bought ${transaction.energy_amount} kWh for ₹${Number(transaction.total_amount).toFixed(2)}.`,
        tone: "success",
      });
      setBuyingOpenFor(null);
      await Promise.all([loadListings(), loadWalletBalance()]);
    } catch (err) {
      setBuyError(err.message);
    } finally {
      setPurchasingId(null);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink-900 mb-2">Energy Marketplace</h1>
        <p className="text-slate-600">
          Browse surplus solar energy listed by nearby prosumers.
        </p>
      </div>

      {/* Phase 6: Market Conditions */}
      {!loading && !loadError && listings.length > 0 && (
        <MarketConditionsPanel analysis={marketAnalysisData} dynamicPrice={dynamicPricing} />
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search seller or location..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-eco-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Max price: ₹{maxPrice.toFixed(2)}/kWh
          </label>
          <input
            type="range"
            min="1"
            max="15"
            step="0.1"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-eco-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Min energy: {minEnergy} kWh
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={minEnergy}
            onChange={(e) => setMinEnergy(Number(e.target.value))}
            className="w-full accent-eco-600"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <MapPinned className="w-3.5 h-3.5" />
            Your location (estimated distance)
          </label>
          <select
            value={consumerLocation}
            onChange={(e) => setConsumerLocation(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-eco-500 bg-white"
          >
            {SIMULATED_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Sort by</label>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`text-xs font-semibold px-3 py-2 rounded-lg border transition ${
                  sortBy === opt.value
                    ? "bg-eco-600 border-eco-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-slate-500 py-16">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading listings…
        </div>
      )}

      {/* Load error */}
      {!loading && loadError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-4 mb-8">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Couldn't load the marketplace</p>
            <p>{loadError}</p>
            <button onClick={loadListings} className="mt-2 font-semibold underline">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Phase 6: Recommended for You */}
      {!loading && !loadError && bestMatch && (
        <div className="mb-8">
          <h2 className="font-bold text-ink-900 mb-4">Recommended for You</h2>
          <div className="max-w-md">
            <ListingCard
              listing={bestMatch}
              isOwnListing={bestMatch.seller_id === user?.id}
              canBuy={canBuy}
              marketPrice={dynamicPricing.dynamicPrice}
              isBuyingOpen={buyingOpenFor === bestMatch.id}
              isPurchasing={purchasingId === bestMatch.id}
              buyAmount={buyAmounts[bestMatch.id]}
              buyError={buyingOpenFor === bestMatch.id ? buyError : ""}
              onOpenBuy={openBuyFor}
              onCloseBuy={closeBuy}
              onAmountChange={handleAmountChange}
              onConfirmBuy={handleConfirmBuy}
              match={bestMatch._match}
              featured
              walletBalance={walletBalance}
              walletLoading={walletLoading}
            />
          </div>
        </div>
      )}

      {/* Listings */}
      {!loading && !loadError && (
        gridListings.length === 0 ? (
          <p className="text-center text-slate-500 py-12">
            {listings.length === 0
              ? "No listings are available right now — check back soon."
              : "No listings match your filters."}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isOwnListing={listing.seller_id === user?.id}
                canBuy={canBuy}
                marketPrice={dynamicPricing.dynamicPrice}
                isBuyingOpen={buyingOpenFor === listing.id}
                isPurchasing={purchasingId === listing.id}
                buyAmount={buyAmounts[listing.id]}
                buyError={buyingOpenFor === listing.id ? buyError : ""}
                onOpenBuy={openBuyFor}
                onCloseBuy={closeBuy}
                onAmountChange={handleAmountChange}
                onConfirmBuy={handleConfirmBuy}
                match={canBuy ? listing._match : null}
                walletBalance={walletBalance}
                walletLoading={walletLoading}
              />
            ))}
          </div>
        )
      )}

      {/* Purchase notification */}
      {notice && (
        <div className="fixed bottom-6 right-6 bg-white border border-eco-200 shadow-xl rounded-xl px-5 py-4 flex items-start gap-3 max-w-sm animate-fade-up">
          <Zap className="w-5 h-5 text-eco-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-ink-900">Purchase complete</p>
            <p className="text-slate-600">{notice.message}</p>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
