"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@repo/db/client";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Users, Building2, Link2, ShieldCheck, Clock, TrendingUp, Download } from "lucide-react";

const supabase = createClient();

interface Overview {
  totalStudents: number;
  verifiedStudents: number;
  pendingStudents: number;
  totalProviders: number;
  activeProviders: number;
  pendingProviders: number;
  totalConnections: number;
  activeConnections: number;
  totalRevenue: number;
  totalInstalls: number;
  connectionsByDay: { date: string; count: number }[];
  usersByDay: { date: string; count: number }[];
  installsByDay: { date: string; count: number }[];
  recentInstalls: {
    id: string;
    installed_at: string;
    platform: string;
    device_name: string | null;
    browser_name: string | null;
    ip_address: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
  }[];
}
 
const BRAND = "#8AAF6E";
const PEACH = "#e49e45";
const VIOLET = "#8b5cf6";
const MUTED = "#e2e8f0";
 
function StatCard({
  label, value, sub, icon: Icon, color = "brand",
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: "brand" | "peach" | "emerald" | "violet";
}) {
  const styles: Record<string, string> = {
    brand:   "bg-brand-50 text-brand-600",
    peach:   "bg-peach-100 text-peach-700",
    emerald: "bg-emerald-50 text-emerald-600",
    violet:  "bg-violet-50 text-violet-600",
  };
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${styles[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="font-display font-bold text-slate-900 text-2xl mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
 
const fmtDate = (d: string) => {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
};
 
const fmtNaira = (n: number) =>
  n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `₦${(n / 1_000).toFixed(0)}K`
  : `₦${n}`;
 
function formatLocation(inst: { country: string | null; region: string | null; city: string | null }) {
  const parts = [];
  if (inst.city) parts.push(inst.city);
  if (inst.region) parts.push(inst.region);
  if (inst.country) parts.push(inst.country);
  return parts.length > 0 ? parts.join(", ") : "Unknown Location";
}

const tooltipStyle = {
  borderRadius: 12, border: "none",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12,
};
 
export default function SuperHome() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [profilesRes, platformsRes, connectionsRes, installsRes] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("profiles").select("id, verification_status, created_at"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("housing_platforms").select("id, status"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("connections").select("id, status, amount_paid, created_at"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("pwa_installs").select("id, installed_at, platform, device_name, browser_name, ip_address, country, region, city").order("installed_at", { ascending: false }),
      ]);
 
      const profiles: { verification_status: string; created_at: string }[] = profilesRes.data ?? [];
      const platforms: { status: string }[] = platformsRes.data ?? [];
      const connections: { status: string; amount_paid: number; created_at: string }[] = connectionsRes.data ?? [];
      const installs: {
        id: string;
        installed_at: string;
        platform: string;
        device_name: string | null;
        browser_name: string | null;
        ip_address: string | null;
        country: string | null;
        region: string | null;
        city: string | null;
      }[] = installsRes.data ?? [];
 
      // Build last-30-day buckets
      const since = new Date();
      since.setDate(since.getDate() - 29);
      const connByDay: Record<string, number> = {};
      const userByDay: Record<string, number> = {};
      const installByDay: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        connByDay[key] = 0;
        userByDay[key] = 0;
        installByDay[key] = 0;
      }
      connections.forEach((c) => {
        const day = c.created_at?.slice(0, 10);
        if (day && day in connByDay) connByDay[day]++;
      });
      profiles.forEach((p) => {
        const day = p.created_at?.slice(0, 10);
        if (day && day in userByDay) userByDay[day]++;
      });
      installs.forEach((inst) => {
        const day = inst.installed_at?.slice(0, 10);
        if (day && day in installByDay) installByDay[day]++;
      });
 
      setData({
        totalStudents:    profiles.length,
        verifiedStudents: profiles.filter((p) => p.verification_status === "VERIFIED").length,
        pendingStudents:  profiles.filter((p) => ["PENDING", "UNVERIFIED"].includes(p.verification_status)).length,
        totalProviders:   platforms.length,
        activeProviders:  platforms.filter((p) => p.status === "ACTIVE").length,
        pendingProviders: platforms.filter((p) => p.status === "PENDING_REVIEW").length,
        totalConnections: connections.length,
        activeConnections: connections.filter((c) => c.status === "ACTIVE").length,
        totalRevenue: connections
          .filter((c) => c.status === "ACTIVE")
          .reduce((s, c) => s + (c.amount_paid ?? 0), 0),
        totalInstalls:    installs.length,
        connectionsByDay: Object.entries(connByDay).map(([date, count]) => ({ date, count })),
        usersByDay:       Object.entries(userByDay).map(([date, count]) => ({ date, count })),
        installsByDay:    Object.entries(installByDay).map(([date, count]) => ({ date, count })),
        recentInstalls:   installs.slice(0, 10),
      });

      setLoading(false);
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const verificationPie = [
    { name: "Verified",   value: data?.verifiedStudents ?? 0 },
    { name: "Unverified", value: data?.pendingStudents  ?? 0 },
  ];
  const providerPie = [
    { name: "Active",  value: data?.activeProviders  ?? 0 },
    { name: "Pending", value: data?.pendingProviders ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-slate-900 text-2xl">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Platform-wide metrics and traction.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students"        value={data?.totalStudents ?? 0}    icon={Users}       color="brand"
          sub={`${data?.verifiedStudents ?? 0} verified`} />
        <StatCard label="Providers"             value={data?.totalProviders ?? 0}   icon={Building2}   color="peach"
          sub={`${data?.activeProviders ?? 0} active`} />
        <StatCard label="Connections"           value={data?.totalConnections ?? 0} icon={Link2}       color="emerald"
          sub={`${data?.activeConnections ?? 0} active`} />
        <StatCard label="Revenue"               value={fmtNaira(data?.totalRevenue ?? 0)} icon={TrendingUp} color="violet"
          sub="From connection fees" />
        <StatCard label="App Installs"          value={data?.totalInstalls ?? 0}    icon={Download}    color="emerald"
          sub="Total PWA installations" />
        <StatCard label="Pending Verifications" value={data?.pendingStudents ?? 0}  icon={Clock}       color="peach"
          sub="Students awaiting review" />
        <StatCard label="Provider Approvals"    value={data?.pendingProviders ?? 0} icon={ShieldCheck} color="brand"
          sub="Platforms pending review" />
      </div>

      {/* Time-series charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
          <h2 className="font-display font-semibold text-slate-900 text-base">Connections — last 30 days</h2>
          <p className="text-xs text-slate-400 mt-0.5 mb-4">Daily new roommate connections</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data?.connectionsByDay ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="connGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={BRAND} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Date: ${l}`} formatter={(v) => [v, "Connections"]} />
              <Area type="monotone" dataKey="count" stroke={BRAND} strokeWidth={2} fill="url(#connGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
          <h2 className="font-display font-semibold text-slate-900 text-base">Signups — last 30 days</h2>
          <p className="text-xs text-slate-400 mt-0.5 mb-4">Daily new student registrations</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data?.usersByDay ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Date: ${l}`} formatter={(v) => [v, "Signups"]} />
              <Bar dataKey="count" fill={PEACH} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
          <h2 className="font-display font-semibold text-slate-900 text-base">App Installs — last 30 days</h2>
          <p className="text-xs text-slate-400 mt-0.5 mb-4">Daily new PWA installations</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data?.installsByDay ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="installGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={VIOLET} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={VIOLET} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Date: ${l}`} formatter={(v) => [v, "Installs"]} />
              <Area type="monotone" dataKey="count" stroke={VIOLET} strokeWidth={2} fill="url(#installGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
          <h2 className="font-display font-semibold text-slate-900 text-base mb-1">Student Verification</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={verificationPie} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                  <Cell fill={BRAND} />
                  <Cell fill={MUTED} />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: BRAND }} />
                <span className="text-slate-600">Verified <strong className="text-slate-900">{data?.verifiedStudents}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0 bg-slate-200" />
                <span className="text-slate-600">Pending <strong className="text-slate-900">{data?.pendingStudents}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
          <h2 className="font-display font-semibold text-slate-900 text-base mb-1">Provider Status</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={providerPie} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                  <Cell fill={PEACH} />
                  <Cell fill={MUTED} />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: PEACH }} />
                <span className="text-slate-600">Active <strong className="text-slate-900">{data?.activeProviders}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0 bg-slate-200" />
                <span className="text-slate-600">Pending <strong className="text-slate-900">{data?.pendingProviders}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Recent Installs */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
        <h2 className="font-display font-semibold text-slate-900 text-base">Recent Installations</h2>
        <p className="text-xs text-slate-400 mt-0.5 mb-4">Latest devices that installed the PWA</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Device / Model</th>
                <th className="px-4 py-3">Browser</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Installed At</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentInstalls?.map((inst) => (
                <tr key={inst.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-950">{inst.platform}</td>
                  <td className="px-4 py-3 text-slate-700">{inst.device_name || "Unknown Device"}</td>
                  <td className="px-4 py-3 text-slate-600">{inst.browser_name || "Unknown Browser"}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    <div>{formatLocation(inst)}</div>
                    {inst.ip_address && <div className="text-[10px] text-slate-400">{inst.ip_address}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(inst.installed_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!data?.recentInstalls || data.recentInstalls.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No PWA installations recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

