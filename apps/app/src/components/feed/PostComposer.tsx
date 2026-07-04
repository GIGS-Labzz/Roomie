"use client";

import { useState, useRef } from "react";
import { Avatar } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { createClient } from "@repo/db/client";
import { createPost } from "@repo/db/queries/posts";
import { MentionAutocomplete } from "./MentionAutocomplete";
import type { User } from "@supabase/supabase-js";

interface PostComposerProps {
  user: User;
  authorName: string;
  authorAvatar: string | null;
  onPosted: (postId: string) => void;
}

const MAX_LENGTH = 500;

export function PostComposer({ user, authorName, authorAvatar, onPosted }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [city, setCity] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartIndex, setMentionStartIndex] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_LENGTH - content.length;
  const canSubmit = content.trim().length > 0 && remaining >= 0 && !isSubmitting;

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
      city: city.trim() || undefined,
    });
    setIsSubmitting(false);
    if (result) {
      setContent("");
      setCity("");
      setShowLocation(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onPosted(result.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-4 flex gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <Avatar src={authorAvatar} name={authorName} size="md" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="relative w-full">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onSelect={handleSelectionChange}
            onKeyDown={handleKeyDown}
            placeholder="Looking for a roommate? Tell people what you need..."
            className="w-full resize-none bg-transparent text-slate-800 placeholder:text-slate-400 text-[15px] leading-relaxed outline-none min-h-[60px] max-h-[200px]"
            rows={2}
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

        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <div className="flex items-center gap-3">
            {/* Location Toggle */}
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
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
