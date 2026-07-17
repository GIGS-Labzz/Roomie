"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { createClient } from "@repo/db/client";
import { createPost } from "@repo/db/queries/posts";
import { MentionAutocomplete } from "./MentionAutocomplete";
import type { Post } from "@repo/db/queries/posts";
import type { User } from "@supabase/supabase-js";
import { MapPin } from "lucide-react";

interface ReplyComposerModalProps {
  parentPost: Post;
  isOpen: boolean;
  onClose: () => void;
  user: User;
  currentUserAvatar: string | null;
  currentUserName: string;
  onSuccess?: () => void;
}

const MAX_LENGTH = 500;

export function ReplyComposerModal({
  parentPost,
  isOpen,
  onClose,
  user,
  currentUserAvatar,
  currentUserName,
  onSuccess,
}: ReplyComposerModalProps) {
  const parentAuthor = parentPost.author || {
    id: parentPost.user_id,
    display_name: "Anonymous User",
    username: null,
    avatar_url: null,
  };
  const parentUsername = parentAuthor.username || "user";
  const [content, setContent] = useState(`@${parentUsername} `);
  const [city, setCity] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_LENGTH - content.length;
  const canSubmit = content.trim().length > 0 && remaining >= 0 && !isSubmitting;

  useEffect(() => {
    if (isOpen) {
      setContent(`@${parentUsername} `);
      setCity("");
      setShowLocation(false);
      setMentionQuery(null);
      setMentionStartIndex(-1);
      setTimeout(() => {
        const ta = textareaRef.current;
        if (ta) {
          ta.focus();
          ta.setSelectionRange(ta.value.length, ta.value.length);
        }
      }, 100);
    }
  }, [isOpen, parentUsername]);

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartIndex, setMentionStartIndex] = useState<number>(-1);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }

    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, selectionStart);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

    if (match) {
      const query = match[1];
      setMentionQuery(query);
      setMentionStartIndex(selectionStart - query.length - 1);
    } else {
      setMentionQuery(null);
      setMentionStartIndex(-1);
    }
  };

  const handleSelectionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    const val = ta.value;
    const selectionStart = ta.selectionStart;
    const textBeforeCursor = val.slice(0, selectionStart);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

    if (match) {
      const query = match[1];
      setMentionQuery(query);
      setMentionStartIndex(selectionStart - query.length - 1);
    } else {
      setMentionQuery(null);
      setMentionStartIndex(-1);
    }
  };

  const handleSelectMention = (username: string) => {
    if (mentionStartIndex === -1 || !textareaRef.current) return;

    const val = content;
    const selectionStart = textareaRef.current.selectionStart;
    const textBeforeMention = val.slice(0, mentionStartIndex);
    const textAfterMention = val.slice(selectionStart);

    const insertion = `@${username} `;
    const newContent = textBeforeMention + insertion + textAfterMention;

    setContent(newContent);
    setMentionQuery(null);
    setMentionStartIndex(-1);

    setTimeout(() => {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        const cursorPosition = mentionStartIndex + insertion.length;
        ta.setSelectionRange(cursorPosition, cursorPosition);
        ta.style.height = "auto";
        ta.style.height = `${ta.scrollHeight}px`;
      }
    }, 0);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const supabase = createClient();
    const result = await createPost(supabase, user.id, {
      content: content.trim(),
      parent_post_id: parentPost.id,
      city: city.trim() || undefined,
    });
    setIsSubmitting(false);
    if (result) {
      setContent("");
      setCity("");
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-x-0 bottom-0 z-[110] md:inset-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-lg bg-white md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="font-display font-semibold text-slate-900 text-base">Reply thread</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500"
            aria-label="Close reply"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Parent post quote */}
          <div className="flex gap-3 pl-1 relative">
            {/* Thread line */}
            <div className="absolute left-[21px] top-9 bottom-0 w-0.5 bg-slate-100" />
            <div className="flex-shrink-0">
              <Avatar src={parentAuthor.avatar_url} name={parentAuthor.display_name} size="sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-800 text-sm">{parentAuthor.display_name}</span>
                {parentPost.city && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{parentPost.city}</span>
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm mt-1 line-clamp-3 leading-relaxed whitespace-pre-wrap">{parentPost.content}</p>
            </div>
          </div>

          {/* Reply composer field */}
          <div className="flex gap-3 mt-2">
            <div className="flex-shrink-0 mt-1">
              <Avatar src={currentUserAvatar} name={currentUserName} size="sm" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <span className="text-xs text-slate-400 font-medium">Replying to @{parentUsername}</span>
              <div className="relative w-full">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleInput}
                  onSelect={handleSelectionChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Write your reply..."
                  className="w-full resize-none bg-transparent text-slate-800 placeholder:text-slate-400 text-[15px] leading-relaxed outline-none min-h-[100px] max-h-[220px]"
                  maxLength={MAX_LENGTH}
                />
                {mentionQuery !== null && (
                  <MentionAutocomplete
                    userId={user.id}
                    query={mentionQuery}
                    onSelect={handleSelectMention}
                  />
                )}
              </div>

              {showLocation && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-2xl w-full max-w-[240px] transition-all animate-fade-in">
                  <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Tag location (e.g. Lekki, Lagos)"
                    className="bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none w-full font-medium"
                  />
                  {city && (
                    <button
                      onClick={() => setCity("")}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowLocation((v) => !v)}
                    className={`p-2 rounded-xl transition-colors flex items-center justify-center ${
                      showLocation || city
                        ? "bg-brand-50 text-brand-600"
                        : "hover:bg-slate-50 text-slate-400 hover:text-slate-600"
                    }`}
                    title="Add location"
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  <span className={`text-xs font-medium tabular-nums ${
                    remaining < 50 ? remaining < 20 ? "text-red-500" : "text-amber-500" : "text-slate-400"
                  }`}>
                    {remaining}
                  </span>
                </div>

                <Button
                  variant="peach"
                  size="sm"
                  onClick={() => void handleSubmit()}
                  disabled={!canSubmit}
                  className="px-5"
                >
                  {isSubmitting ? "Replying..." : "Reply"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
