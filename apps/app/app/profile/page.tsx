"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomTabNav } from "@repo/ui/bottom-tab-nav";

const YEAR_LABELS: Record<number, string> = {
  1: "100 Level", 2: "200 Level", 3: "300 Level", 4: "400 Level",
  5: "500 Level", 6: "600 Level", 7: "Final Year",
};

const CLEAN_LABELS: Record<string, string> = {
  very_tidy: "Very tidy", tidy: "Tidy", relaxed: "Relaxed", messy: "Messy",
};
const SLEEP_LABELS: Record<string, string> = {
  early_bird: "Early bird (up by 6am)",
  night_owl: "Night owl (up past midnight)",
  flexible: "Flexible",
};
const NOISE_LABELS: Record<string, string> = {
  very_quiet: "Very quiet", quiet: "Quiet", moderate: "Moderate", lively: "Lively",
};

function formatBudget(min?: number | null, max?: number | null): string {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M` : `₦${(n / 1_000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}/month`;
  if (max) return `Up to ${fmt(max)}/month`;
  if (min) return `From ${fmt(min)}/month`;
  return "Not set";
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Flexible";
  return new Date(dateStr).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}

function VerificationBanner({ status }: { status: string | null | undefined }) {
  if (status === "VERIFIED") return null;
  if (status === "PENDING") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Verification under review</p>
          <p className="text-xs text-amber-600 mt-0.5">We&apos;ll notify you once your student ID is reviewed.</p>
        </div>
      </div>
    );
  }
  return (
    <Link href="/onboarding/verify">
      <div className="bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 flex items-center gap-3 hover:bg-brand-100 transition-colors">
        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-brand-800">Get verified</p>
          <p className="text-xs text-brand-600 mt-0.5">Upload your student ID to earn the Verified badge.</p>
        </div>
        <svg className="w-4 h-4 text-brand-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile, isLoading } = useProfile();

  const navItems = [
    {
      key: "feed", label: "Feed", href: "/feed", isActive: pathname.startsWith("/feed"),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
    },
    {
      key: "discover", label: "Discover", href: "/discover", isActive: pathname.startsWith("/discover"),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>,
    },
    {
      key: "chat", label: "Chat", href: "/chat", isActive: pathname.startsWith("/chat"),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    },
    {
      key: "profile", label: "Profile", href: "/profile", isActive: pathname.startsWith("/profile"),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sage-surface flex">
        <AppSidebar />
        <div className="flex-1 flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
        </div>
        <BottomTabNav hidden={false} items={navItems} />
      </div>
    );
  }

  const tags = profile?.lifestyle_tags ?? [];

  return (
    <div className="min-h-screen bg-sage-surface flex">
      <AppSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-sage-surface/95 backdrop-blur-md border-b border-sage-light/40 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <h1 className="font-display font-bold text-slate-900 text-xl">My Profile</h1>
            <Link
              href="/profile/edit"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-4 pb-32">

          {/* Verification banner */}
          <VerificationBanner status={profile?.verification_status} />

          {/* Hero card */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.display_name ?? user?.email ?? ""}
                  size="xl"
                  className="ring-2 ring-sage-surface"
                />
                {profile?.student_verified && (
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center ring-2 ring-white"
                    title="Verified student"
                  >
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display font-semibold text-slate-900 text-xl leading-tight">
                    {profile?.display_name || "Your name"}
                    {profile?.age ? `, ${profile.age}` : ""}
                  </h2>
                  {profile?.student_verified && (
                    <Badge variant="brand" className="text-xs">Verified</Badge>
                  )}
                </div>
                {profile?.university && (
                  <p className="text-sm text-slate-500 mt-1">
                    {profile.university}
                    {profile.year_of_study
                      ? ` · ${YEAR_LABELS[profile.year_of_study] ?? `Year ${profile.year_of_study}`}`
                      : ""}
                  </p>
                )}
                {profile?.city && (
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16">
                      <path d="M8 1.5A4.5 4.5 0 0 0 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6A4.5 4.5 0 0 0 8 1.5zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="currentColor" />
                    </svg>
                    {profile.city}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Budget & move-in */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6">
            <h3 className="font-display font-semibold text-slate-900 mb-4">Budget & Move-in</h3>
            <InfoRow label="Monthly budget" value={formatBudget(profile?.min_budget, profile?.max_budget)} />
            <InfoRow label="Move-in date" value={formatDate(profile?.move_in_date)} />
            <InfoRow label="Roommate preference" value={
              profile?.roommate_gender_pref
                ? profile.roommate_gender_pref.charAt(0).toUpperCase() + profile.roommate_gender_pref.slice(1).replace("_", " ")
                : "Any"
            } />
          </div>

          {/* Lifestyle */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6">
            <h3 className="font-display font-semibold text-slate-900 mb-4">Lifestyle</h3>
            <InfoRow
              label="Sleep schedule"
              value={profile?.sleep_schedule ? SLEEP_LABELS[profile.sleep_schedule] : null}
            />
            <InfoRow
              label="Cleanliness"
              value={profile?.cleanliness ? CLEAN_LABELS[profile.cleanliness] : null}
            />
            <InfoRow
              label="Noise level"
              value={profile?.noise_pref ? NOISE_LABELS[profile.noise_pref] : null}
            />
            <InfoRow label="Smoking" value={profile?.allows_smoking ? "Smoking OK" : "No smoking"} />
            <InfoRow label="Pets" value={profile?.allows_pets ? "Pets OK" : "No pets"} />
            <InfoRow label="Guests" value={profile?.allows_guests ? "Guests welcome" : "No guests"} />

            {tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="sage" className="capitalize">
                      {tag.replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden">
            <Link
              href="/profile/edit"
              className="flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">Edit profile</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/notifications"
              className="flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">Notifications</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/splits"
              className="flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">Bill splits</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/terms"
              className="flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">Terms of service</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/privacy"
              className="flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">Privacy policy</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              onClick={async () => { await logout(); router.push("/auth/signin"); }}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-50 transition-colors text-left"
            >
              <span className="text-sm font-medium text-red-600">Sign out</span>
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 pb-2">
            © 2026 Roomie · A{" "}
            <a href="https://gigsrentals.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
              GIGSRentals
            </a>{" "}
            Product
          </p>
        </main>
      </div>

      <BottomTabNav hidden={false} items={navItems} />
    </div>
  );
}
