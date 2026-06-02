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
import { Avatar } from "@repo/ui/avatar";
import { useConnections } from "@/hooks/useConnections";
import { createClient } from "@repo/db/client";

const supabase = createClient();

export default function ChatThreadPage() {
  const params  = useParams<{ connectionId: string }>();
  const router  = useRouter();
  const { user } = useAuth();
  const { connections } = useConnections();

  const connectionId = params.connectionId;

  const { messages, isLoading, isSending, sendMessage } = useMessages(connectionId);
  const { isOtherTyping, setTyping } = useTypingPresence(connectionId, user?.id ?? "");
  const [agreementStatus, setAgreementStatus] = useState<"NONE" | "PENDING" | "CONFIRMED" | "DECLINED">("NONE");
  const [isProposingAgreement, setIsProposingAgreement] = useState(false);
  const [agreementError, setAgreementError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to latest message whenever the list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  useEffect(() => {
    if (!connectionId || !user) return;

    const loadAgreement = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("roommate_agreements")
        .select("status")
        .eq("connection_id", connectionId)
        .maybeSingle();

      setAgreementStatus(data?.status ?? "NONE");
    };

    void loadAgreement();
  }, [connectionId, user]);

  const proposeAgreement = async () => {
    if (isProposingAgreement || agreementStatus === "PENDING" || agreementStatus === "CONFIRMED") return;

    setIsProposingAgreement(true);
    setAgreementError("");
    try {
      const response = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Could not propose agreement");
      setAgreementStatus("PENDING");
    } catch (err) {
      setAgreementError(err instanceof Error ? err.message : "Could not propose agreement");
    } finally {
      setIsProposingAgreement(false);
    }
  };

  // Resolve the other party
  const connection = connections.find((c) => c.id === connectionId);
  const other = connection
    ? connection.requester_id === user?.id
      ? (connection as unknown as {
          receiver: { id: string; display_name: string; avatar_url: string | null; university: string | null };
        }).receiver
      : (connection as unknown as {
          requester: { id: string; display_name: string; avatar_url: string | null; university: string | null };
        }).requester
    : null;

  if (!user) return null;

  return (
    /*
     * Outer shell:
     *   Desktop — sidebar left, chat card centred in the remaining space
     *   Mobile  — no sidebar; the chat card fills the full screen
     *
     * h-[100dvh]: dynamic viewport height — shrinks with the keyboard on
     * mobile so the input stays above it (unlike h-screen / 100vh which
     * is fixed and causes the input to slide under the keyboard on iOS/Android).
     */
    <div className="flex h-[100dvh] overflow-hidden bg-sage-surface">

      {/* ── Left sidebar — desktop only ───────────────────────────── */}
      <AppSidebar />

      {/* ── Main column ───────────────────────────────────────────── */}
      <div className="flex-1 flex justify-center min-w-0">

        {/*
         * Chat card:
         *   flex-col — header / messages / input stacked vertically
         *   h-full   — fills the dynamic viewport height from the parent
         *   min-h-0  — CRITICAL: tells the flexbox to let this div shrink
         *              below its content size so the message list can scroll
         */}
        <div className="flex flex-col w-full max-w-3xl h-full min-h-0 bg-white md:shadow-xl md:border-x md:border-slate-100">

          {/* ── Header ──────────────────────────────────────────────── */}
          <header className="flex-shrink-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">

            {/* Mobile: Roomie logo + back in one row */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => router.back()}
                className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
                aria-label="Back"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* Desktop: back arrow only */}
            <button
              onClick={() => router.back()}
              className="hidden md:flex p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors flex-shrink-0"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Other user */}
            {other ? (
              <Link
                href={`/discover/${other.id}`}
                className="flex items-center gap-3 flex-1 min-w-0 group"
              >
                <Avatar src={other.avatar_url} name={other.display_name} size="sm" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate group-hover:text-brand-600 transition-colors">
                    {other.display_name}
                  </p>
                  {other.university && (
                    <p className="text-xs text-slate-400 truncate">{other.university}</p>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-slate-100 rounded-full w-28 animate-pulse" />
                <div className="h-2.5 bg-slate-100 rounded-full w-20 animate-pulse" />
              </div>
            )}

            {/* Housing shortcut — icon-only on mobile to save space */}
            <Link
              href="/housing"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition-colors"
              title="Find housing"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden sm:inline">Find housing</span>
            </Link>
          </header>

          {/* ── Messages ────────────────────────────────────────────── */}
          {/*
           * flex-1 min-h-0 overflow-y-auto — the three-part scroll fix:
           *   flex-1      → takes all remaining vertical space
           *   min-h-0     → allows shrinking below content height (critical)
           *   overflow-y-auto → enables scrolling within that constrained space
           */}
          <div className="flex-1 min-h-0 overflow-y-auto px-[5%] py-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`flex items-end gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className={`h-10 bg-slate-200 rounded-3xl animate-pulse ${i % 2 === 0 ? "w-48 rounded-bl-lg" : "w-40 rounded-br-lg"}`} />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
                <div className="w-16 h-16 rounded-full bg-sage-surface border-2 border-dashed border-sage-light flex items-center justify-center">
                  <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Say hello!</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Start the conversation with{" "}
                    {other?.display_name ?? "your new roommate"}.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender_id === user.id}
                  currentUserId={user.id}
                />
              ))
            )}

            {isOtherTyping && <TypingIndicator />}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>

          {/* ── Input bar ────────────────────────────────────────────── */}
          {/*
           * flex-shrink-0 — never squish the input bar
           * pb-safe       — adds env(safe-area-inset-bottom) for iOS home bar
           * The ChatInput itself has px-[5%] so it matches the message padding
           */}
          <div className="flex-shrink-0 pb-safe">
            {agreementStatus !== "PENDING" && agreementStatus !== "CONFIRMED" && (
              <div className="border-t border-slate-100 bg-white px-[5%] py-2">
                <button
                  type="button"
                  onClick={proposeAgreement}
                  disabled={isProposingAgreement || !connection}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {isProposingAgreement ? "Proposing agreement..." : "Propose agreement"}
                </button>
                {agreementError && <p className="mt-1.5 text-center text-xs font-medium text-red-500">{agreementError}</p>}
              </div>
            )}
            {agreementStatus === "CONFIRMED" && (
              <div className="border-t border-brand-100 bg-brand-50 px-[5%] py-2 text-center text-xs font-semibold text-brand-700">
                Agreement confirmed. Housing providers are unlocked.
              </div>
            )}
            <ChatInput
              onSend={async (content) => {
                await setTyping(false);
                await sendMessage(content);
              }}
              onTyping={() => void setTyping(true)}
              isSending={isSending}
              disabled={!connection}
              placeholder={other ? `Message ${other.display_name}…` : "Message…"}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
