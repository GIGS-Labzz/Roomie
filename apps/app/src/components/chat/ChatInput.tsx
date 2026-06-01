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
  placeholder = "Message...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isSending || disabled) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
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
    // Auto-grow textarea
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  const canSend = value.trim().length > 0 && !isSending && !disabled;

  return (
    <div className="flex items-end gap-2 bg-white border-t border-slate-100 px-[5%] py-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none bg-sage-surface rounded-2xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-50 max-h-[120px] leading-relaxed"
      />

      <button
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send message"
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
          canSend
            ? "bg-peach-200 hover:bg-peach-300 active:scale-95 shadow-sm"
            : "bg-slate-100 cursor-not-allowed"
        }`}
      >
        {isSending ? (
          <span className="w-4 h-4 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin" />
        ) : (
          <svg
            className={`w-4 h-4 ${canSend ? "text-slate-800" : "text-slate-400"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        )}
      </button>
    </div>
  );
}
