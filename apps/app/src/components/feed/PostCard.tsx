"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { likePost, unlikePost } from "@repo/db/queries/posts";
import { createClient } from "@repo/db/client";
import { CommentSheet } from "./CommentSheet";
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

export function PostCard({ post, currentUser, currentUserName, currentUserAvatar }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked_by_me ?? false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [commentOpen, setCommentOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const budget = formatBudget(post.budget_min, post.budget_max);
  const isOwnPost = currentUser?.id === post.user_id;

  const handleLike = async () => {
    if (!currentUser || isLiking) return;
    setIsLiking(true);
    const supabase = createClient();
    if (liked) {
      setLiked(false);
      setLikesCount((n) => Math.max(0, n - 1));
      await unlikePost(supabase, post.id, currentUser.id);
    } else {
      setLiked(true);
      setLikesCount((n) => n + 1);
      await likePost(supabase, post.id, currentUser.id);
    }
    setIsLiking(false);
  };

  return (
    <>
      <article className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-5 flex flex-col gap-4 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-shadow duration-200">
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
                {post.author.student_verified && (
                  <span
                    className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-brand-500 flex-shrink-0"
                    title="Student ID verified by Roomie"
                  >
                    <svg className="w-2 h-2 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                {(post.author.city || post.city) && (
                  <span className="text-xs text-slate-400">
                    {post.city ?? post.author.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{timeAgo(post.created_at)}</span>
        </div>

        {/* Content */}
        <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>

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
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <div className="flex items-center gap-1">
            {/* Like */}
            <button
              onClick={() => void handleLike()}
              disabled={!currentUser}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-medium transition-all ${
                liked
                  ? "text-red-500 bg-red-50"
                  : "text-slate-400 hover:text-red-400 hover:bg-red-50"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>

            {/* Comment */}
            <button
              onClick={() => setCommentOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-medium text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
              aria-label="Comment"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {commentsCount > 0 && <span>{commentsCount}</span>}
            </button>
          </div>

          {/* Connect / View profile CTA */}
          {!isOwnPost && (
            <Link
              href={`/discover/${post.author.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View profile
            </Link>
          )}
        </div>
      </article>

      <CommentSheet
        postId={post.id}
        isOpen={commentOpen}
        onClose={() => setCommentOpen(false)}
        user={currentUser}
        authorName={currentUserName}
        authorAvatar={currentUserAvatar}
        onCountChange={(delta) => setCommentsCount((n) => Math.max(0, n + delta))}
      />
    </>
  );
}
