"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PostComposer } from "@/components/feed/PostComposer";
import { PostCard } from "@/components/feed/PostCard";
import { BottomTabNav } from "@repo/ui/bottom-tab-nav";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { createClient } from "@repo/db/client";
import { getFeed, getLikedPostIds } from "@repo/db/queries/posts";
import type { Post } from "@repo/db/queries/posts";
import { useNotifications } from "@/context/NotificationContext";

function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-100 rounded-full w-1/3" />
          <div className="h-3 bg-slate-100 rounded-full w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-100 rounded-full w-full" />
        <div className="h-3.5 bg-slate-100 rounded-full w-5/6" />
        <div className="h-3.5 bg-slate-100 rounded-full w-2/3" />
      </div>
    </div>
  );
}

export default function FeedPage() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { unreadCount, unreadMessageCount } = useNotifications();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadPosts = useCallback(async (pageNum: number, replace = false) => {
    const supabase = createClient();
    const data = await getFeed(supabase, pageNum);

    if (data.length < 20) setHasMore(false);

    // Hydrate liked_by_me for authenticated users
    if (user && data.length > 0) {
      const likedIds = await getLikedPostIds(supabase, user.id, data.map((p) => p.id));
      const likedSet = new Set(likedIds);
      data.forEach((p) => { p.liked_by_me = likedSet.has(p.id); });
    }

    setPosts((prev) => replace ? data : [...prev, ...data]);
    setIsLoading(false);
    setIsFetchingMore(false);
  }, [user]);

  // Initial load
  useEffect(() => {
    void loadPosts(0, true);
  }, [loadPosts]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!hasMore) return;
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingMore && !isLoading) {
          setIsFetchingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          void loadPosts(nextPage);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, isLoading, page, loadPosts]);

  const handlePosted = useCallback(() => {
    // Reload from page 0 to show the new post at the top
    setPage(0);
    setHasMore(true);
    setIsLoading(true);
    void loadPosts(0, true);
  }, [loadPosts]);

  const navItems = [
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
      badgeCount: unreadMessageCount,
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
  ];

  return (
    <div className="min-h-screen bg-sage-surface flex">
      {/* Left sidebar */}
      <AppSidebar />

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-sage-surface/95 backdrop-blur-md border-b border-sage-light/40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="none">
                  <circle cx="6.5" cy="7" r="3" fill="white" opacity="0.9" />
                  <circle cx="13.5" cy="7" r="3" fill="white" opacity="0.6" />
                  <path d="M6.5 10C4 10 2 12 2 14.5h9C11 12 9 10 6.5 10z" fill="white" opacity="0.9" />
                  <path d="M13.5 10C11 10 9 12 9 14.5h9C18 12 16 10 13.5 10z" fill="white" opacity="0.6" />
                </svg>
              </div>
              <span className="font-display font-bold text-slate-900 text-lg leading-none">Feed</span>
            </div>

            <Link href="/notifications" className="relative p-1 text-slate-600 hover:text-brand-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-brand-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Desktop title */}
        <div className="hidden md:flex items-center px-6 pt-6 pb-2">
          <div>
            <h1 className="font-display font-bold text-slate-900 text-2xl leading-tight">Feed</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              See what other students are looking for
            </p>
          </div>
        </div>

        {/* Feed content */}
        <main className="flex-1 px-4 md:px-6 md:pt-4 pb-28 md:pb-8 max-w-2xl w-full mx-auto">
          {/* Mobile heading */}
          <div className="md:hidden pt-6 pb-4">
            <h1 className="font-display font-bold text-slate-900 text-3xl leading-tight">Feed</h1>
            <p className="text-sm text-slate-400 mt-1">See what other students are looking for</p>
          </div>

          {/* Composer */}
          {user && (
            <div className="mb-5">
              <PostComposer
                user={user}
                authorName={profile?.display_name ?? user.user_metadata?.full_name ?? "You"}
                authorAvatar={profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null}
                onPosted={handlePosted}
              />
            </div>
          )}

          {/* Posts */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
            ) : posts.length === 0 ? (
              <EmptyFeed />
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={user}
                    currentUserName={profile?.display_name ?? user?.user_metadata?.full_name ?? "You"}
                    currentUserAvatar={profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null}
                  />
                ))}

                {/* Infinite scroll sentinel */}
                {hasMore && (
                  <div ref={loaderRef} className="py-4 flex items-center justify-center">
                    {isFetchingMore && (
                      <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
                    )}
                  </div>
                )}

                {!hasMore && posts.length > 0 && (
                  <p className="text-center text-sm text-slate-400 py-4">
                    You&apos;ve seen all posts
                  </p>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomTabNav items={navItems} hidden={false} />
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-24 h-24 rounded-full bg-white border-2 border-dashed border-sage-light flex items-center justify-center">
        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="font-display font-semibold text-slate-700 text-lg">No posts yet</p>
        <p className="text-sm text-slate-400 max-w-xs">
          Be the first to post — tell people what kind of roommate you&apos;re looking for.
        </p>
      </div>
    </div>
  );
}
