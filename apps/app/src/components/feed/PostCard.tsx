import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { likePost, unlikePost } from "@repo/db/queries/posts";
import { createClient } from "@repo/db/client";
import { CommentSheet } from "./CommentSheet";
import { ReplyComposerModal } from "./ReplyComposerModal";
import { MentionText, registerUsernameId } from "./MentionText";
import type { Post } from "@repo/db/queries/posts";
import type { User } from "@supabase/supabase-js";

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  currentUserName: string;
  currentUserAvatar: string | null;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function formatBudget(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M` : `₦${(n / 1_000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}/mo`;
  if (max) return `Up to ${fmt(max)}/mo`;
  return `From ${fmt(min!)}/mo`;
}

const REACTIONS = [
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "laughter", emoji: "😂", label: "Haha" },
  { type: "confusion", emoji: "😕", label: "Confused" },
  { type: "applause", emoji: "👏", label: "Applaud" },
  { type: "anger", emoji: "😡", label: "Angry" },
];

export function PostCard({ post, currentUser, currentUserName, currentUserAvatar }: PostCardProps) {
  // Register authors in the mention cache
  if (post.author.username) {
    registerUsernameId(post.author.username, post.author.id);
  }
  if (post.parent_post?.author?.username) {
    registerUsernameId(post.parent_post.author.username, post.parent_post.author.id);
  }

  // Reactions states
  const [reactionsBreakdown, setReactionsBreakdown] = useState<Record<string, number>>(() => {
    return (
      (post.reactions as any) || {
        love: 0,
        laughter: 0,
        confusion: 0,
        applause: 0,
        anger: 0,
      }
    );
  });
  const [reactionsCount, setReactionsCount] = useState(post.likes_count || 0);
  const [myReaction, setMyReaction] = useState<string | null>(() => {
    return post.my_reaction ?? (post.liked_by_me ? "love" : null);
  });
  const [reactionOpen, setReactionOpen] = useState(false);
  const reactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modal / Comment states
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [commentOpen, setCommentOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  
  // Sharing states
  const [copied, setCopied] = useState(false);
  
  const budget = formatBudget(post.budget_min, post.budget_max);
  const isOwnPost = currentUser?.id === post.user_id;

  const handleReact = async (type: string) => {
    if (!currentUser) return;
    setReactionOpen(false);
    const supabase = createClient();
    
    const oldReaction = myReaction;
    if (oldReaction === type) {
      // Remove reaction
      setMyReaction(null);
      setReactionsCount((c) => Math.max(0, c - 1));
      setReactionsBreakdown((prev) => ({
        ...prev,
        [type]: Math.max(0, (prev[type] ?? 0) - 1),
      }));
      await unlikePost(supabase, post.id, currentUser.id);
    } else {
      // Add or update reaction
      setMyReaction(type);
      if (!oldReaction) {
        setReactionsCount((c) => c + 1);
      }
      setReactionsBreakdown((prev) => {
        const next = { ...prev };
        if (oldReaction) {
          next[oldReaction] = Math.max(0, (next[oldReaction] ?? 0) - 1);
        }
        next[type] = (next[type] ?? 0) + 1;
        return next;
      });
      await likePost(supabase, post.id, currentUser.id, type);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/feed/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Roomie post by ${post.author.display_name}`,
          text: post.content,
          url: postUrl,
        });
      } catch (err) {
        console.error("Native share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  // Close reaction drawer on mouse leave after a delay (desktop)
  const handleMouseLeave = () => {
    reactionTimerRef.current = setTimeout(() => {
      setReactionOpen(false);
    }, 400);
  };

  const handleMouseEnter = () => {
    if (reactionTimerRef.current) {
      clearTimeout(reactionTimerRef.current);
    }
  };

  // Safe username tag parser rendering
  const renderPostContent = (contentText: string) => {
    return <MentionText text={contentText} />;
  };

  // Top 3 reactions display formatting
  const activeReactions = Object.entries(reactionsBreakdown)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const activeReactionEmoji = REACTIONS.find((r) => r.type === myReaction)?.emoji || "❤️";
  const activeReactionLabel = REACTIONS.find((r) => r.type === myReaction)?.label || "Like";

  return (
    <>
      <article className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-5 flex flex-col gap-4 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-shadow duration-200 relative">
        {/* Author row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <Link href={`/discover/${post.author.id}`} className="flex-shrink-0">
              <Avatar
                src={post.author.avatar_url}
                name={post.author.display_name}
                size="md"
                className="ring-2 ring-sage-surface"
              />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link href={`/discover/${post.author.id}`}>
                  <span className="font-display font-semibold text-slate-900 text-sm leading-tight hover:text-brand-600 transition-colors">
                    {post.author.display_name}
                  </span>
                </Link>
                {post.author.username && (
                  <span className="text-xs text-slate-400">@{post.author.username}</span>
                )}
                {post.author.student_verified && (
                  <span
                    className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-brand-500 flex-shrink-0"
                    title="Student ID verified by Roomie"
                  >
                    <svg className="w-2 h-2 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {post.author.university && (
                  <span className="text-xs text-slate-400 truncate max-w-[160px]">
                    {post.author.university}
                  </span>
                )}
                {post.author.university && (post.author.city || post.city) && (
                  <span className="text-xs text-slate-300">·</span>
                )}
                {(post.city || post.author.city) && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    📍 {post.city ?? post.author.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link href={`/feed/post/${post.id}`} className="text-xs text-slate-400 flex-shrink-0 mt-0.5 hover:text-brand-600 transition-colors">
            {timeAgo(post.created_at)}
          </Link>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {renderPostContent(post.content)}
          </p>

          {/* Quoted parent post preview (Thread) */}
          {post.parent_post && (
            <Link href={`/feed/post/${post.parent_post.id}`} className="block mt-1">
              <div className="border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50/80 rounded-2xl p-4 flex flex-col gap-2 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                <div className="flex items-center gap-2">
                  <Avatar src={post.parent_post.author?.avatar_url || null} name={post.parent_post.author?.display_name || "User"} size="xs" />
                  <span className="font-semibold text-slate-800 text-xs">{post.parent_post.author?.display_name || "User"}</span>
                  {post.parent_post.author?.username && (
                    <span className="text-xs text-slate-400">@{post.parent_post.author.username}</span>
                  )}
                </div>
                <p className="text-slate-500 text-sm whitespace-pre-wrap line-clamp-3 leading-relaxed">
                  <MentionText text={post.parent_post.content} disableLinks />
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Metadata chips */}
        {(budget || post.move_in_date) && (
          <div className="flex flex-wrap gap-2">
            {budget && (
              <Badge variant="sage" className="text-xs font-semibold">
                {budget}
              </Badge>
            )}
            {post.move_in_date && (
              <Badge variant="brand" className="text-xs">
                Move in {new Date(post.move_in_date).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
              </Badge>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50 relative">
          <div className="flex items-center gap-1.5">
            {/* Reaction Button container */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Emojis reaction popover */}
              {reactionOpen && currentUser && (
                <div className="absolute bottom-11 left-0 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.15)] rounded-2xl px-3 py-2 flex gap-2.5 items-center border border-slate-100 z-30 animate-fade-in duration-100">
                  {REACTIONS.map((r) => (
                    <button
                      key={r.type}
                      onClick={() => void handleReact(r.type)}
                      className="text-xl hover:scale-130 transition-transform active:scale-95 duration-100 cursor-pointer p-1"
                      title={r.label}
                      type="button"
                    >
                      {r.emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => void handleReact(myReaction || "love")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (currentUser) setReactionOpen((v) => !v);
                }}
                disabled={!currentUser}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-medium transition-all ${
                  myReaction
                    ? "text-red-500 bg-red-50/50"
                    : "text-slate-400 hover:text-red-400 hover:bg-red-50/50"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                aria-label={myReaction ? `Reacted ${myReaction}` : "React"}
                type="button"
              >
                <span className="text-base select-none">
                  {myReaction ? activeReactionEmoji : (
                    <svg
                      className="w-4 h-4 inline-block"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </span>
                <span className="hidden sm:inline">
                  {myReaction ? activeReactionLabel : "Like"}
                </span>
              </button>
            </div>

            {/* Click trigger to open reaction drawer on mobile tap */}
            {currentUser && (
              <button
                onClick={() => setReactionOpen((v) => !v)}
                className="p-1 rounded-full text-slate-300 hover:text-slate-500 sm:hidden transition-colors -ml-1.5 mr-0.5"
                title="Reaction options"
                type="button"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* LinkedIn-style reactions summary */}
            {reactionsCount > 0 && (
              <div className="flex items-center gap-1 ml-1 select-none">
                <div className="flex -space-x-1">
                  {activeReactions.map(([type]) => {
                    const rObj = REACTIONS.find((r) => r.type === type);
                    return (
                      <span key={type} className="text-xs filter drop-shadow-sm" title={rObj?.label}>
                        {rObj?.emoji}
                      </span>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-slate-500 tabular-nums">
                  {reactionsCount}
                </span>
              </div>
            )}

            {/* Comment Button */}
            <button
              onClick={() => setCommentOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-medium text-slate-400 hover:text-brand-600 hover:bg-brand-50/50 transition-all"
              aria-label="Comment"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {commentsCount > 0 && <span className="tabular-nums">{commentsCount}</span>}
            </button>

            {/* Thread Reply Button */}
            {currentUser && (
              <button
                onClick={() => setReplyOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-medium text-slate-400 hover:text-brand-600 hover:bg-brand-50/50 transition-all"
                aria-label="Thread Reply"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span className="hidden sm:inline">Thread</span>
              </button>
            )}
          </div>

          {/* Right Action container */}
          <div className="flex items-center gap-2">
            {/* Share Button with copied tooltip popup */}
            <div className="relative">
              {copied && (
                <div className="absolute bottom-9 right-0 bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap animate-fade-in">
                  Link copied!
                </div>
              )}
              <button
                onClick={() => void handleShare()}
                className="flex items-center justify-center p-2 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                aria-label="Share"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
            </div>

            {/* View profile CTA */}
            {!isOwnPost && (
              <Link
                href={`/discover/${post.author.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-all whitespace-nowrap"
              >
                <span className="hidden sm:inline">View profile</span>
                <span className="sm:hidden">Profile</span>
              </Link>
            )}
          </div>
        </div>
      </article>

      {/* Inline Comments Sheet */}
      <CommentSheet
        postId={post.id}
        isOpen={commentOpen}
        onClose={() => setCommentOpen(false)}
        user={currentUser}
        authorName={currentUserName}
        authorAvatar={currentUserAvatar}
        onCountChange={(delta) => setCommentsCount((n) => Math.max(0, n + delta))}
      />

      {/* Reply Modal */}
      {currentUser && (
        <ReplyComposerModal
          parentPost={post}
          isOpen={replyOpen}
          onClose={() => setReplyOpen(false)}
          user={currentUser}
          currentUserAvatar={currentUserAvatar}
          currentUserName={currentUserName}
          onSuccess={() => {
            // Direct user to feed or reload details
            if (window.location.pathname.startsWith("/feed/post/")) {
              window.location.reload();
            }
          }}
        />
      )}
    </>
  );
}
