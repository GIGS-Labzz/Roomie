"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PostCard } from "@/components/feed/PostCard";
import { BottomTabNav } from "@repo/ui/bottom-tab-nav";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { createClient } from "@repo/db/client";
import { getPostById, getComments, addComment, getLikedPostIds } from "@repo/db/queries/posts";
import type { Post, PostComment } from "@repo/db/queries/posts";
import { Avatar } from "@repo/ui/avatar";
import { useNotifications } from "@/context/NotificationContext";
import { Search, Sparkles } from "lucide-react";
import { getProfileHref } from "@/lib/profile-url";

function CommentItem({ comment }: { comment: PostComment }) {
  const diff = Date.now() - new Date(comment.created_at).getTime();
  const m = Math.floor(diff / 60000);
  let timeStr = "just now";
  if (m >= 1 && m < 60) timeStr = `${m}m`;
  else if (m >= 60 && m < 1440) timeStr = `${Math.floor(m / 60)}h`;
  else if (m >= 1440) timeStr = `${Math.floor(m / 1440)}d`;

  return (
    <div className="flex gap-3 p-4 bg-white rounded-2xl border border-slate-50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all">
      <Link href={getProfileHref(comment.author)} className="flex-shrink-0">
        <Avatar src={comment.author.avatar_url} name={comment.author.display_name} size="sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Link href={getProfileHref(comment.author)} className="font-semibold text-slate-800 text-sm hover:text-brand-600 transition-colors">
            {comment.author.display_name}
          </Link>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-400">{timeStr}</span>
        </div>
        <p className="text-slate-600 text-[14px] mt-1 whitespace-pre-wrap break-words leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  
  const { user } = useAuth();
  const { profile } = useProfile();
  const { unreadCount, unreadMessageCount } = useNotifications();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [replies, setReplies] = useState<Post[]>([]);
  
  const [commentText, setCommentText] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"replies" | "comments">("replies");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const supabase = createClient();

  const loadPostDetails = useCallback(async () => {
    if (!params.id) return;
    setIsLoading(true);
    
    // Fetch main post
    const postData = await getPostById(supabase, params.id);
    if (!postData) {
      setIsLoading(false);
      return;
    }

    // Hydrate liked status
    if (user) {
      const likedIds = await getLikedPostIds(supabase, user.id, [postData.id]);
      postData.liked_by_me = likedIds.includes(postData.id);
    }
    setPost(postData);
    setIsLoading(false);

    // Fetch replies & comments in parallel
    void loadReplies();
    void loadComments();
  }, [params.id, user]);

  const loadReplies = async () => {
    if (!params.id) return;
    setIsLoadingReplies(true);
    const AUTHOR_SELECT = `
      id,
      user_id,
      parent_post_id,
      content,
      city,
      budget_min,
      budget_max,
      move_in_date,
      likes_count,
      comments_count,
      reactions,
      created_at,
      is_archived,
      is_pinned,
      author:profiles!posts_user_id_fkey (
        id, display_name, username, avatar_url, university, city, student_verified
      ),
      parent_post:parent_post_id (
        id,
        content,
        created_at,
        author:profiles!posts_user_id_fkey (
          id, display_name, username, avatar_url
        )
      )
    `;
    const { data, error } = await supabase
      .from("posts")
      .select(AUTHOR_SELECT)
      .eq("parent_post_id", params.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: true });

    if (!error && data) {
      const formatted = data as Post[];
      if (user && formatted.length > 0) {
        const likedIds = await getLikedPostIds(supabase, user.id, formatted.map((p) => p.id));
        const likedSet = new Set(likedIds);
        formatted.forEach((p) => { p.liked_by_me = likedSet.has(p.id); });
      }
      setReplies(formatted);
    }
    setIsLoadingReplies(false);
  };

  const loadComments = async () => {
    if (!params.id) return;
    setIsLoadingComments(true);
    const commentData = await getComments(supabase, params.id);
    setComments(commentData);
    setIsLoadingComments(false);
  };

  useEffect(() => {
    void loadPostDetails();
  }, [loadPostDetails]);

  const handleSendComment = async () => {
    if (!user || !commentText.trim() || isSendingComment || !post) return;
    setIsSendingComment(true);
    const comment = await addComment(supabase, post.id, user.id, commentText.trim());
    setIsSendingComment(false);
    if (comment) {
      setComments((prev) => [...prev, comment]);
      setCommentText("");
      setPost((prev) => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
    }
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendComment();
    }
  };

  const navItems = [
    {
      key: "feed",
      label: "Feed",
      href: "/feed",
      isActive: true,
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
      isActive: false,
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
      isActive: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      badge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
    },
    {
      key: "notifications",
      label: "Notifications",
      href: "/notifications",
      isActive: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      key: "profile",
      label: "Profile",
      href: "/profile",
      isActive: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar on desktop */}
      <AppSidebar />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-8 md:pl-64">
        <div className="max-w-[640px] mx-auto px-4 py-6 flex flex-col gap-6">
          {/* Header Row */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) router.back();
                else router.replace("/feed");
              }}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
              aria-label="Back"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="font-display font-bold text-slate-800 text-lg">Post details</h1>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-6 flex flex-col gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded-full w-1/3" />
                  <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                </div>
              </div>
              <div className="space-y-2 mt-2">
                <div className="h-4 bg-slate-100 rounded-full w-full" />
                <div className="h-4 bg-slate-100 rounded-full w-5/6" />
                <div className="h-4 bg-slate-100 rounded-full w-2/3" />
              </div>
            </div>
          ) : !post ? (
            <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.07)] text-center flex flex-col items-center gap-4">
              <Search className="w-10 h-10 text-slate-400" />
              <h2 className="font-display font-bold text-slate-800 text-lg">Post not found</h2>
              <p className="text-slate-400 text-sm max-w-xs">The post you are trying to view doesn't exist or has been removed.</p>
              <Link href="/feed" className="px-6 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all">
                Go back to feed
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* The Post Card */}
              <PostCard
                post={post}
                currentUser={user}
                currentUserName={profile?.display_name || user?.email || ""}
                currentUserAvatar={profile?.avatar_url || null}
              />

              {/* Guest Access Call-to-action Banner */}
              {!user && (
                <div className="bg-gradient-to-tr from-brand-50 to-peach-50 border border-brand-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-center flex flex-col items-center gap-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-brand-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-800 text-base">Join the conversation on Roomie</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm">
                      Sign in to connect with roommates, reply to posts, leave comments, and search verified student housing.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={`/auth/login?redirectTo=${encodeURIComponent(pathname)}`}
                      className="px-6 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="px-6 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}

              {/* Thread & Comments section */}
              <div className="flex flex-col gap-4">
                {/* Tabs */}
                <div className="flex border-b border-slate-200/60 pb-px gap-6">
                  <button
                    onClick={() => setActiveTab("replies")}
                    className={`font-display font-bold text-sm pb-3 relative transition-colors ${
                      activeTab === "replies" ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Thread replies ({replies.length})
                    {activeTab === "replies" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={`font-display font-bold text-sm pb-3 relative transition-colors ${
                      activeTab === "comments" ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Comments ({comments.length})
                    {activeTab === "comments" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                    )}
                  </button>
                </div>

                {/* Tab content */}
                {activeTab === "replies" ? (
                  <div className="flex flex-col gap-4 mt-2">
                    {isLoadingReplies ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
                      </div>
                    ) : replies.length === 0 ? (
                      <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm">
                        No replies yet. Be the first to start a thread!
                      </div>
                    ) : (
                      replies.map((reply) => (
                        <PostCard
                          key={reply.id}
                          post={reply}
                          currentUser={user}
                          currentUserName={profile?.display_name || user?.email || ""}
                          currentUserAvatar={profile?.avatar_url || null}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 mt-2">
                    {/* Write Comment Form */}
                    {user && (
                      <div className="bg-white rounded-3xl border border-slate-100 p-4 flex gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] focus-within:ring-2 focus-within:ring-brand-100 transition-all">
                        <div className="flex-shrink-0">
                          <Avatar
                            src={profile?.avatar_url || null}
                            name={profile?.display_name || ""}
                            size="sm"
                          />
                        </div>
                        <div className="flex-1 flex gap-3 items-center">
                          <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={handleCommentKeyDown}
                            placeholder="Write a comment..."
                            maxLength={300}
                            className="flex-1 bg-slate-50 border-0 outline-none rounded-2xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400"
                          />
                          <button
                            onClick={() => void handleSendComment()}
                            disabled={!commentText.trim() || isSendingComment}
                            className="w-9 h-9 rounded-full bg-brand-500 text-white disabled:opacity-40 hover:bg-brand-600 flex items-center justify-center flex-shrink-0 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {isLoadingComments ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm">
                        No comments yet. Write a comment to join!
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {comments.map((comment) => (
                          <CommentItem key={comment.id} comment={comment} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav on mobile */}
      <BottomTabNav items={navItems} hidden={false} />
    </div>
  );
}
