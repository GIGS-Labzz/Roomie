
"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { MOCK_PROFILES } from "@/lib/mockProfiles";
import { ProfileCard } from "@/components/discover/ProfileCard";
import { FilterDrawer } from "@/components/discover/FilterDrawer";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomTabNav } from "@repo/ui/bottom-tab-nav";
import type { DiscoveryFilters } from "@repo/db/queries/profiles";

export default function DiscoverPage() {
  const pathname = usePathname();
  const [filters, setFilters] = useState<DiscoveryFilters>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_PROFILES.filter((p) => {
      if (filters.city?.length && !filters.city.includes(p.city ?? "")) return false;
      if (filters.university?.length && !filters.university.includes(p.university ?? "")) return false;
      if (filters.gender && p.gender !== filters.gender) return false;
      if (filters.minBudget && (p.max_budget ?? 0) < filters.minBudget) return false;
      if (filters.maxBudget && (p.min_budget ?? 0) > filters.maxBudget) return false;
      if (filters.verifiedOnly && !p.student_verified) return false;
      if (filters.tags?.length) {
        const profileTags = p.lifestyle_tags ?? [];
        if (!filters.tags.some((t) => profileTags.includes(t))) return false;
      }
      return true;
    });
  }, [filters]);

  const activeFilterCount = [
    (filters.city?.length ?? 0) > 0,
    !!filters.gender,
    (filters.minBudget ?? 0) > 0 || (filters.maxBudget ?? 0) > 0,
    (filters.tags?.length ?? 0) > 0,
    filters.verifiedOnly,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-sage-surface flex">

      {/* ── Left sidebar (X-style, desktop only) ─────────────────────── */}
      <AppSidebar />

      {/* ── Main content column ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* ── Mobile top bar — Roomie brand ──────────────────────────── */}
        <header className="md:hidden sticky top-0 z-30 bg-sage-surface/95 backdrop-blur-md border-b border-sage-light/40">
          <div className="flex items-center justify-between px-4 py-3">

            {/* Brand mark */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="none">
                  <circle cx="6.5" cy="7" r="3" fill="white" opacity="0.9" />
                  <circle cx="13.5" cy="7" r="3" fill="white" opacity="0.6" />
                  <path d="M6.5 10C4 10 2 12 2 14.5h9C11 12 9 10 6.5 10z" fill="white" opacity="0.9" />
                  <path d="M13.5 10C11 10 9 12 9 14.5h9C18 12 16 10 13.5 10z" fill="white" opacity="0.6" />
                </svg>
              </div>
              <span className="font-display font-bold text-slate-900 text-lg leading-none">Roomie</span>
            </div>

            {/* Filter button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-600 hover:border-brand-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Desktop page title bar */}
        <div className="hidden md:flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h1 className="font-display font-bold text-slate-900 text-2xl leading-tight">Discover</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {filtered.length} roommate{filtered.length !== 1 ? "s" : ""} near you
            </p>
          </div>
        </div>

        {/* Feed */}
        <main className="flex-1 px-4 md:px-6 md:pt-4 pb-28 md:pb-6">

          {/* ── Mobile page heading — "Discover" prominent mid-screen ──── */}
          <div className="md:hidden pt-6 pb-4">
            <h1 className="font-display font-bold text-slate-900 text-3xl leading-tight">
              Discover
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {filtered.length} roommate{filtered.length !== 1 ? "s" : ""} near you
            </p>
          </div>
          {filtered.length === 0 ? (
            <EmptyFeed hasFilters={activeFilterCount > 0} onClearFilters={() => setFilters({})} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
              {filtered.map((p) => (
                <ProfileCard key={p.id} profile={p} connectionStatus={null} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Right sidebar — Filters (desktop only) ────────────────────── */}
      <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-0 h-screen overflow-y-auto py-6 pr-4">
        <FilterDrawer
          isOpen={true}
          onClose={() => {}}
          filters={filters}
          onApply={setFilters}
        />
      </aside>

      {/* ── Mobile filter drawer ──────────────────────────────────────── */}
      <div className="md:hidden">
        <FilterDrawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onApply={(f) => { setFilters(f); setIsFilterOpen(false); }}
        />
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────── */}
      <BottomTabNav
        hidden={isFilterOpen}
        items={[
          {
            key: "feed",
            label: "Feed",
            href: "/feed",
            isActive: pathname.startsWith("/feed"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            ),
          },
          {
            key: "discover",
            label: "Discover",
            href: "/discover",
            isActive: pathname.startsWith("/discover"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
            ),
          },
          {
            key: "chat",
            label: "Chat",
            href: "/chat",
            isActive: pathname.startsWith("/chat"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            ),
          },
          {
            key: "profile",
            label: "Profile",
            href: "/profile",
            isActive: pathname.startsWith("/profile"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
          },
        ]}
      />
    </div>
  );
}

function EmptyFeed({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-24 h-24 rounded-full bg-white border-2 border-dashed border-sage-light flex items-center justify-center">
        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="font-display font-semibold text-slate-700 text-lg">
          {hasFilters ? "No profiles match your filters" : "No profiles yet"}
        </p>
        <p className="text-sm text-slate-400 max-w-xs">
          {hasFilters ? "Try broadening your filters." : "Check back soon."}
        </p>
      </div>
      {hasFilters && (
        <button onClick={onClearFilters} className="text-sm font-semibold text-brand-600 hover:text-brand-700 underline">
          Clear all filters
        </button>
      )}
    </div>
  );
}
