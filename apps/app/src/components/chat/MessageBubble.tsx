import { useState } from "react";
import { Avatar } from "@repo/ui/avatar";
import type { ExtendedMessage } from "@/hooks/useMessages";
import { AgreementCard } from "./AgreementCard";
import { BillSplitChatMessage } from "./BillSplitChatMessage";

interface MessageBubbleProps {
  message: ExtendedMessage;
  isOwn: boolean;
  currentUserId?: string;
  onRetry?: (messageId: string) => void;
  isStarred?: boolean;
  isPinned?: boolean;
  onStar?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onDeleteForMe?: (messageId: string) => void;
  onDeleteForEveryone?: (messageId: string) => void;
  onShowInfo?: (message: ExtendedMessage) => void;
  disableActions?: boolean;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parsePayload(content: string) {
  try {
    return JSON.parse(content) as Record<string, string | undefined>;
  } catch {
    return {};
  }
}

// Double tick SVG for read receipts (blue when read, gray when delivered)
function Ticks({ read }: { read: boolean }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${read ? "text-blue-400" : "text-white/60"}`} viewBox="0 0 16 11" fill="none">
      <path d="M1 5.5L4.5 9L11 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5.5L8.5 9L15 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="7" />
      <polyline points="8 4 8 8 10 9.5" />
    </svg>
  );
}

export function MessageBubble({
  message,
  isOwn,
  currentUserId,
  onRetry,
  isStarred = false,
  isPinned = false,
  onStar,
  onPin,
  onDeleteForMe,
  onDeleteForEveryone,
  onShowInfo,
  disableActions = false,
}: MessageBubbleProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState<"up" | "down">("down");

  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!showDropdown) {
      const rect = e.currentTarget.getBoundingClientRect();
      const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
      if (rect.top < viewportHeight / 2) {
        setDropdownDirection("down");
      } else {
        setDropdownDirection("up");
      }
    }
    setShowDropdown(!showDropdown);
  };
  // ── Bill split events (created, item paid/unpaid, settled) ─────────────
  if (message.message_type === "bill_split") {
    return (
      <BillSplitChatMessage
        content={message.content}
        connectionId={message.connection_id}
      />
    );
  }

  // ── Agreement card ──────────────────────────────────────────────────────
  if (message.message_type === "agreement_request") {
    const payload = parsePayload(message.content);
    return (
      <AgreementCard
        agreementId={payload.agreement_id ?? ""}
        connectionId={message.connection_id}
        initiatorName={payload.initiator_name ?? message.sender?.display_name ?? "Your connection"}
        isOwn={isOwn}
        isInitiator={message.sender_id === currentUserId}
      />
    );
  }

  // ── System / agreement outcome pills ────────────────────────────────────
  if (
    message.message_type === "agreement_confirmed" ||
    message.message_type === "agreement_declined" ||
    message.message_type === "system"
  ) {
    let text = message.content;
    if (message.message_type === "agreement_confirmed") {
      const p = parsePayload(message.content);
      text = `${p.acceptor_name ?? "Your roommate"} confirmed the agreement. Housing is unlocked.`;
    } else if (message.message_type === "agreement_declined") {
      const p = parsePayload(message.content);
      text = `${p.declined_by_name ?? "Your connection"} declined the agreement.`;
    }

    return (
      <div className="flex justify-center py-1.5">
        <span className="bg-white/80 text-slate-500 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm max-w-[75%] text-center">
          {text}
        </span>
      </div>
    );
  }

  // ── Normal message bubble ─────────────────────────────────────────────────
  return (
    <div className={`flex items-end gap-1.5 mb-1 group relative ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Other user avatar — only on received messages */}
      {!isOwn && (
        <Avatar
          src={message.sender?.avatar_url}
          name={message.sender?.display_name}
          size="xs"
          className="mb-1 flex-shrink-0 self-end"
        />
      )}

