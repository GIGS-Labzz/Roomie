"use client";

import React, { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { createClient } from "@repo/db/client";

const supabase = createClient();

interface PlatformProfile {
  id: string;
  name: string;
  url: string;
  description: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  cities: string[];
}

export default function ProfilePage() {
  const { platformId } = useAdminAuth();
  const [platform, setPlatform] = useState<PlatformProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!platformId) return;

    const loadPlatform = async () => {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("housing_platforms")
        .select("id, name, url, description, contact_name, contact_phone, cities")
        .eq("id", platformId)
        .single();

      if (!error && data) {
        setPlatform(data);
      }
      setLoading(false);
    };

    void loadPlatform();
  }, [platformId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformId || !platform) return;

    setSaving(true);
    setStatusMessage(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("housing_platforms")
      .update({
        name: platform.name,
        url: platform.url,
        description: platform.description,
        contact_name: platform.contact_name,
        contact_phone: platform.contact_phone,
        cities: platform.cities,
      })
      .eq("id", platformId);

    setSaving(false);
    if (error) {
      setStatusMessage("Unable to save changes. Try again.");
    } else {
      setStatusMessage("Changes saved successfully.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!platform) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <h1 className="font-display font-bold text-slate-900 text-2xl">Platform profile</h1>
        <p className="text-sm text-red-600 mt-4">Unable to load platform information.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-slate-900 text-2xl">Platform profile</h1>
      <p className="text-sm text-slate-500 mt-1">Edit your platform's published information.</p>

      <form onSubmit={handleSave} className="mt-6 bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span>Platform name</span>
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-sm"
              value={platform.name}
              onChange={(e) => setPlatform({ ...platform, name: e.target.value })}
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Website URL</span>
            <input
              type="url"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-sm"
              value={platform.url}
              onChange={(e) => setPlatform({ ...platform, url: e.target.value })}
              required
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Description</span>
          <textarea
            className="w-full min-h-[120px] rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-sm resize-none"
            value={platform.description ?? ""}
            onChange={(e) => setPlatform({ ...platform, description: e.target.value })}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span>Contact name</span>
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-sm"
              value={platform.contact_name ?? ""}
              onChange={(e) => setPlatform({ ...platform, contact_name: e.target.value })}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Contact phone</span>
            <input
              type="tel"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-sm"
              value={platform.contact_phone ?? ""}
              onChange={(e) => setPlatform({ ...platform, contact_phone: e.target.value })}
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Cities (comma-separated)</span>
          <input
            type="text"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-sm"
            value={platform.cities.join(", ")}
            onChange={(e) => setPlatform({ ...platform, cities: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
          />
          <p className="text-xs text-slate-400">Use commas to separate city names.</p>
        </label>

        {statusMessage && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{statusMessage}</div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
