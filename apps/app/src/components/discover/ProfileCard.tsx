"use client";

import Link from "next/link";
import { Avatar } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { CompatibilityScore } from "./CompatibilityScore";
import type { Database } from "@repo/db/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileCardProps {
  profile: Pick<
    Profile,
    | "id" | "display_name" | "avatar_url" | "age" | "gender"
    | "city" | "university" | "year_of_study"
    | "min_budget" | "max_budget"
    | "lifestyle_tags" | "student_verified"
  >;
  compatibilityScore?: number;
  connectionStatus?: "PENDING_PAYMENT" | "PAID" | "ACTIVE" | "DECLINED" | "EXPIRED" | "CANCELLED" | null;
}

const YEAR_LABELS: Record<number, string> = {
  1: "100L", 2: "200L", 3: "300L", 4: "400L", 5: "500L", 6: "600L", 7: "Final Year",
};

function formatBudget(min?: number | null, max?: number | null): string {
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `₦${(n / 1_000_000).toFixed(1)}M`
      : `₦${(n / 1_000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}/mo`;
  if (max) return `Up to ${fmt(max)}/mo`;
  if (min) return `From ${fmt(min)}/mo`;
  return "Budget flexible";
}

export function ProfileCard({ profile, compatibilityScore, connectionStatus }: ProfileCardProps) {
  const tags = (profile.lifestyle_tags ?? []).slice(0, 3);
  const alreadyConnected = connectionStatus === "ACTIVE" || connectionStatus === "PENDING_PAYMENT" || connectionStatus === "PAID";

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-5 flex flex-col gap-4 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-shadow duration-200">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <Link href={`/discover/${profile.id}`} className="flex-shrink-0">
          <Avatar
            src={profile.avatar_url}
            name={profile.display_name}
            size="xl"
            className="ring-2 ring-sage-surface"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={`/discover/${profile.id}`}>
              <h3 className="font-display font-semibold text-slate-900 text-base leading-tight hover:text-brand-600 transition-colors truncate">
                {profile.display_name}
                {profile.age ? `, ${profile.age}` : ""}
              </h3>
            </Link>
            {profile.student_verified && (
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-500"
                title="Student ID verified by Roomie"
              >
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>

          {profile.university && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {profile.university}
              {profile.year_of_study ? ` · ${YEAR_LABELS[profile.year_of_study] ?? `Year ${profile.year_of_study}`}` : ""}
            </p>
          )}

          {profile.city && (
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16">
                <path d="M8 1.5A4.5 4.5 0 0 0 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6A4.5 4.5 0 0 0 8 1.5zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="currentColor" />
              </svg>
              {profile.city}
            </p>
          )}
        </div>
      </div>

      {/* Budget */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800">
          {formatBudget(profile.min_budget, profile.max_budget)}
        </span>
        {compatibilityScore !== undefined && (
          <CompatibilityScore score={compatibilityScore} />
        )}
      </div>

      {/* Lifestyle tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="sage" className="capitalize text-xs">
              {tag.replace(/-/g, " ")}
            </Badge>
          ))}
        </div>
      )}

      {/* CTA */}
      <Link href={alreadyConnected ? `/chat` : `/discover/${profile.id}`} className="mt-auto">
        <Button
          variant={alreadyConnected ? "secondary" : "peach"}
          size="sm"
          className="w-full"
          disabled={connectionStatus === "DECLINED"}
        >
          {alreadyConnected
            ? connectionStatus === "ACTIVE" ? "Open chat" : "Pending payment"
            : connectionStatus === "DECLINED"
            ? "Connection declined"
            : "View profile"}
        </Button>
      </Link>
    </div>
  );
}
