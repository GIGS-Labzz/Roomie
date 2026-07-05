"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useMessages, useTypingPresence } from "@/hooks/useMessages";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BillSplitPinnedBanner } from "@/components/splits/BillSplitPinnedBanner";
import { Avatar } from "@repo/ui/avatar";
import { createClient } from "@repo/db/client";
import { getConnectionById } from "@repo/db/queries/connections";

const supabase = createClient();

// ── Date separator helpers ─────────────────────────────────────────────────

function getDateLabel(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "short" });
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

// ──────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OtherUser = { id: string; display_name: string; username: string | null; avatar_url: string | null; university: string | null; city: string | null; student_verified: boolean | null };

export default function ChatThreadPage() {
  const params = useParams<{ connectionId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const connectionId = params.connectionId;

  const { messages, isLoading, isSending, sendMessage, retryMessage } = useMessages(connectionId);
  const { isOtherTyping, setTyping } = useTypingPresence(connectionId, user?.id ?? "");

  const [other, setOther] = useState<OtherUser | null>(null);
  const [agreementStatus, setAgreementStatus] = useState<"NONE" | "PENDING" | "CONFIRMED" | "DECLINED">("NONE");
  const [isProposingAgreement, setIsProposingAgreement] = useState(false);
  const [agreementError, setAgreementError] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [agreementLoadError, setAgreementLoadError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const isSupport =
    other?.id === "a99928a0-8de7-4da0-871a-22077d13945d" ||
    other?.display_name?.toLowerCase() === "roomie.app" ||
    other?.username?.toLowerCase() === "fav_roomiee";

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  // Load connection (with profile join) to get other user's info
  useEffect(() => {
    if (!connectionId || !user) return;
    const load = async () => {
      setConnectionError(null);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: conn, error: fetchError } = await getConnectionById(supabase as any, connectionId);
        if (fetchError) throw fetchError;
        if (!conn) {
          throw new Error("Connection not found");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const connAny = conn as any;
        const otherUser = conn.requester_id === user.id ? connAny.receiver : connAny.requester;
        setOther(otherUser ?? null);
      } catch (err) {
        console.error("Failed to load connection:", err);
        setConnectionError(err instanceof Error ? err.message : "Failed to load connection details");
      }
    };
    void load();
  }, [connectionId, user]);

  // Load agreement status
  useEffect(() => {
    if (!connectionId || !user) return;
    const load = async () => {
      setAgreementLoadError(null);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("roommate_agreements")
          .select("status")
          .eq("connection_id", connectionId)
          .maybeSingle();
        if (error) throw error;
        setAgreementStatus(data?.status ?? "NONE");
      } catch (err) {
        console.error("Failed to roommate agreement status:", err);
        setAgreementLoadError(err instanceof Error ? err.message : "Failed to load agreement status");
      }
    };
    void load();
  }, [connectionId, user]);

  const proposeAgreement = async () => {
    if (isProposingAgreement || agreementStatus === "PENDING" || agreementStatus === "CONFIRMED") return;
    setIsProposingAgreement(true);
    setAgreementError("");
    try {
      const res = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not propose agreement");
      setAgreementStatus("PENDING");
    } catch (err) {
      setAgreementError(err instanceof Error ? err.message : "Could not propose agreement");
    } finally {
      setIsProposingAgreement(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-sage-surface">
      {/* Desktop sidebar */}
      <AppSidebar />

      <div className="flex-1 flex justify-center min-w-0">
        <div className="flex flex-col w-full max-w-3xl h-full min-h-0">

          {/* ── Header (WhatsApp-style: brand green background) ── */}
          <header className="flex-shrink-0 bg-brand-500 px-3 py-2.5 flex items-center gap-2 shadow-md">

            {/* Back */}
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Profile section — tapping goes to profile */}
            {other ? (
              <Link
                href={`/discover/${other.id}`}
                className="flex items-center gap-2.5 flex-1 min-w-0 group"
              >
                <div className="relative flex-shrink-0">
                  <Avatar src={other.avatar_url} name={other.display_name} size="sm" className="ring-2 ring-white/30" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-300 rounded-full border-2 border-brand-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-[15px] truncate leading-tight group-hover:underline">
                    {other.display_name}
                    {other.student_verified && (
                      <svg className="inline w-3.5 h-3.5 ml-1 text-white/80" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </p>
                  <p className="text-white/70 text-xs truncate leading-tight">
                    {other.university ?? other.city ?? "Tap to view profile"}
                  </p>
                </div>
              </Link>
            ) : connectionError ? (
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  !
                </div>
                <div>
                  <p className="font-semibold text-white text-[15px] leading-tight">Error Loading User</p>
                  <p className="text-red-200 text-xs truncate leading-tight">Please refresh the page</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-white/20 animate-pulse flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-white/20 rounded-full w-28 animate-pulse" />
                  <div className="h-2.5 bg-white/15 rounded-full w-20 animate-pulse" />
                </div>
              </div>
            )}

            {/* Bill splits shortcut */}
            {!isSupport && (
              <Link
                href={`/splits/${connectionId}`}
                className="flex-shrink-0 p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors"
                title="Bill splits"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </Link>
            )}

            {/* Housing shortcut */}
            {!isSupport && (
              <Link
                href="/housing"
                className="flex-shrink-0 p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors"
                title="Find housing"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
            )}
          </header>

          {/* Warning Banner */}
          <div className="bg-red-600 text-white px-4 py-2 text-center text-xs font-medium shadow-sm flex-shrink-0 leading-snug">
            <div>Please wait for Chat to be sent before exiting, Might take long (10 secs Max)</div>
            <div className="opacity-90 mt-0.5">Technical fixes in progress</div>
          </div>

          {/* ── Pinned bill split reminder ── */}
          {!isSupport && user && (
            <BillSplitPinnedBanner connectionId={connectionId} currentUserId={user.id} />
          )}

          {/* ── Messages (warm wallpaper background) ── */}
          <div
            className="flex-1 min-h-0 overflow-y-auto py-3 px-3 md:px-4 space-y-1"
            style={{ background: "#EDE8C8" }}
          >
            {connectionError ? (
              <div className="flex flex-col items-center justify-center min-h-[60%] text-center gap-3 py-12 px-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
                  <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 text-sm">Failed to load connection</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    {connectionError}. Please check your connection or try again.
                  </p>
                </div>
                <button
                  onClick={() => router.refresh()}
                  className="mt-2 px-4 py-2 bg-brand-500 text-white text-xs font-semibold rounded-xl hover:bg-brand-600 transition-colors"
                >
                  Retry Load
                </button>
              </div>
            ) : isLoading ? (
              <MessageSkeletons />
            ) : messages.length === 0 ? (
              <EmptyThread name={other?.display_name} />
            ) : (
              <>
                {messages.map((msg, idx) => {
                  const showDateSep =
                    idx === 0 || !isSameDay(messages[idx - 1].created_at, msg.created_at);

                  return (
                    <div key={msg.id}>
                      {showDateSep && (
                        <div className="flex justify-center py-2">
                          <span className="bg-white/80 text-slate-500 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                            {getDateLabel(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <MessageBubble
                        message={msg}
                        isOwn={msg.sender_id === user.id}
                        currentUserId={user.id}
                        onRetry={retryMessage}
                      />
                    </div>
                  );
                })}
              </>
            )}

            {isOtherTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-white/50 flex-shrink-0" />
                <TypingIndicator />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Footer: agreement banner + input ── */}
          <div className="flex-shrink-0 bg-[#F0F0F0]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
            {/* Agreement load error if any */}
            {agreementLoadError && (
              <div className="bg-red-50 border-t border-red-200 px-4 py-2 text-center text-xs font-semibold text-red-700 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Failed to load roommate agreement status: {agreementLoadError}
              </div>
            )}

            {/* Agreement propose banner */}
            {!isSupport && agreementStatus !== "PENDING" && agreementStatus !== "CONFIRMED" && (
              <div className="bg-white border-t border-slate-200 px-4 py-2">
                <button
                  type="button"
                  onClick={proposeAgreement}
                  disabled={isProposingAgreement || !other}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isProposingAgreement ? "Proposing…" : "Propose roommate agreement"}
                </button>
                {agreementError && (
                  <p className="mt-1 text-center text-xs text-red-500">{agreementError}</p>
                )}
              </div>
            )}

            {!isSupport && agreementStatus === "CONFIRMED" && (
              <div className="bg-brand-50 border-t border-brand-100 px-4 py-2 text-center text-xs font-semibold text-brand-700 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Agreement confirmed — housing providers unlocked
              </div>
            )}

            <ChatInput
              onSend={async (content) => {
                await setTyping(false);
                await sendMessage(content);
              }}
              onTyping={() => void setTyping(true)}
              isSending={isSending}
              disabled={!other}
              placeholder={other ? `Message ${other.display_name}…` : "Message…"}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

function EmptyThread({ name }: { name?: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60%] text-center gap-3 py-12">
      <div className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center shadow-sm">
        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-slate-700 text-sm">Say hello!</p>
        <p className="text-xs text-slate-500 mt-1">
          Start the conversation with {name ?? "your new roommate"}.
        </p>
      </div>
    </div>
  );
}

function MessageSkeletons() {
  return (
    <div className="space-y-3 px-1">
      {[false, true, false, false, true].map((own, i) => (
        <div key={i} className={`flex items-end gap-2 ${own ? "flex-row-reverse" : "flex-row"}`}>
          {!own && <div className="w-7 h-7 rounded-full bg-white/60 animate-pulse flex-shrink-0" />}
          <div className={`h-10 rounded-3xl animate-pulse ${own ? "w-40 bg-brand-200/60 rounded-br-sm" : "w-48 bg-white/60 rounded-bl-sm"}`} />
        </div>
      ))}
    </div>
  );
}
