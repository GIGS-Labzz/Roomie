import { Avatar } from "@repo/ui/avatar";
import type { Message } from "@repo/db/queries/messages";
import { AgreementCard } from "./AgreementCard";
import { BillSplitChatMessage } from "./BillSplitChatMessage";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  currentUserId?: string;
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

export function MessageBubble({ message, isOwn, currentUserId }: MessageBubbleProps) {
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
    <div className={`flex items-end gap-1.5 mb-0.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
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
        {/* Bubble */}
        <div
          className={`relative px-3 py-2 text-[14.5px] leading-relaxed break-words ${
            isOwn
              ? "bg-brand-500 text-white rounded-2xl rounded-tr-sm"
              : "bg-white text-slate-800 rounded-2xl rounded-tl-sm shadow-sm"
          }`}
          style={{ wordBreak: "break-word" }}
        >
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
              <span className={`inline-block w-12 h-3 ${isOwn ? "" : ""}`} />
            </>
          )}

          {/* Timestamp + ticks overlay — bottom-right inside bubble */}
          <div className={`absolute bottom-1.5 right-2.5 flex items-center gap-0.5 ${isOwn ? "" : ""}`}>
            <span className={`text-[10px] leading-none ${isOwn ? "text-white/70" : "text-slate-400"}`}>
              {formatTime(message.created_at)}
            </span>
            {isOwn && <Ticks read={!!message.read_at} />}
          </div>
        </div>
      </div>
    </div>
  );
}
