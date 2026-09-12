import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { fetchListingsBySeller } from "../../lib/marketplace.js";

const STATUS_STYLES = {
  available: "bg-eco-100 text-eco-700",
  sold: "bg-slate-200 text-slate-600",
  cancelled: "bg-red-100 text-red-600",
};

export default function MyListings({ sellerId, refreshKey }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    fetchListingsBySeller(sellerId)
      .then((data) => {
        if (isMounted) setListings(data);
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm py-6">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading your listings…
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

  if (listings.length === 0) {
    return <p className="text-sm text-slate-500 py-4">You haven't listed any energy yet.</p>;
  }

  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="flex flex-wrap items-center justify-between gap-3 border border-slate-100 rounded-xl p-4"
        >
          <div className="text-sm">
            <p className="font-semibold text-ink-900">
              {listing.remaining_energy} / {listing.energy_amount} kWh remaining
            </p>
            <p className="text-slate-500">
              {listing.location} · ₹{Number(listing.price_per_kwh).toFixed(2)}/kWh · Available{" "}
              {new Date(listing.availability_date).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
              STATUS_STYLES[listing.status] || "bg-slate-100 text-slate-600"
            }`}
          >
            {listing.status}
          </span>
        </div>
      ))}
    </div>
  );
}
