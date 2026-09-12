import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { createListing } from "../../lib/marketplace.js";

export default function CreateListingForm({ sellerId, onCreated }) {
  const [energyAmount, setEnergyAmount] = useState("");
  const [pricePerKwh, setPricePerKwh] = useState("");
  const [location, setLocation] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!energyAmount || Number(energyAmount) <= 0) {
      return "Energy amount must be greater than 0.";
    }
    if (!pricePerKwh || Number(pricePerKwh) <= 0) {
      return "Price per kWh must be greater than 0.";
    }
    if (!location.trim()) {
      return "Location is required.";
    }
    if (!availabilityDate) {
      return "Availability date is required.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const listing = await createListing({
        sellerId,
        energyAmount: Number(energyAmount),
        pricePerKwh: Number(pricePerKwh),
        location: location.trim(),
        availabilityDate,
      });
      setSuccess("Listing created — it's now visible in the Marketplace.");
      setEnergyAmount("");
      setPricePerKwh("");
      setLocation("");
      setAvailabilityDate("");
      onCreated?.(listing);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="font-bold text-ink-900 mb-4">List Surplus Energy</h2>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 bg-eco-50 border border-eco-100 text-eco-700 text-sm rounded-lg p-3 mb-4">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Energy amount (kWh)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={energyAmount}
            onChange={(e) => setEnergyAmount(e.target.value)}
            placeholder="e.g. 100"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-eco-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Price per kWh (₹)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={pricePerKwh}
            onChange={(e) => setPricePerKwh(e.target.value)}
            placeholder="e.g. 5.00"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-eco-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Ahmedabad"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-eco-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Availability date
          </label>
          <input
            type="date"
            value={availabilityDate}
            onChange={(e) => setAvailabilityDate(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-eco-500"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="text-sm font-semibold text-white bg-solar-500 px-5 py-2.5 rounded-lg hover:bg-solar-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating listing…" : "Create Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
