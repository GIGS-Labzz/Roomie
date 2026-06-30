"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@repo/db/client";
import { getMessages, sendMessage as dbSendMessage, markMessagesRead } from "@repo/db/queries/messages";
import type { Message } from "@repo/db/queries/messages";
import { useAuth } from "@/context/AuthContext";

// Stable singleton client — not recreated per render
const supabase = createClient();

const senderProfileCache = new Map<string, { id: string; display_name: string; avatar_url: string | null }>();

export function useMessages(connectionId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Initial load
  useEffect(() => {
    if (!connectionId) return;

    const load = async () => {
      setIsLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msgs = await getMessages(supabase as any, connectionId);
      setMessages(msgs);
      setIsLoading(false);

      // Mark all messages from the other user as read
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await markMessagesRead(supabase as any, connectionId, user.id);
      }
    };

    void load();
  }, [connectionId, user]);

  // Realtime subscription
  useEffect(() => {
    if (!connectionId) return;

    // Clean up any existing channel
    if (channelRef.current) {
      void supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`chat:${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        async (payload) => {
          // Fetch and cache sender profile to prevent DB query waterfalls
          let sender = senderProfileCache.get(payload.new.sender_id);
          if (!sender) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await (supabase as any)
              .from("profiles")
              .select("id, display_name, avatar_url")
              .eq("id", payload.new.sender_id)
              .single();
            if (data) {
              sender = data;
              senderProfileCache.set(payload.new.sender_id, data);
            }
          }

          const newMsg: Message = {
            ...(payload.new as Message),
            sender: sender ?? undefined,
          };

          setMessages((prev) => {
            // Deduplicate (optimistic update may already have added it)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Mark as read immediately if it's from the other user
          if (user && payload.new.sender_id !== user.id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMsg.id);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [connectionId, user]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !content.trim()) return;
      setIsSending(true);

      // Optimistic update — add the message immediately to UI
      const optimisticMsg: Message = {
        id: `optimistic-${Date.now()}`,
        connection_id: connectionId,
        sender_id: user.id,
        content: content.trim(),
        message_type: "text",
        image_url: null,
        read_at: null,
        created_at: new Date().toISOString(),
        sender: {
          id: user.id,
          display_name: user.user_metadata?.full_name ?? "You",
          avatar_url: user.user_metadata?.avatar_url ?? null,
        },
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const saved = await dbSendMessage(supabase as any, connectionId, user.id, content.trim());

      if (saved) {
        // Replace the optimistic message with the real one
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? { ...saved, sender: optimisticMsg.sender } : m))
        );
      } else {
        // Remove the optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      }

      setIsSending(false);
    },
    [connectionId, user]
  );

  return { messages, isLoading, isSending, sendMessage };
}

// Typing indicator via Supabase Presence (ephemeral, never stored in DB)
export function useTypingPresence(connectionId: string, userId: string) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!connectionId || !userId) return;

    const channel = supabase
      .channel(`presence:${connectionId}`)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ typing: boolean; user_id: string }>();
        const othersTyping = Object.values(state)
          .flat()
          .some((p) => p.typing && p.user_id !== userId);
        setIsOtherTyping(othersTyping);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ typing: false, user_id: userId });
        }
      });

    channelRef.current = channel;
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [connectionId, userId]);

  const setTyping = useCallback(
    async (typing: boolean) => {
      if (!channelRef.current) return;
      await channelRef.current.track({ typing, user_id: userId });

      // Auto-clear typing after 3s of no activity
      if (typing) {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(async () => {
          if (channelRef.current) {
            await channelRef.current.track({ typing: false, user_id: userId });
          }
        }, 3000);
      }
    },
    [userId]
  );

  return { isOtherTyping, setTyping };
}
