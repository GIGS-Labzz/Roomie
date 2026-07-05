"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@repo/db/client";
import { getProfileById } from "@repo/db/queries/profiles";
import { getUserPosts } from "@repo/db/queries/posts";
import type { PostWithLikes } from "@repo/db/queries/posts";
import { 
  getActiveConnections, 
  getConfirmedRoomies, 
  getExistingConnection 
} from "@repo/db/queries/connections";
import { calculateCompatibility } from "@repo/db/lib/compatibility";
import { Avatar } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { CompatibilityScore } from "@/components/discover/CompatibilityScore";
import { useAuth } from "@/context/AuthContext";
import type { Database } from "@repo/db/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type TabType = "posts" | "connects" | "roomies" | "lifestyle";

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

function formatJoinedDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return `Joined ${date.toLocaleString("en-US", { month: "long", year: "numeric" })}`;
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
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tab Data States
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [posts, setPosts] = useState<PostWithLikes[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [connects, setConnects] = useState<any[]>([]);
  const [connectsLoading, setConnectsLoading] = useState(true);
  const [roomies, setRoomies] = useState<any[]>([]);
  const [roomiesLoading, setRoomiesLoading] = useState(true);

  // Connection status with this user
  const [existingConnection, setExistingConnection] = useState<any | null>(null);
  const [connectStatus, setConnectStatus] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setPostsLoading(true);
      setConnectsLoading(true);
      setRoomiesLoading(true);

      const [profileResult, myResult, postsResult, connectsResult, roomiesResult] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getProfileById(supabase as any, params.id),
        user
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (supabase as any).from("profiles").select("*").eq("id", user.id).single()
          : Promise.resolve({ data: null }),
        getUserPosts(supabase as any, params.id),
        getActiveConnections(supabase as any, params.id),
        getConfirmedRoomies(supabase as any, params.id),
      ]);

      setProfile(profileResult.data as Profile ?? null);
      setMyProfile(myResult.data ?? null);
      setPosts(postsResult);
      setConnects(connectsResult.data ?? []);
      setRoomies(roomiesResult.data ?? []);

      if (user && params.id) {
        const { data: conn } = await getExistingConnection(supabase as any, user.id, params.id);
        setExistingConnection(conn ?? null);
        setConnectStatus(conn?.status ?? null);
      }

      setIsLoading(false);
      setPostsLoading(false);
      setConnectsLoading(false);
      setRoomiesLoading(false);
    };
    void load();
  }, [params.id, user]);

  const handleConnectDetail = async () => {
    if (!user || !profile || connecting) return;
    setConnecting(true);

    try {
      if (existingConnection) {
        // Update existing connection to PENDING_CONNECT status
        const { data: conn, error: connError } = await (supabase as any)
          .from("connections")
          .update({
            requester_id: user.id,
            receiver_id: profile.id,
            status: "PENDING_CONNECT",
            connected_at: new Date().toISOString(),
          })
          .eq("id", existingConnection.id)
          .select()
          .single();

        if (connError) throw connError;

        setConnectStatus("PENDING_CONNECT");
        setExistingConnection(conn);
      } else {
        // 1. Create connection in PENDING_CONNECT status
        const { data: conn, error: connError } = await (supabase as any)
          .from("connections")
          .insert({
            requester_id: user.id,
            receiver_id: profile.id,
            status: "PENDING_CONNECT",
            connected_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (connError) throw connError;

        setConnectStatus("PENDING_CONNECT");
        setExistingConnection(conn);
      }
    } catch (err) {
      console.error("Failed to connect:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectBackDetail = async () => {
    if (!user || !existingConnection || connecting) return;
    setConnecting(true);

    try {
      const { error: connError } = await (supabase as any)
        .from("connections")
        .update({ status: "ACTIVE", connected_at: new Date().toISOString() })
        .eq("id", existingConnection.id);

      if (connError) throw connError;

      setConnectStatus("ACTIVE");
      setExistingConnection((prev: any) => ({ ...prev, status: "ACTIVE" }));
    } catch (err) {
      console.error("Failed to connect back:", err);
    } finally {
      setConnecting(false);
    }
  };

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

  const isRoomieApp = profile.username?.toLowerCase() === "roomie.app" || profile.display_name?.toLowerCase() === "roomie.app";
  const compatScore = myProfile ? calculateCompatibility(myProfile, profile) : 0;
  const tags = profile.lifestyle_tags ?? [];
  const handle = profile.username ? `@${profile.username}` : (profile.display_name ? `@${profile.display_name.toLowerCase().replace(/\s+/g, "")}` : "@user");

  return (
    <div className="min-h-screen bg-sage-surface">
      {/* Back nav & compatibility */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-black text-slate-900 text-base truncate">
              {profile.display_name}
            </h1>
            {!isRoomieApp && (
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{compatScore}% Compatible</p>
            )}
          </div>
          {!isRoomieApp && <CompatibilityScore score={compatScore} />}
        </div>
      </header>

      <div className="max-w-2xl mx-auto bg-white min-h-screen shadow-sm pb-32">
        {/* X-Style Banner & Overlapping Avatar */}
        <div className="relative">
          {/* Cover photo banner */}
          <div 
            className="h-36 sm:h-48 w-full bg-slate-200 bg-cover bg-center"
            style={{ backgroundImage: profile.cover_url ? `url(${profile.cover_url})` : "none" }}
          />

          {/* Overlapping Avatar */}
          <div className="absolute -bottom-10 sm:-bottom-14 left-4 z-10">
            <Avatar
              src={profile.avatar_url}
              name={profile.display_name}
              size="xl"
              className="ring-4 ring-white shadow-sm w-20 h-20 sm:w-28 sm:h-28"
            />
          </div>
        </div>

        {/* Action Row next to avatar (Connect / Message Buttons) */}
        <div className="flex justify-end p-3 h-14 items-center gap-2">
          {connectStatus === "ACTIVE" ? (
            <Link href={`/chat/${existingConnection?.id || ""}`}>
              <Button variant="primary" size="sm" className="rounded-full font-bold px-5">
                Message
              </Button>
            </Link>
          ) : connectStatus === "PENDING_CONNECT" || connectStatus === "PENDING_PAYMENT" || connectStatus === "PAID" ? (
            existingConnection?.receiver_id === user?.id ? (
              <Button
                variant="peach"
                size="sm"
                className="rounded-full font-bold px-5"
                onClick={handleConnectBackDetail}
                disabled={connecting}
              >
                {connecting ? "Connecting..." : "Connect Back"}
              </Button>
            ) : (
              <Button variant="secondary" size="sm" className="rounded-full font-bold px-5" disabled>
                Pending Connect
              </Button>
            )
          ) : (
            <Button
              variant="peach"
              size="sm"
              className="rounded-full font-bold px-5"
              onClick={handleConnectDetail}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Connect"}
            </Button>
          )}
        </div>

        {/* User Details */}
        <div className="px-4 space-y-3">
          <div>
            <div className="flex items-center gap-1">
              <h2 className="font-display font-black text-slate-900 text-xl leading-tight">
                {profile.display_name}
              </h2>
              {profile.student_verified && (
                <span className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center text-white" title="Verified Student">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 font-medium">{handle}</p>
          </div>

          {profile.bio && (
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed">{profile.bio}</p>
          )}

          {/* Meta Info Rows */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
            {profile.university && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{profile.university} {profile.year_of_study ? `· ${YEAR_LABELS[profile.year_of_study]}` : ""}</span>
              </div>
            )}
            {profile.city && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{profile.city}</span>
              </div>
            )}
            {profile.birthday && profile.birthday_public && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c0 2.902-2.013 5.454-4.881 5.454H7.881C5.013 21 3 18.448 3 15.546c0-2.902 2.013-5.454 4.881-5.454h8.238C18.987 10.092 21 12.644 21 15.546z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v8m-4-6h8" />
                </svg>
                <span>Birthday: {formatBirthday(profile.birthday)}</span>
              </div>
            )}
            {profile.created_at && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatJoinedDate(profile.created_at)}</span>
              </div>
            )}
          </div>

          {/* Social Metrics */}
          <div className="flex items-center gap-4 pt-1 border-b border-slate-100 pb-3">
            <button 
              onClick={() => setActiveTab("connects")} 
              className="hover:underline flex items-center gap-1"
            >
              <span className="font-extrabold text-slate-950">{connects.length}</span>
              <span className="text-slate-500">Connects</span>
            </button>
            <button 
              onClick={() => setActiveTab("roomies")} 
              className="hover:underline flex items-center gap-1"
            >
              <span className="font-extrabold text-slate-950">{roomies.length}</span>
              <span className="text-slate-500">Roomies</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-white sticky top-[61px] z-20">
          {(["posts", "connects", "roomies", "lifestyle"] as TabType[]).map((tab) => {
            let label = "";
            let count = 0;
            if (tab === "posts") {
              label = "Posts";
              count = posts.length;
            } else if (tab === "connects") {
              label = "Connects";
              count = connects.length;
            } else if (tab === "roomies") {
              label = "Roomies";
              count = roomies.length;
            } else if (tab === "lifestyle") {
              label = "Lifestyle";
              count = tags.length;
            }

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-3 text-center text-sm font-bold relative transition-colors text-slate-600 hover:bg-slate-50"
              >
                <span className={`capitalize ${activeTab === tab ? "text-slate-950 font-extrabold" : "text-slate-500 font-bold"}`}>
                  {label} <span className="text-xs font-semibold text-slate-400">({count})</span>
                </span>
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="px-4 py-4">
          {/* posts Tab */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {postsLoading ? (
                <div className="py-8 flex justify-center">
                  <span className="w-6 h-6 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No posts yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {posts.map((post) => (
                    <div key={post.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                      <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{new Date(post.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>{post.likes_count}</span>
                        </div>
                      </div>
                      {/* List of people who liked it */}
                      {post.post_likes && post.post_likes.length > 0 && (
                        <div className="bg-slate-50 rounded-2xl px-4 py-2 flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Liked by:</span>
                          <div className="flex items-center -space-x-1.5">
                            {post.post_likes.slice(0, 4).map((like) => (
                              <Avatar
                                key={like.user_id}
                                src={like.profiles?.avatar_url}
                                name={like.profiles?.display_name ?? "User"}
                                size="xs"
                                className="ring-2 ring-white w-4 h-4"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">
                            {post.post_likes.map((l) => l.profiles?.display_name ?? "Someone").join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* connects Tab */}
          {activeTab === "connects" && (
            <div className="space-y-3">
              {connectsLoading ? (
                <div className="py-8 flex justify-center">
                  <span className="w-6 h-6 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
                </div>
              ) : connects.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No active connections yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {connects.map((conn) => {
                    const other = conn.requester_id === profile.id ? conn.receiver : conn.requester;
                    if (!other) return null;
                    const isMe = other.id === user?.id;
                    return (
                      <Link 
                        href={isMe ? "/profile" : `/discover/${other.id}`} 
                        key={conn.id}
                        className="flex items-center gap-3 py-3 hover:bg-slate-50 rounded-2xl px-2 transition-colors"
                      >
                        <Avatar src={other.avatar_url} name={other.display_name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-900 text-sm">
                              {other.display_name} {isMe && "(You)"}
                            </span>
                            {other.student_verified && (
                              <span className="w-3.5 h-3.5 bg-brand-500 rounded-full flex items-center justify-center text-white">
                                <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            )}
                          </div>
                          {other.university && (
                            <p className="text-xs text-slate-500 truncate">{other.university}</p>
                          )}
                          {other.bio && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">{other.bio}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* roomies Tab */}
          {activeTab === "roomies" && (
            <div className="space-y-3">
              {roomiesLoading ? (
                <div className="py-8 flex justify-center">
                  <span className="w-6 h-6 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
                </div>
              ) : roomies.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No confirmed roommates yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {roomies.map((roomie) => {
                    const other = roomie.initiator_id === profile.id ? roomie.acceptor : roomie.initiator;
                    if (!other) return null;
                    const isMe = other.id === user?.id;
                    return (
                      <Link 
                        href={isMe ? "/profile" : `/discover/${other.id}`} 
                        key={roomie.id}
                        className="flex items-center gap-3 py-3 hover:bg-slate-50 rounded-2xl px-2 transition-colors"
                      >
                        <Avatar src={other.avatar_url} name={other.display_name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-900 text-sm">
                              {other.display_name} {isMe && "(You)"}
                            </span>
                            {other.student_verified && (
                              <span className="w-3.5 h-3.5 bg-brand-500 rounded-full flex items-center justify-center text-white">
                                <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            )}
                          </div>
                          {other.university && (
                            <p className="text-xs text-slate-500 truncate">{other.university}</p>
                          )}
                          {other.bio && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">{other.bio}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* lifestyle Tab */}
          {activeTab === "lifestyle" && (
            <div className="space-y-4">
              <div className="border border-slate-100 rounded-2xl p-4 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Budget & Move-in</h4>
                <InfoRow label="Monthly budget" value={formatBudget(profile.min_budget, profile.max_budget)} />
                <InfoRow label="Move-in date" value={formatDate(profile.move_in_date)} />
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Daily Schedule & Preferences</h4>
                <InfoRow label="Sleep schedule" value={profile.sleep_schedule ? SLEEP_LABELS[profile.sleep_schedule] : null} />
                <InfoRow label="Cleanliness" value={profile.cleanliness ? CLEAN_LABELS[profile.cleanliness] : null} />
                <InfoRow label="Noise level" value={profile.noise_pref ? NOISE_LABELS[profile.noise_pref] : null} />
                <InfoRow label="Smoking" value={profile.allows_smoking ? "Smoking OK" : "No smoking"} />
                <InfoRow label="Pets" value={profile.allows_pets ? "Pets OK" : "No pets"} />
                <InfoRow label="Guests" value={profile.allows_guests ? "Guests welcome" : "No guests"} />
              </div>

              {tags.length > 0 && (
                <div className="border border-slate-100 rounded-2xl p-4">
                  <h4 className="font-bold text-slate-900 text-sm mb-3">Lifestyle Tags</h4>
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
          )}
        </div>
      </div>
    </div>
  );
}
