"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import type { DiscoveryFilters } from "@repo/db/queries/profiles";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DiscoveryFilters;
  onApply: (filters: DiscoveryFilters) => void;
}

const LIFESTYLE_TAGS = [
  "studious", "social", "athletic", "religious", "gamer",
  "foodie", "early-riser", "homebody", "traveler", "vegetarian",
];

const NIGERIAN_CITIES = [
  "Lagos", "Abuja", "Ibadan", "Enugu", "Port Harcourt",
  "Benin City", "Kaduna", "Kano", "Ife", "Nsukka",
  "Zaria", "Jos", "Akure", "Abeokuta", "Uyo",
];

const GENDER_OPTIONS = [
  { value: "", label: "Any" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
];

export function FilterDrawer({ isOpen, onClose, filters, onApply }: FilterDrawerProps) {
  const [draft, setDraft] = useState<DiscoveryFilters>(filters);

  const toggleTag = (tag: string) => {
    const current = draft.tags ?? [];
    setDraft((f) => ({
      ...f,
      tags: current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    }));
  };

  const toggleCity = (city: string) => {
    const current = draft.city ?? [];
    setDraft((f) => ({
      ...f,
      city: current.includes(city) ? current.filter((c) => c !== city) : [...current, city],
    }));
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    const empty: DiscoveryFilters = {};
    setDraft(empty);
    onApply(empty);
    onClose();
  };

  const activeCount = [
    (draft.city?.length ?? 0) > 0,
    !!draft.gender,
    (draft.minBudget ?? 0) > 0 || (draft.maxBudget ?? 0) > 0,
    (draft.tags?.length ?? 0) > 0,
    draft.verifiedOnly,
  ].filter(Boolean).length;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer — slides up on mobile, sidebar on desktop */}
      <aside
        className={`
          fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl
          transition-transform duration-300 ease-out
          max-h-[90vh] overflow-y-auto
          md:static md:rounded-3xl md:shadow-none md:max-h-none md:overflow-visible
          ${isOpen ? "translate-y-0" : "translate-y-full md:translate-y-0"}
        `}
      >
        <div className="p-6 space-y-6">
          {/* Handle */}
          <div className="flex items-center justify-between md:hidden">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto" />
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-slate-900 text-lg">
              Filters {activeCount > 0 && (
                <span className="ml-1.5 text-xs font-semibold bg-brand-500 text-white rounded-full px-2 py-0.5">
                  {activeCount}
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1"
              aria-label="Close filters"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Verified only */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-slate-700">Verified students only</span>
            <button
              role="switch"
              aria-checked={draft.verifiedOnly}
              onClick={() => setDraft((f) => ({ ...f, verifiedOnly: !f.verifiedOnly }))}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                draft.verifiedOnly ? "bg-brand-500" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  draft.verifiedOnly ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>

          {/* Gender preference */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Preferred gender</p>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDraft((f) => ({ ...f, gender: opt.value || undefined }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    (draft.gender ?? "") === opt.value
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Monthly budget (₦)</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Min</label>
                <input
                  type="number"
                  placeholder="20,000"
                  value={draft.minBudget ?? ""}
                  onChange={(e) => setDraft((f) => ({ ...f, minBudget: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Max</label>
                <input
                  type="number"
                  placeholder="500,000"
                  value={draft.maxBudget ?? ""}
                  onChange={(e) => setDraft((f) => ({ ...f, maxBudget: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
              </div>
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">City</p>
            <div className="flex flex-wrap gap-2">
              {NIGERIAN_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => toggleCity(city)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    draft.city?.includes(city)
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Lifestyle tags */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Lifestyle tags</p>
            <div className="flex flex-wrap gap-2">
              {LIFESTYLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                    draft.tags?.includes(tag)
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
                  }`}
                >
                  {tag.replace(/-/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-safe">
            <Button variant="secondary" size="sm" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button variant="primary" size="sm" onClick={handleApply} className="flex-1">
              Apply filters
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
