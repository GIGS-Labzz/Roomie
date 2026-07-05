"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@repo/db/client";
import { Building2, ArrowLeft, Loader2, Sparkles, Plus, X } from "lucide-react";

const supabase = createClient();

const POPULAR_LOCATIONS = [
  { name: "Lagos", institutions: ["UNILAG", "LASU", "Yaba Tech", "FCE Akoka"] },
  { name: "Abuja", institutions: ["UNIABUJA", "BAZE", "Nile University", "Bingham University"] },
  { name: "Ibadan", institutions: ["UI", "LAUTECH", "Polytechnic Ibadan"] },
  { name: "Port Harcourt", institutions: ["UNIPORT", "RSU", "IAUE"] },
  { name: "Enugu", institutions: ["ESUT", "IMT Enugu", "Coal City University"] },
  { name: "Nsukka", institutions: ["UNN"] },
  { name: "Benin City", institutions: ["UNIBEN", "BIU"] },
  { name: "Owerri", institutions: ["FUTO", "IMSU"] },
  { name: "Akure", institutions: ["FUTA"] },
  { name: "Zaria", institutions: ["ABU"] },
  { name: "Kano", institutions: ["BUK"] },
  { name: "Ile-Ife", institutions: ["OAU"] },
];

export default function NewProviderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Location/Institution states
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [customLocationInput, setCustomLocationInput] = useState("");

  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
  const [customInstitutionInput, setCustomInstitutionInput] = useState("");

  // Compute dynamic matching institutions based on selected locations
  const availableInstitutions = POPULAR_LOCATIONS.filter((loc) =>
    selectedLocations.includes(loc.name)
  ).flatMap((loc) => loc.institutions);

  const toggleLocation = (locName: string) => {
    if (selectedLocations.includes(locName)) {
      setSelectedLocations(selectedLocations.filter((l) => l !== locName));
      // Clean up institutions belonging to this location
      const locData = POPULAR_LOCATIONS.find((l) => l.name === locName);
      if (locData) {
        setSelectedInstitutions(
          selectedInstitutions.filter((inst) => !locData.institutions.includes(inst))
        );
      }
    } else {
      setSelectedLocations([...selectedLocations, locName]);
    }
  };

  const handleAddCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customLocationInput.trim();
    if (!val) return;
    if (selectedLocations.some((l) => l.toLowerCase() === val.toLowerCase())) {
      setCustomLocationInput("");
      return;
    }
    setSelectedLocations([...selectedLocations, val]);
    setCustomLocationInput("");
  };

  const removeLocation = (locName: string) => {
    setSelectedLocations(selectedLocations.filter((l) => l !== locName));
    const locData = POPULAR_LOCATIONS.find((l) => l.name === locName);
    if (locData) {
      setSelectedInstitutions(
        selectedInstitutions.filter((inst) => !locData.institutions.includes(inst))
      );
    }
  };

  const toggleInstitution = (instName: string) => {
    if (selectedInstitutions.includes(instName)) {
      setSelectedInstitutions(selectedInstitutions.filter((i) => i !== instName));
    } else {
      setSelectedInstitutions([...selectedInstitutions, instName]);
    }
  };

  const handleAddCustomInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customInstitutionInput.trim();
    if (!val) return;
    if (selectedInstitutions.some((i) => i.toLowerCase() === val.toLowerCase())) {
      setCustomInstitutionInput("");
      return;
    }
    setSelectedInstitutions([...selectedInstitutions, val]);
    setCustomInstitutionInput("");
  };

  const removeInstitution = (instName: string) => {
    setSelectedInstitutions(selectedInstitutions.filter((i) => i !== instName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Platform / Business Name is required.");
      return;
    }
    if (!url.trim()) {
      setError("Website Link is required.");
      return;
    }
    if (!contactEmail.trim()) {
      setError("Contact Email is required.");
      return;
    }
    if (selectedLocations.length === 0) {
      setError("At least one location/state is required.");
      return;
    }

    // Basic URL validation
    let validatedUrl = url.trim();
    if (!/^https?:\/\//i.test(validatedUrl)) {
      validatedUrl = `https://${validatedUrl}`;
    }
    try {
      new URL(validatedUrl);
    } catch {
      setError("Please enter a valid website URL.");
      return;
    }

    setLoading(true);

    try {
      // Check for duplicate platform by email
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase as any)
        .from("housing_platforms")
        .select("id")
        .eq("contact_email", contactEmail.trim())
        .maybeSingle();

      if (existing) {
        setError("A platform is already registered with this contact email.");
        setLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from("housing_platforms")
        .insert({
          name: name.trim(),
          url: validatedUrl,
          description: description.trim() || null,
          cities: selectedLocations,
          campus_tags: selectedInstitutions,
          contact_name: contactName.trim() || name.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim() || null,
          status: "ACTIVE", // Auto-verified!
          is_featured: false,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        setError(`Failed to save provider: ${insertError.message}`);
        setLoading(false);
      } else {
        // Redirect to provider list
        router.push("/super/providers");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Unhandled error:", err);
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header / Back action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Providers
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        {/* Banner header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-6 text-white flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-display font-bold text-2xl flex items-center gap-2">
              <Building2 className="w-6 h-6" /> Add Housing Provider
            </h1>
            <p className="text-sm text-brand-100">
              Directly add a pre-verified housing platform to Roomie.
            </p>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-peach-300 animate-pulse" />
            Auto-Verified
          </div>
        </div>

        {/* Form container */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm leading-relaxed">
              {error}
            </div>
          )}

          {/* Section 1: Business Details */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Platform Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="name">
                  Platform Name / Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="e.g. UniCrib Ibadan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="url">
                  Website / Link <span className="text-red-500">*</span>
                </label>
                <input
                  id="url"
                  type="text"
                  required
                  placeholder="e.g. www.unicrib.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="description">
                Brief Bio / Description
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Tell students what this housing platform offers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all resize-none"
              />
            </div>
          </div>

          {/* Section 2: Coverage Areas (Locations) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Locations & Coverage
            </h2>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">
                Select Locations Served <span className="text-red-500">*</span>
              </label>

              {/* Popular Locations grid */}
              <div className="flex flex-wrap gap-2">
                {POPULAR_LOCATIONS.map((loc) => {
                  const isSelected = selectedLocations.includes(loc.name);
                  return (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => toggleLocation(loc.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-brand-500 text-white shadow-sm font-semibold"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {loc.name}
                    </button>
                  );
                })}
              </div>

              {/* Custom Location input */}
              <div className="flex items-center gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  placeholder="Or type custom city/state..."
                  value={customLocationInput}
                  onChange={(e) => setCustomLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomLocation(e);
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomLocation}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                  title="Add custom location"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Selected locations output */}
              {selectedLocations.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-400">Selected Locations:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLocations.map((loc) => (
                      <span
                        key={loc}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-lg font-medium"
                      >
                        {loc}
                        <button
                          type="button"
                          onClick={() => removeLocation(loc)}
                          className="hover:text-brand-900 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Institutions Served */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Institutions & Campus Tags
            </h2>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">
                Select Institutions Served
              </label>

              {/* Check if any location is selected */}
              {selectedLocations.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-1">
                  Select at least one location above to view corresponding popular institutions.
                </div>
              ) : (
                <>
                  {availableInstitutions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {availableInstitutions.map((inst) => {
                        const isSelected = selectedInstitutions.includes(inst);
                        return (
                          <button
                            key={inst}
                            type="button"
                            onClick={() => toggleInstitution(inst)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-brand-500 text-white shadow-sm font-semibold"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            {inst}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Custom Institution input */}
                  <div className="flex items-center gap-2 max-w-sm pt-1">
                    <input
                      type="text"
                      placeholder="Or type custom campus tag (e.g. UNILAG)..."
                      value={customInstitutionInput}
                      onChange={(e) => setCustomInstitutionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomInstitution(e);
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomInstitution}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                      title="Add custom institution"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {/* Selected institutions output */}
              {selectedInstitutions.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-400">Selected Institutions:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInstitutions.map((inst) => (
                      <span
                        key={inst}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-lg font-medium"
                      >
                        {inst}
                        <button
                          type="button"
                          onClick={() => removeInstitution(inst)}
                          className="hover:text-brand-900 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Contact details */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Primary Contact Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="contactEmail">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  required
                  placeholder="e.g. info@unicrib.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="contactName">
                  Contact Person Full Name
                </label>
                <input
                  id="contactName"
                  type="text"
                  placeholder="e.g. Abdullahi Jamil"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="contactPhone">
                  Contact Phone
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  placeholder="e.g. +2348000000000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={loading}
              onClick={() => router.back()}
              className="px-5 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 text-white text-sm font-semibold rounded-2xl hover:bg-brand-600 active:scale-95 transition-all shadow-[0_4px_12px_rgba(138,175,110,0.2)] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add and Verify Provider"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
