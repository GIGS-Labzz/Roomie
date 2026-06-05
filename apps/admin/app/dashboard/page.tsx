"use client";

import { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import { useAdminAuth } from "@/context/AdminAuthContext";

const supabase = createClient();

interface Stats {
  totalClicks: number;
  totalReferrals: number;
  citiesCount: number;
  platformName: string;
  platformUrl: string;
  isActive: boolean;
  recentClicks: { date: string; count: number }[];
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-display font-bold text-slate-900 text-3xl mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { platformId } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!platformId) return;
    const load = async () => {
      setIsLoading(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: platform } = await (supabase as any)
        .from("housing_platforms")
        .select("name, url, status, total_clicks, total_referrals, cities")
        .eq("id", platformId)
        .single();

      // Get last 30 days of clicks
      const since = new Date();
      since.setDate(since.getDate() - 30);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: clicks } = await (supabase as any)
        .from("platform_clicks")
        .select("clicked_at")
        .eq("platform_id", platformId)
        .gte("clicked_at", since.toISOString());

      // Group by day
      const byDay: Record<string, number> = {};
      (clicks ?? []).forEach((c: { clicked_at: string }) => {
        const day = c.clicked_at.slice(0, 10);
        byDay[day] = (byDay[day] ?? 0) + 1;
      });
      const recentClicks = Object.entries(byDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setStats({
        totalClicks: platform?.total_clicks ?? 0,
        totalReferrals: platform?.total_referrals ?? 0,
        citiesCount: (platform?.cities ?? []).length,
        platformName: platform?.name ?? "",
        platformUrl: platform?.url ?? "",
        isActive: platform?.status === "ACTIVE",
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

  const maxClicks = Math.max(...(stats?.recentClicks.map((r) => r.count) ?? [1]), 1);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Page title */}
      <div>
        <h1 className="font-display font-bold text-slate-900 text-2xl">Overview</h1>
        {stats && (
          <p className="text-sm text-slate-500 mt-1">
            {stats.platformName} ·{" "}
            <a href={stats.platformUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
              {stats.platformUrl.replace(/^https?:\/\//, "")}
            </a>
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total clicks" value={stats?.totalClicks ?? 0} sub="All time" />
        <StatCard label="Cities covered" value={stats?.citiesCount ?? 0} />
        <StatCard
          label="Status"
          value={stats?.isActive ? "Active" : "Pending"}
          sub={stats?.isActive ? "Appearing to students" : "Awaiting approval"}
        />
      </div>

      {/* 30-day click chart */}
      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6">
        <h2 className="font-display font-semibold text-slate-900 mb-4">Clicks — last 30 days</h2>
        {stats?.recentClicks.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-slate-400 text-sm">No clicks yet. Clicks appear as students visit your platform from Roomie.</p>
          </div>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {stats?.recentClicks.map((r) => (
              <div key={r.date} className="flex-1 flex flex-col items-center gap-1 group" title={`${r.date}: ${r.count} clicks`}>
                <div
                  className="w-full bg-brand-400 rounded-t-md transition-all group-hover:bg-brand-500"
                  style={{ height: `${Math.round((r.count / maxClicks) * 100)}%`, minHeight: "4px" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-slate-400 pt-4">
        © 2026 Roomie · A{" "}
        <a href="https://gigsrentals.com" target="_blank" rel="noopener noreferrer" className="hover:underline">GIGSRentals</a>{" "}
        Product
      </footer>
    </div>
  );
}
