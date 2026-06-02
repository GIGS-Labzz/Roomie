import { Avatar } from "@repo/ui/avatar";
import type { Message } from "@repo/db/queries/messages";
import { AgreementCard } from "./AgreementCard";

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

export function MessageBubble({ message, isOwn, currentUserId }: MessageBubbleProps) {
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

  if (message.message_type === "agreement_confirmed") {
    const payload = parsePayload(message.content);
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
          {payload.acceptor_name ?? "Your roommate"} confirmed the agreement. Housing is unlocked.
        </span>
      </div>
    );
  }

  if (message.message_type === "agreement_declined") {
    const payload = parsePayload(message.content);
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
          {payload.declined_by_name ?? "Your connection"} declined the agreement.
        </span>
      </div>
    );
  }

  if (message.message_type === "system") {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-white/60 px-3 py-1 text-xs text-slate-400">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {!isOwn && (
        <Avatar
          src={message.sender?.avatar_url}
          name={message.sender?.display_name}
          size="sm"
          className="mb-1 flex-shrink-0"
        />
      )}

      <div className={`flex max-w-[72%] flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && message.sender?.display_name && (
          <span className="px-3 text-[11px] text-slate-400">
            {message.sender.display_name}
          </span>
        )}

        <div
          className={`break-words rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${
            isOwn
              ? "rounded-br-lg bg-brand-500 text-white"
              : "rounded-bl-lg bg-white text-slate-800 shadow-sm"
          }`}
        >
          {message.image_url ? (
            <img
              src={message.image_url}
              alt="Shared image"
              className="max-h-[320px] max-w-[240px] rounded-2xl object-cover"
            />
          ) : (
            message.content
          )}
        </div>

        <div className={`flex items-center gap-1 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-slate-400">{formatTime(message.created_at)}</span>
          {isOwn && message.read_at && (
            <svg className="h-3 w-3 text-brand-400" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.5 8l4 4L13.5 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 8l4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
