"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Avatar } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { LottieIcon } from "@repo/ui/lottie-icon";
import verifiedBadgeAnimation from "@repo/animations/verified-badge";
import { CompatibilityScore } from "./CompatibilityScore";
import { useAuth } from "@/context/AuthContext";
import { useConnections } from "@/hooks/useConnections";
import { createClient } from "@repo/db/client";
import { getProfileHref } from "@/lib/profile-url";
import type { Database } from "@repo/db/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileCardProps {
  profile: Pick<
    Profile,
    | "id" | "display_name" | "avatar_url" | "gender"
    | "city" | "university" | "year_of_study"
    | "min_budget" | "max_budget"
    | "lifestyle_tags" | "student_verified"
    | "username" | "bio" | "created_at" | "birthday" | "birthday_public"
  >;
  compatibilityScore?: number;
  connectionStatus?: "PENDING_CONNECT" | "PENDING_PAYMENT" | "PAID" | "ACTIVE" | "DECLINED" | "EXPIRED" | "CANCELLED" | null;
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

function formatBirthday(dateStr?: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return `${getOrdinal(day)} ${month}`;
}

export function ProfileCard({ profile, compatibilityScore, connectionStatus }: ProfileCardProps) {
  const { user } = useAuth();
  const { getConnection, mutateConnections } = useConnections();
  const conn = getConnection(profile.id);
  const [connecting, setConnecting] = useState(false);

  const status = conn?.status ?? connectionStatus ?? null;
  const tags = (profile.lifestyle_tags ?? []).slice(0, 3);
  const handle = profile.username ? `@${profile.username}` : `@${profile.display_name.toLowerCase().replace(/\s+/g, "")}`;
  const profileHref = getProfileHref(profile);

  const { data: mutualData } = useSWR(
    user ? `mutual-${profile.id}` : null,
    async () => {
      const res = await fetch(`/api/network/mutual/${profile.id}`);
      if (!res.ok) return { mutuals: [] };
      return res.json() as Promise<{ mutuals: { id: string }[] }>;
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  const mutualCount = mutualData?.mutuals?.length ?? 0;

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || connecting) return;
    setConnecting(true);

    const supabase = createClient();
    try {
      if (conn) {
        // Update existing connection to PENDING_CONNECT status
        const { error: connError } = await (supabase as any)
          .from("connections")
          .update({
            requester_id: user.id,
            receiver_id: profile.id,
            status: "PENDING_CONNECT",
            connected_at: new Date().toISOString(),
          })
          .eq("id", conn.id);

        if (connError) throw connError;
      } else {
        // 1. Create connection in PENDING_CONNECT status
        const { error: connError } = await (supabase as any)
          .from("connections")
          .insert({
            requester_id: user.id,
            receiver_id: profile.id,
            status: "PENDING_CONNECT",
            connected_at: new Date().toISOString(),
          });

        if (connError) throw connError;
      }

      await mutateConnections();
    } catch (err) {
      console.error("Failed to connect:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectBack = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !conn || connecting) return;
    setConnecting(true);

    const supabase = createClient();
    try {
      const { error: connError } = await (supabase as any)
        .from("connections")
        .update({ status: "ACTIVE", connected_at: new Date().toISOString() })
        .eq("id", conn.id);

      if (connError) throw connError;

      await mutateConnections();
    } catch (err) {
      console.error("Failed to connect back:", err);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-5 flex flex-col gap-3.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-shadow duration-200">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <Link href={profileHref} className="flex-shrink-0">
          <Avatar
            src={profile.avatar_url}
            name={profile.display_name}
            size="xl"
            className="ring-2 ring-sage-surface"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={profileHref}>
              <h3 className="font-display font-bold text-slate-900 text-base leading-tight hover:text-brand-600 transition-colors break-words whitespace-normal">
                {profile.display_name}
              </h3>
            </Link>
            {profile.student_verified && (
              <span title="Student ID verified by Roomie">
                <LottieIcon animationData={verifiedBadgeAnimation} size={18} loop={false} />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{handle}</p>
          {mutualCount > 0 && (
            <p className="text-[11px] text-brand-600 font-semibold mt-1">
              Matched with {mutualCount} mutual connection{mutualCount > 1 ? "s" : ""}
            </p>
          )}

          {profile.university && (
            <p className="text-xs text-slate-500 mt-1.5 truncate">
              {profile.university}
              {profile.year_of_study ? ` · ${YEAR_LABELS[profile.year_of_study] ?? `Year ${profile.year_of_study}`}` : ""}
            </p>
          )}

          {profile.city && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.city}
            </p>
          )}

          {profile.created_at && (
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Joined {new Date(profile.created_at).toLocaleString("en-US", { month: "long", year: "numeric" })}
            </p>
          )}

          {profile.birthday_public && profile.birthday && (
            <p className="text-[11px] text-brand-600 font-medium mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c0 2.902-2.013 5.454-4.881 5.454H7.881C5.013 21 3 18.448 3 15.546c0-2.902 2.013-5.454 4.881-5.454h8.238C18.987 10.092 21 12.644 21 15.546z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v8m-4-6h8" />
              </svg>
              Birthday: {formatBirthday(profile.birthday)}
            </p>
          )}
        </div>
      </div>

      {/* Bio section if present */}
      {profile.bio && (
        <p className="text-xs text-slate-600 bg-slate-50 rounded-2xl px-3 py-2 leading-relaxed line-clamp-2">
          {profile.bio}
        </p>
      )}

      {/* Budget & Compatibility */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-50 pt-2">
        <span className="text-xs font-semibold text-slate-700 bg-sage-surface px-2.5 py-1 rounded-full">
          {formatBudget(profile.min_budget, profile.max_budget)}
        </span>
        {compatibilityScore !== undefined && (
          <CompatibilityScore score={compatibilityScore} />
        )}
      </div>

      {/* Lifestyle tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="sage" className="capitalize text-[10px] py-0.5 px-2">
              {tag.replace(/-/g, " ")}
            </Badge>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto pt-1">
        {status === "ACTIVE" ? (
          <Link href="/chat" className="w-full">
            <Button variant="secondary" size="sm" className="w-full rounded-2xl py-2 font-bold text-xs">
              Open chat
            </Button>
          </Link>
        ) : status === "PENDING_CONNECT" || status === "PENDING_PAYMENT" || status === "PAID" ? (
          conn?.receiver_id === user?.id ? (
            <Button
              variant="peach"
              size="sm"
              className="w-full rounded-2xl py-2 font-bold text-xs"
              onClick={handleConnectBack}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Connect Back"}
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="w-full rounded-2xl py-2 font-bold text-xs" disabled>
              Pending Connect
            </Button>
          )
        ) : (
          <Button
            variant="peach"
            size="sm"
            className="w-full rounded-2xl py-2 font-bold text-xs"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>
    </div>
  );
}
