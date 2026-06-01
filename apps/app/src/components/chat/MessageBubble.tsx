import { Avatar } from "@repo/ui/avatar";
import type { Message } from "@repo/db/queries/messages";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  // System messages — centered, muted (used for bill split events)
  if (message.message_type === "system") {
    return (
      <div className="flex justify-center py-1">
        <span className="text-xs text-slate-400 bg-white/60 rounded-full px-3 py-1">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar — only shown for other user's messages */}
      {!isOwn && (
        <Avatar
          src={message.sender?.avatar_url}
          name={message.sender?.display_name}
          size="sm"
          className="flex-shrink-0 mb-1"
        />
      )}

      <div className={`flex flex-col gap-0.5 max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name — only for other user's first message in a group */}
        {!isOwn && message.sender?.display_name && (
          <span className="text-[11px] text-slate-400 px-3">
            {message.sender.display_name}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-3xl text-sm leading-relaxed break-words ${
            isOwn
              ? "bg-brand-500 text-white rounded-br-lg"
              : "bg-white text-slate-800 shadow-sm rounded-bl-lg"
          }`}
        >
          {message.image_url ? (
            <img
              src={message.image_url}
              alt="Shared image"
              className="rounded-2xl max-w-[240px] max-h-[320px] object-cover"
            />
          ) : (
            message.content
          )}
        </div>

        {/* Timestamp + read receipt */}
        <div className={`flex items-center gap-1 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-slate-400">{formatTime(message.created_at)}</span>
          {isOwn && message.read_at && (
            <svg className="w-3 h-3 text-brand-400" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.5 8l4 4L13.5 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 8l4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
