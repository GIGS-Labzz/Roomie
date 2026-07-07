"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@repo/db/client";
import { getUserPosts } from "@repo/db/queries/posts";
import type { PostWithLikes } from "@repo/db/queries/posts";
import { getActiveConnections, getConfirmedRoomies } from "@repo/db/queries/connections";
import { Avatar } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomTabNav } from "@repo/ui/bottom-tab-nav";
import { useNotifications } from "@/context/NotificationContext";
import { getProfileHref } from "@/lib/profile-url";

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

type TabType = "posts" | "connects" | "roomies" | "lifestyle";

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

export default function ProfilePage() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const { unreadMessageCount } = useNotifications();

  const [activeTab, setActiveTab] = useState<TabType>("posts");

  // Fetch data states
  const [posts, setPosts] = useState<PostWithLikes[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [connects, setConnects] = useState<any[]>([]);
  const [connectsLoading, setConnectsLoading] = useState(true);
  const [roomies, setRoomies] = useState<any[]>([]);
  const [roomiesLoading, setRoomiesLoading] = useState(true);

  // Post action states
  const [activePostMenuId, setActivePostMenuId] = useState<string | null>(null);
  const [actingPostId, setActingPostId] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShareProfile = async () => {
    if (!profile?.username) {
      alert("Your profile is still being set up. Please try again in a moment.");
      return;
    }

    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/discover/${encodeURIComponent(profile.username)}`;

    if (navigator.share) {
      // Use Web Share API if available
      try {
        await navigator.share({
          title: `Check out ${profile.display_name} on Roomie`,
          text: `I found a potential roommate on Roomie! ${profile.bio ? `"${profile.bio}"` : ""}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.error("Share failed:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
        alert("Profile link:\n\n" + shareUrl);
      }
    }
  };

  const handlePinPost = async (postId: string, isCurrentlyPinned: boolean) => {
    if (!user) return;

    if (!isCurrentlyPinned) {
      // Check if we already have 3 pinned posts
      const pinnedCount = posts.filter((p) => p.is_pinned).length;
      if (pinnedCount >= 3) {
        alert("You can only pin up to 3 posts to your profile.");
        setActivePostMenuId(null);
        return;
      }
    }

    setActingPostId(postId);
    const supabase = createClient();
    try {
      const { error } = await (supabase as any)
        .from("posts")
        .update({ is_pinned: !isCurrentlyPinned })
        .eq("id", postId);

      if (error) throw error;

      // Reload posts
      const postsRes = await getUserPosts(supabase, user.id);
      setPosts(postsRes);
    } catch (err) {
      console.error("Failed to pin/unpin post:", err);
    } finally {
      setActingPostId(null);
      setActivePostMenuId(null);
    }
  };

  const handleArchivePost = async (postId: string) => {
    if (!user) return;
    setActingPostId(postId);
    const supabase = createClient();
    try {
      const { error } = await (supabase as any)
        .from("posts")
        .update({ is_archived: true })
        .eq("id", postId);

      if (error) throw error;

      // Reload posts
      const postsRes = await getUserPosts(supabase, user.id);
      setPosts(postsRes);
    } catch (err) {
      console.error("Failed to archive post:", err);
    } finally {
      setActingPostId(null);
      setActivePostMenuId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this post?")) return;
    setActingPostId(postId);
    const supabase = createClient();
    try {
      const { error } = await (supabase as any)
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      // Reload posts
      const postsRes = await getUserPosts(supabase, user.id);
      setPosts(postsRes);
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setActingPostId(null);
      setActivePostMenuId(null);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      const supabase = createClient();
      try {
        const [postsRes, connectsRes, roomiesRes] = await Promise.all([
          getUserPosts(supabase, user.id),
          getActiveConnections(supabase as any, user.id),
          getConfirmedRoomies(supabase as any, user.id),
        ]);
        setPosts(postsRes);
        setConnects(connectsRes.data ?? []);
        setRoomies(roomiesRes.data ?? []);
      } catch (err) {
        console.error("Error loading profile tab data", err);
      } finally {
        setPostsLoading(false);
        setConnectsLoading(false);
        setRoomiesLoading(false);
      }
    };
    void loadData();
  }, [user?.id]);

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
      badgeCount: unreadMessageCount,
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
  const handle = profile?.username ? `@${profile.username}` : (profile?.display_name ? `@${profile.display_name.toLowerCase().replace(/\s+/g, "")}` : "@user");

  return (
    <div className="min-h-screen bg-sage-surface flex">
      <AppSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top brand header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-2 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors md:hidden"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="font-display font-extrabold text-slate-900 text-lg leading-tight">
              {profile?.display_name || "Profile"}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {posts.length} {posts.length === 1 ? "Post" : "Posts"}
            </p>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto bg-white min-h-screen shadow-sm pb-32">
          
          {/* X-Style Banner & Overlapping Avatar */}
          <div className="relative">
            {/* Cover photo banner */}
            <div 
              className="h-36 sm:h-48 w-full bg-slate-200 bg-cover bg-center"
              style={{ backgroundImage: profile?.cover_url ? `url(${profile.cover_url})` : "none" }}
            />

            {/* Overlapping Avatar */}
            <div className="absolute -bottom-10 sm:-bottom-14 left-4 z-10">
              <Avatar
                src={profile?.avatar_url}
                name={profile?.display_name ?? user?.email ?? ""}
                size="xl"
                className="ring-4 ring-white shadow-sm w-20 h-20 sm:w-28 sm:h-28"
              />
            </div>
          </div>

          {/* Action Row (Edit/Settings Button) */}
          <div className="flex justify-end p-3 h-14 gap-2">
            <Link
              href="/settings"
              className="px-4 py-1.5 border border-slate-300 rounded-full font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            <button
              onClick={handleShareProfile}
              className="px-4 py-1.5 border border-slate-300 rounded-full font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 relative"
              title="Share your profile"
            >
              <Share2 className="w-4 h-4 text-slate-500" />

            </button>
            {showShareToast && (
              <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
                ✓ Profile link copied to clipboard!
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="px-4 space-y-3">
            <div>
              <div className="flex items-center gap-1">
                <h2 className="font-display font-black text-slate-900 text-xl leading-tight">
                  {profile?.display_name || "Your name"}
                </h2>
                {profile?.student_verified && (
                  <span className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center text-white" title="Verified Student">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 font-medium">{handle}</p>
            </div>

            {profile?.bio && (
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed">{profile.bio}</p>
            )}

            {/* Meta Rows (Location, Birthday, University, Join date) */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
              {profile?.university && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{profile.university} {profile.year_of_study ? `· ${YEAR_LABELS[profile.year_of_study]}` : ""}</span>
                </div>
              )}
              {profile?.city && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{profile.city}</span>
                </div>
              )}
              {profile?.birthday && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c0 2.902-2.013 5.454-4.881 5.454H7.881C5.013 21 3 18.448 3 15.546c0-2.902 2.013-5.454 4.881-5.454h8.238C18.987 10.092 21 12.644 21 15.546z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v8m-4-6h8" />
                  </svg>
                  <span>Birthday: {formatBirthday(profile.birthday)}</span>
                </div>
              )}
              {profile?.roommate_gender_pref && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>
                    Roommate: {
                      profile.roommate_gender_pref === "male"
                        ? "Male preferred"
                        : profile.roommate_gender_pref === "female"
                        ? "Female preferred"
                        : "Any gender"
                    }
                    {(profile as any).roommate_pref_public === false ? " (Private)" : ""}
                  </span>
                </div>
              )}
              {profile?.created_at && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatJoinedDate(profile.created_at)}</span>
                </div>
              )}
            </div>

            {/* Social Metrics */}
            <div className="flex items-center gap-4 pt-1 text-sm border-b border-slate-100 pb-3">
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

          {/* Tabs Navigation (X.com Style Underline Tabs) */}
          <div className="flex border-b border-slate-100 bg-white sticky top-14 z-20">
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
                  <p className="text-sm text-slate-400 text-center py-8">You haven&apos;t posted anything yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {posts.map((post) => (
                      <div key={post.id} className="py-4 first:pt-0 last:pb-0 space-y-3 relative group">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-1">
                            {post.is_pinned && (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-brand-500 uppercase tracking-wider mb-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M16 12V4h1v8l2 2v2h-7v6l-1 1-1-1v-6H5v-2l2-2V4h1v8l2 2h6z" />
                                </svg>
                                Pinned to profile
                              </div>
                            )}
                            <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
                          </div>

                          {/* Action Button Dropdown */}
                          <div className="relative flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePostMenuId(activePostMenuId === post.id ? null : post.id);
                              }}
                              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                              aria-label="Post Actions"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                              </svg>
                            </button>

                            {activePostMenuId === post.id && (
                              <>
                                {/* Click outside overlay to close */}
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setActivePostMenuId(null)}
                                />
                                <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl border border-slate-100 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                  <button
                                    onClick={() => handlePinPost(post.id, post.is_pinned)}
                                    disabled={actingPostId !== null}
                                    className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                                  >
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414m-1.422-3.178l-6.2 6.2a2 2 0 11-2.83-2.83l6.2-6.2a2 2 0 112.83 2.83z" />
                                    </svg>
                                    {post.is_pinned ? "Unpin from profile" : "Pin to profile"}
                                  </button>

                                  <button
                                    onClick={() => handleArchivePost(post.id)}
                                    disabled={actingPostId !== null}
                                    className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                                  >
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    Archive / Hide
                                  </button>

                                  <div className="h-px bg-slate-100 my-1" />

                                  <button
                                    onClick={() => handleDeletePost(post.id)}
                                    disabled={actingPostId !== null}
                                    className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left disabled:opacity-50"
                                  >
                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete post
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

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
                      const other = conn.requester_id === user?.id ? conn.receiver : conn.requester;
                      if (!other) return null;
                      return (
                        <Link 
                          href={getProfileHref(other)} 
                          key={conn.id}
                          className="flex items-center gap-3 py-3 hover:bg-slate-50 rounded-2xl px-2 transition-colors"
                        >
                          <Avatar src={other.avatar_url} name={other.display_name} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-900 text-sm">{other.display_name}</span>
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
                      const other = roomie.initiator_id === user?.id ? roomie.acceptor : roomie.initiator;
                      if (!other) return null;
                      return (
                        <Link 
                          href={getProfileHref(other)} 
                          key={roomie.id}
                          className="flex items-center gap-3 py-3 hover:bg-slate-50 rounded-2xl px-2 transition-colors"
                        >
                          <Avatar src={other.avatar_url} name={other.display_name} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-900 text-sm">{other.display_name}</span>
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
                  <InfoRow label="Monthly budget" value={formatBudget(profile?.min_budget, profile?.max_budget)} />
                  <InfoRow label="Move-in date" value={formatDate(profile?.move_in_date)} />
                  <InfoRow label="Roommate preference" value={
                    (profile?.roommate_gender_pref
                      ? profile.roommate_gender_pref.charAt(0).toUpperCase() + profile.roommate_gender_pref.slice(1).replace("_", " ")
                      : "Any") + ((profile as any)?.roommate_pref_public === false ? " (Private)" : "")
                  } />
                </div>

                <div className="border border-slate-100 rounded-2xl p-4 space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">Daily Schedule & Preferences</h4>
                  <InfoRow label="Sleep schedule" value={profile?.sleep_schedule ? SLEEP_LABELS[profile.sleep_schedule] : null} />
                  <InfoRow label="Cleanliness" value={profile?.cleanliness ? CLEAN_LABELS[profile.cleanliness] : null} />
                  <InfoRow label="Noise level" value={profile?.noise_pref ? NOISE_LABELS[profile.noise_pref] : null} />
                  <InfoRow label="Smoking" value={profile?.allows_smoking ? "Smoking OK" : "No smoking"} />
                  <InfoRow label="Pets" value={profile?.allows_pets ? "Pets OK" : "No pets"} />
                  <InfoRow label="Guests" value={profile?.allows_guests ? "Guests welcome" : "No guests"} />
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
        </main>
      </div>

      <BottomTabNav hidden={false} items={navItems} />
    </div>
  );
}
