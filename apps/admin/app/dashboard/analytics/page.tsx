"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import { useAdminAuth } from "@/context/AdminAuthContext";

const supabase = createClient();

interface ClickPoint {
  date: string;
  count: number;
}

interface Stats {
  platformName: string;
  platformUrl: string;
  totalClicks: number;
  totalReferrals: number;
  citiesCount: number;
  isActive: boolean;
  recentClicks: ClickPoint[];
}

export default function AnalyticsPage() {
  const { platformId } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!platformId) return;

    const load = async () => {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: platform, error: platformError } = await (supabase as any)
        .from("housing_platforms")
        .select("name, url, status, total_clicks, total_referrals, cities")
        .eq("id", platformId)
        .single();

      if (platformError || !platform) {
        setStats(null);
        setIsLoading(false);
        return;
      }

      const since = new Date();
      since.setDate(since.getDate() - 30);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: clicks } = await (supabase as any)
        .from("platform_clicks")
        .select("clicked_at")
        .eq("platform_id", platformId)
        .gte("clicked_at", since.toISOString());

      const byDay: Record<string, number> = {};
      (clicks ?? []).forEach((c: { clicked_at: string }) => {
        const day = c.clicked_at.slice(0, 10);
        byDay[day] = (byDay[day] ?? 0) + 1;
      });

      const recentClicks = Array.from({ length: 30 }).map((_, index) => {
        const date = new Date(since);
        date.setDate(since.getDate() + index + 1);
        const iso = date.toISOString().slice(0, 10);
        return { date: iso, count: byDay[iso] ?? 0 };
      });

      setStats({
        platformName: platform.name,
        platformUrl: platform.url,
        totalClicks: platform.total_clicks ?? 0,
        totalReferrals: platform.total_referrals ?? 0,
        citiesCount: (platform.cities ?? []).length,
        isActive: platform.status === "ACTIVE",
        recentClicks,
      });
      setIsLoading(false);
    };

    void load();
  }, [platformId]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="font-display font-bold text-slate-900 text-2xl">Analytics</h1>
        <p className="text-sm text-red-600 mt-4">Unable to load analytics. Please refresh or contact support.</p>
      </div>
    );
  }

  const maxClicks = Math.max(...stats.recentClicks.map((r) => r.count), 1);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-slate-900 text-2xl">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          {stats.platformName} ·{' '}
          <a href={stats.platformUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
            {stats.platformUrl.replace(/^https?:\/\//, '')}
          </a>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6">
          <p className="text-sm text-slate-500">Total clicks</p>
          <p className="font-display font-bold text-slate-900 text-3xl mt-3">{stats.totalClicks}</p>
          <p className="text-xs text-slate-400 mt-2">Clicks from Roomie referrals.</p>
        </div>
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6">
          <p className="text-sm text-slate-500">Referrals</p>
          <p className="font-display font-bold text-slate-900 text-3xl mt-3">{stats.totalReferrals}</p>
          <p className="text-xs text-slate-400 mt-2">Users referred to your platform.</p>
        </div>
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6">
          <p className="text-sm text-slate-500">Cities covered</p>
          <p className="font-display font-bold text-slate-900 text-3xl mt-3">{stats.citiesCount}</p>
          <p className="text-xs text-slate-400 mt-2">Active city markets for your platform.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-slate-900">Last 30 days</h2>
            <p className="text-sm text-slate-500">Daily Roomie clicks for your platform.</p>
          </div>
        </div>

        <div className="flex items-end gap-2 h-48">
          {stats.recentClicks.map((point) => (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-2xl bg-brand-500 transition-colors hover:bg-brand-600"
                style={{ height: `${Math.max(8, Math.round((point.count / maxClicks) * 100))}%` }}
                title={`${point.date}: ${point.count} clicks`}
              />
              <span className="text-[10px] text-slate-400">{point.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
