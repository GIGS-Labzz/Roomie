"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_PROFILES } from "@/lib/mockProfiles";
import { Avatar } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useConnections } from "@/hooks/useConnections";

const YEAR_LABELS: Record<number, string> = {
  1: "100L", 2: "200L", 3: "300L", 4: "400L", 5: "500L", 6: "600L", 7: "Final Year",
};

function formatBudget(min?: number | null, max?: number | null): string {
  const fmt = (n: number) => `₦${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}/mo`;
  if (max) return `Up to ${fmt(max)}/mo`;
  if (min) return `From ${fmt(min)}/mo`;
  return "Flexible";
}

export default function ConnectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getConnectionStatus } = useConnections();

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile = MOCK_PROFILES.find((p) => p.id === params.id);

  // Redirect unauthenticated users
  useEffect(() => {
    if (user === null) return; // still loading
  }, [user]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-sage-surface flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-slate-500">Profile not found.</p>
          <Link href="/discover">
            <Button variant="secondary" size="sm">Back to Discover</Button>
          </Link>
        </div>
      </div>
    );
  }

  const existingStatus = getConnectionStatus(profile.id);
  const isAlreadyConnected = existingStatus === "ACTIVE";
  const isPending = existingStatus === "PENDING_PAYMENT" || existingStatus === "PAID";

  const handleConnect = async () => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }
    setIsConnecting(true);
    setError(null);

    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: profile.id }),
      });

      const data = await res.json() as { connectionId?: string; error?: string; detail?: string };

      if (!res.ok) {
        // In dev, show the actual DB error so it's easy to diagnose
        const msg = data.detail ? `${data.error}: ${data.detail}` : (data.error ?? "Something went wrong.");
        setError(msg);
        return;
      }

      // Store in sessionStorage — never put sensitive IDs in the URL
      if (typeof window !== "undefined") {
        sessionStorage.setItem("roomie_conn_id",   data.connectionId ?? "");
        sessionStorage.setItem("roomie_conn_name",  profile.display_name);
      }
      router.push("/connect/success");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsConnecting(false);
    }
  };

  const tags = (profile.lifestyle_tags ?? []).slice(0, 4);

  return (
    <div className="min-h-screen bg-sage-surface">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-sage-surface/90 backdrop-blur-md border-b border-sage-light/40 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-display font-semibold text-slate-900 text-base">Connect</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Left — Who you're connecting with */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6 flex flex-col gap-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">You&apos;re connecting with</p>

            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <Avatar src={profile.avatar_url} name={profile.display_name} size="xl" className="ring-2 ring-sage-surface" />
                {profile.student_verified && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-500 border-2 border-white flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-semibold text-slate-900 text-xl leading-tight">
                  {profile.display_name}
                  {profile.age ? `, ${profile.age}` : ""}
                </h2>
                {profile.university && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {profile.university}
                    {profile.year_of_study ? ` · ${YEAR_LABELS[profile.year_of_study] ?? ""}` : ""}
                  </p>
                )}
                {profile.city && (
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 1.5A4.5 4.5 0 0 0 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6A4.5 4.5 0 0 0 8 1.5zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                    </svg>
                    {profile.city}
                  </p>
                )}
              </div>
            </div>

            {/* Budget */}
            <div className="flex items-center justify-between py-3 border-t border-b border-slate-100">
              <span className="text-sm text-slate-500">Monthly budget</span>
              <span className="text-sm font-semibold text-slate-800">
                {formatBudget(profile.min_budget, profile.max_budget)}
              </span>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="sage" className="capitalize text-xs">
                    {tag.replace(/-/g, " ")}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Right — What you unlock */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Connecting unlocks</p>

              {[
                {
                  icon: (
                    <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ),
                  title: "Direct chat",
                  description: "Message each other privately, share details, decide if you're a good fit.",
                },
                {
                  icon: (
                    <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  ),
                  title: "Housing referrals",
                  description: "Access curated housing agents and platforms near your campus (₦2,000 one-time).",
                },
                {
                  icon: (
                    <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentWidth={2}">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ),
                  title: "Bill splitting",
                  description: "Track shared expenses like rent, electricity, and groceries — together.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="space-y-3">
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              {isAlreadyConnected ? (
                <Link href="/chat">
                  <Button variant="primary" size="lg" className="w-full">Open chat</Button>
                </Link>
              ) : isPending ? (
                <Button variant="secondary" size="lg" className="w-full" disabled>
                  Connection pending
                </Button>
              ) : (
                <Button
                  variant="peach"
                  size="lg"
                  className="w-full"
                  onClick={handleConnect}
                  isLoading={isConnecting}
                  disabled={isConnecting || !user}
                >
                  {user ? "Connect" : "Sign in to connect"}
                </Button>
              )}

              <p className="text-xs text-center text-slate-400">
                No payment required. Connecting is completely free.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