      <div className={`flex max-w-[78%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {/* Bubble wrapper with relative positioning to contain dropdown or button */}
        <div className="relative flex items-center gap-1">
          {/* If own message, three-dots is on the left */}
          {isOwn && !disableActions && (
            <button
              onClick={toggleDropdown}
              className="opacity-40 md:opacity-0 md:group-hover:opacity-100 hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded-full transition-opacity cursor-pointer shrink-0"
              title="Message options"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          )}

          <div
            className={`relative px-3 py-2 text-[14.5px] leading-relaxed break-words ${
              isOwn
                ? "bg-brand-500 text-white rounded-2xl rounded-tr-sm"
                : "bg-white text-slate-800 rounded-2xl rounded-tl-sm shadow-sm"
            }`}
            style={{ wordBreak: "break-word" }}
          >
            {/* Show a small pin icon at the top right of the bubble if pinned */}
            {isPinned && (
              <div className={`absolute -top-2.5 ${isOwn ? "right-2" : "left-2"} bg-slate-100 text-slate-500 rounded-full p-0.5 shadow-sm border border-slate-200 z-10`}>
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                </svg>
              </div>
            )}

            {message.image_url ? (
              <img
                src={message.image_url}
                alt="Shared image"
                className="max-h-[280px] max-w-[220px] rounded-xl object-cover"
              />
            ) : (
              <>
                <span>{message.content}</span>
                {/* Inline spacer so timestamp never overlaps text */}
                <span className="inline-block w-14 h-3" />
              </>
            )}

            {/* Timestamp + ticks + star overlay — bottom-right inside bubble */}
            <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1">
              {isStarred && (
                <svg className={`w-3 h-3 ${isOwn ? "text-yellow-200" : "text-yellow-500"}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              )}
              <span className={`text-[10px] leading-none ${isOwn ? "text-white/70" : "text-slate-400"}`}>
                {formatTime(message.created_at)}
              </span>
              {isOwn && (
                message.isSending ? (
                  <ClockIcon className="w-3 h-3 text-white/70" />
                ) : message.isFailed ? (
                  <span className="text-[10px] text-red-200 font-bold leading-none">
                    !
                  </span>
                ) : (
                  <Ticks read={!!message.read_at} />
                )
              )}
            </div>
          </div>

          {/* If received message, three-dots is on the right */}
          {!isOwn && !disableActions && (
            <button
              onClick={toggleDropdown}
              className="opacity-40 md:opacity-0 md:group-hover:opacity-100 hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded-full transition-opacity cursor-pointer shrink-0"
              title="Message options"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          )}

          {/* Click-outside listener backdrop */}
          {showDropdown && (
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          )}

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className={`absolute z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-44 text-slate-700 text-sm ${
                dropdownDirection === "down" ? "top-full mt-1" : "bottom-full mb-1"
              } ${isOwn ? "right-6" : "left-6"}`}
            >
              <button
                onClick={() => {
                  setShowDropdown(false);
                  if (message.content) {
                    navigator.clipboard.writeText(message.content);
                  }
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Content
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onShowInfo?.(message);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Message Info
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onStar?.(message.id);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <svg className={`w-4 h-4 ${isStarred ? "text-yellow-500 fill-yellow-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.243.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {isStarred ? "Unstar Message" : "Star Message"}
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onPin?.(message.id);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <svg className={`w-4 h-4 ${isPinned ? "text-brand-600 fill-brand-600" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {isPinned ? "Unpin Message" : "Pin Message"}
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onDeleteForMe?.(message.id);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-600 flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete for Me
              </button>

              {isOwn && (
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onDeleteForEveryone?.(message.id);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-600 font-medium flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Delete for Everyone
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Retry button for failed own messages */}
      {isOwn && message.isFailed && (
        <button
          onClick={() => onRetry?.(message.id)}
          className="p-1 text-red-500 hover:text-red-600 transition-colors flex-shrink-0 self-center"
          title="Failed to send. Tap to retry."
        >
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6.5M12 9v4l3 3" />
          </svg>
        </button>
      )}
    </div>
  );
}
