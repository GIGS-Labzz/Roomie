"use client";

import { useState } from "react";
import { Logo } from "@repo/ui/logo";

const NIGERIAN_CITIES = [
  "Lagos", "Abuja", "Ibadan", "Kano", "Port Harcourt", "Benin City",
  "Enugu", "Owerri", "Calabar", "Uyo", "Warri", "Ilorin", "Abeokuta",
  "Kaduna", "Zaria", "Akure", "Ado-Ekiti", "Ile-Ife", "Oshogbo",
];

const NIGERIAN_UNIVERSITIES = [
  "University of Lagos (UNILAG)", "University of Ibadan (UI)", "Obafemi Awolowo University (OAU)",
  "University of Nigeria, Nsukka (UNN)", "Ahmadu Bello University (ABU)", "University of Benin (UNIBEN)",
  "University of Port Harcourt (UNIPORT)", "Federal University of Technology, Akure (FUTA)",
  "Covenant University", "Babcock University", "Lagos State University (LASU)",
  "Nnamdi Azikiwe University (UNIZIK)", "University of Calabar (UNICAL)", "University of Uyo (UNIUYO)",
  "Bayero University Kano (BUK)", "University of Jos (UNIJOS)", "Federal University of Technology, Owerri (FUTO)",
];

const inputCls =
  "w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300 transition-colors bg-slate-50";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "", description: "", url: "",
    contact_name: "", contact_email: "", contact_phone: "",
    cities: [] as string[], campus_tags: [] as string[],
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (key: string, val: unknown) => setForm((p) => ({ ...p, [key]: val }));

  const toggleCity = (city: string) => {
    set("cities", form.cities.includes(city)
      ? form.cities.filter((c) => c !== city)
      : [...form.cities, city]);
  };

  const toggleUni = (u: string) => {
    set("campus_tags", form.campus_tags.includes(u)
      ? form.campus_tags.filter((x) => x !== u)
      : [...form.campus_tags, u]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.cities.length === 0) { setErrorMsg("Select at least one city."); return; }
    setErrorMsg("");
    setStatus("loading");

    const res = await fetch("/api/providers/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) { setStatus("success"); }
    else {
      const data = await res.json() as { error?: string };
      setErrorMsg(data.error ?? "Submission failed. Try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-slate-900 text-xl">Application submitted!</h2>
          <p className="text-slate-500 text-sm">
            The Roomie team will review your listing within 1–2 business days. We&apos;ll email you at <strong>{form.contact_email}</strong> when approved.
          </p>
          <a href="/login" className="block text-sm font-semibold text-brand-600 hover:text-brand-700">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <div className="flex justify-center">
            <Logo size="lg" showWordmark={false} />
          </div>
          <h1 className="font-display font-bold text-slate-900 text-3xl">List your platform</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Reach students who are already matched and ready to find housing. Free to list — we charge nothing from providers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform details */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6 space-y-4">
            <h2 className="font-display font-semibold text-slate-900">Platform details</h2>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Platform name *</label>
              <input required type="text" className={inputCls} placeholder="e.g. UniCrib Abuja"
                value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Website URL *</label>
              <input required type="url" className={inputCls} placeholder="https://your-platform.com"
                value={form.url} onChange={(e) => set("url", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
              <textarea className={`${inputCls} resize-none`} rows={3}
                placeholder="Brief description of your platform and what you offer students…"
                value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>

          {/* Contact details */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6 space-y-4">
            <h2 className="font-display font-semibold text-slate-900">Contact details</h2>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your name *</label>
              <input required type="text" className={inputCls} placeholder="Full name"
                value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email address *</label>
              <input required type="email" className={inputCls} placeholder="you@company.com"
                value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
              <p className="text-xs text-slate-400">You&apos;ll use this to log in once approved.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone number</label>
              <input type="tel" className={inputCls} placeholder="+234 800 000 0000"
                value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
            </div>
          </div>

          {/* Cities covered */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6 space-y-4">
            <div>
              <h2 className="font-display font-semibold text-slate-900">Cities covered *</h2>
              <p className="text-xs text-slate-500 mt-1">Select all cities where you have listings.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {NIGERIAN_CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggleCity(city)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.cities.includes(city)
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Universities */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6 space-y-4">
            <div>
              <h2 className="font-display font-semibold text-slate-900">Universities served</h2>
              <p className="text-xs text-slate-500 mt-1">Optional — select universities near your listings.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {NIGERIAN_UNIVERSITIES.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => toggleUni(u)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.campus_tags.includes(u)
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
                  }`}
                >
                  {u.split("(")[1]?.replace(")", "") ?? u}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 rounded-2xl px-4 py-3">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {status === "loading" ? "Submitting…" : "Submit for review"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already registered?{" "}
            <a href="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</a>
          </p>
        </form>

        <footer className="text-center text-xs text-slate-400 pb-8">
          © 2026 Roomie · A{" "}
          <a href="https://gigsrentals.com" target="_blank" rel="noopener noreferrer" className="hover:underline">GIGSRentals</a>{" "}
          Product
        </footer>
      </div>
    </div>
  );
}
