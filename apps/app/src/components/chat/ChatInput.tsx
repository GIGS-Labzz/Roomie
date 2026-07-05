"use client";

import { useRef, useState } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  onTyping?: () => void;
  isSending?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onTyping,
  isSending = false,
  disabled = false,
  placeholder = "Message…",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onTyping?.();
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <div className="flex items-end gap-2 px-2 py-2">
      {/* Text input pill */}
      <div className="flex-1 flex items-end bg-white rounded-3xl shadow-sm overflow-hidden min-h-[44px]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Connecting…" : placeholder}
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50 max-h-[120px] leading-relaxed"
          style={{ minHeight: "44px" }}
        />
      </div>

      {/* Send / Mic button */}
      <button
        onClick={hasText ? handleSend : undefined}
        disabled={!hasText ? false : disabled}
        aria-label={hasText ? "Send message" : "Voice message"}
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 bg-brand-500 hover:bg-brand-600 active:scale-95 shadow-sm disabled:opacity-50"
      >
        {hasText ? (
          // Send icon
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        ) : (
          // Mic icon (when no text)
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4z" />
          </svg>
        )}
      </button>
    </div>
  );
}
