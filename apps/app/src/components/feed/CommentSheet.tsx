"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@repo/ui/avatar";
import { createClient } from "@repo/db/client";
import { getComments, addComment } from "@repo/db/queries/posts";
import type { PostComment } from "@repo/db/queries/posts";
import type { User } from "@supabase/supabase-js";

interface CommentSheetProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  authorName: string;
  authorAvatar: string | null;
  onCountChange: (delta: number) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function CommentSheet({
  postId, isOpen, onClose, user, authorName, authorAvatar, onCountChange,
}: CommentSheetProps) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    const supabase = createClient();
    getComments(supabase, postId).then((data) => {
      setComments(data);
      setIsLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, postId]);

  const handleSend = async () => {
    if (!user || !text.trim() || isSending) return;
    setIsSending(true);
    const supabase = createClient();
    const comment = await addComment(supabase, postId, user.id, text.trim());
    setIsSending(false);
    if (comment) {
      setComments((prev) => [...prev, comment]);
      setText("");
      onCountChange(1);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:max-w-full bg-white md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[80vh] md:max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-display font-semibold text-slate-900 text-base">Comments</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            aria-label="Close comments"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No comments yet. Be the first!
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="flex-shrink-0">
                  <Avatar
                    src={c.author.avatar_url}
                    name={c.author.display_name}
                    size="sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-slate-900">
                      {c.author.display_name}
                    </span>
                    <span className="text-xs text-slate-400">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {user && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-3">
            <div className="flex-shrink-0">
              <Avatar src={authorAvatar} name={authorName} size="sm" />
            </div>
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment..."
              maxLength={300}
              className="flex-1 bg-sage-surface rounded-2xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-300 transition-shadow"
            />
            <button
              onClick={() => void handleSend()}
              disabled={!text.trim() || isSending}
              className="w-9 h-9 rounded-full bg-brand-500 disabled:opacity-40 flex items-center justify-center text-white hover:bg-brand-600 transition-colors flex-shrink-0"
              aria-label="Send comment"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
