"use client";

import { useState, useRef } from "react";
import { Avatar } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { createClient } from "@repo/db/client";
import { createPost } from "@repo/db/queries/posts";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_LENGTH - content.length;
  const canSubmit = content.trim().length > 0 && remaining >= 0 && !isSubmitting;

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const supabase = createClient();
    const result = await createPost(supabase, user.id, { content: content.trim() });
    setIsSubmitting(false);
    if (result) {
      setContent("");
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
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Looking for a roommate? Tell people what you need..."
          className="w-full resize-none bg-transparent text-slate-800 placeholder:text-slate-400 text-[15px] leading-relaxed outline-none min-h-[60px] max-h-[200px]"
          rows={2}
          maxLength={MAX_LENGTH}
        />

        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium tabular-nums ${
            remaining < 50 ? remaining < 20 ? "text-red-500" : "text-amber-500" : "text-slate-400"
          }`}>
            {remaining}
          </span>

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
