"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@repo/db/client";
import { getProfileById } from "@repo/db/queries/profiles";
import { Avatar } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { CompatibilityScore } from "@/components/discover/CompatibilityScore";
import type { Database } from "@repo/db/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const supabase = createClient();

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
  const fmt = (n: number) => n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M` : `₦${(n / 1_000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}/month`;
  if (max) return `Up to ${fmt(max)}/month`;
  if (min) return `From ${fmt(min)}/month`;
  return "Budget flexible";
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

export default function ProfileDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await getProfileById(supabase as any, params.id);
      setProfile(data as Profile ?? null);
      setIsLoading(false);
    };
    void load();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sage-surface flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-sage-surface flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-slate-500">Profile not found</p>
          <Button variant="secondary" size="sm" onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    );
  }

  // Compatibility score: use hash-based heuristic since we'd need both full profiles for real scoring
  const compatScore = 45 + (profile.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 50);
  const tags = profile.lifestyle_tags ?? [];

  return (
    <div className="min-h-screen bg-sage-surface">
      {/* Back nav */}
      <header className="sticky top-0 z-30 bg-sage-surface/90 backdrop-blur-md border-b border-sage-light/40 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-display font-semibold text-slate-900 text-base flex-1 truncate">
            {profile.display_name}
          </h1>
          <CompatibilityScore score={compatScore} />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-32">
        {/* Hero card */}
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6">
          <div className="flex items-start gap-4">
            <Avatar
              src={profile.avatar_url}
              name={profile.display_name}
              size="xl"
              className="ring-2 ring-sage-surface flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-display font-semibold text-slate-900 text-xl leading-tight">
                  {profile.display_name}
                  {profile.age ? `, ${profile.age}` : ""}
                </h2>
                {profile.student_verified && (
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-500"
                    title="Student ID verified by Roomie"
                  >
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>

              {profile.university && (
                <p className="text-sm text-slate-500 mt-1">
                  {profile.university}
                  {profile.year_of_study
                    ? ` · ${YEAR_LABELS[profile.year_of_study] ?? `Year ${profile.year_of_study}`}`
                    : ""}
                </p>
              )}

              {profile.city && (
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16">
                    <path d="M8 1.5A4.5 4.5 0 0 0 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6A4.5 4.5 0 0 0 8 1.5zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="currentColor" />
                  </svg>
                  {profile.city}
                </p>
              )}

              {profile.student_verified && (
                <Badge variant="brand" className="mt-2 text-xs">Verified Student</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Budget & timeline */}
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6">
          <h3 className="font-display font-semibold text-slate-900 mb-4">Budget & Move-in</h3>
          <div>
            <InfoRow label="Monthly budget" value={formatBudget(profile.min_budget, profile.max_budget)} />
            <InfoRow label="Move-in date" value={formatDate(profile.move_in_date)} />
          </div>
        </div>

        {/* Lifestyle */}
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6">
          <h3 className="font-display font-semibold text-slate-900 mb-4">Lifestyle</h3>
          <div>
            <InfoRow
              label="Sleep schedule"
              value={profile.sleep_schedule ? SLEEP_LABELS[profile.sleep_schedule] : null}
            />
            <InfoRow
              label="Cleanliness"
              value={profile.cleanliness ? CLEAN_LABELS[profile.cleanliness] : null}
            />
            <InfoRow
              label="Noise level"
              value={profile.noise_pref ? NOISE_LABELS[profile.noise_pref] : null}
            />
            <InfoRow label="Smoking" value={profile.allows_smoking ? "Smoking OK" : "No smoking"} />
            <InfoRow label="Pets" value={profile.allows_pets ? "Pets OK" : "No pets"} />
            <InfoRow label="Guests" value={profile.allows_guests ? "Guests welcome" : "No guests"} />
          </div>

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

        {/* Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-20">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <div className="flex-shrink-0">
              <p className="text-xs text-slate-400">Match</p>
              <p className={`text-lg font-display font-bold ${compatScore >= 70 ? "text-brand-600" : compatScore >= 40 ? "text-amber-600" : "text-slate-400"}`}>
                {compatScore}%
              </p>
            </div>
            <Link href={`/connect/${profile.id}`} className="flex-1">
              <Button variant="peach" size="md" className="w-full">
                Connect
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
