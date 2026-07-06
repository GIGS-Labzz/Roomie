"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { createClient } from "@repo/db/client";
import { getMessages, sendMessage as dbSendMessage, markMessagesRead } from "@repo/db/queries/messages";
import type { Message } from "@repo/db/queries/messages";
import { getConnectionById } from "@repo/db/queries/connections";
import { useAuth } from "@/context/AuthContext";

// Stable singleton client — not recreated per render
const supabase = createClient();

const senderProfileCache = new Map<string, { id: string; display_name: string; avatar_url: string | null }>();

export type ExtendedMessage = Message & {
  isSending?: boolean;
  isFailed?: boolean;
};

export interface OutboxMessage {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  error?: boolean;
}

const getOutbox = (connectionId: string): OutboxMessage[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(`outbox:${connectionId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveOutbox = (connectionId: string, messages: OutboxMessage[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`outbox:${connectionId}`, JSON.stringify(messages));
  } catch (err) {
    console.error("Failed to save outbox to localStorage:", err);
  }
};

const addToOutbox = (connectionId: string, message: OutboxMessage) => {
  const current = getOutbox(connectionId);
  if (!current.some((m) => m.id === message.id)) {
    saveOutbox(connectionId, [...current, message]);
  }
};

const removeFromOutbox = (connectionId: string, messageId: string) => {
  const current = getOutbox(connectionId);
  saveOutbox(connectionId, current.filter((m) => m.id !== messageId));
};

const markOutboxError = (connectionId: string, messageId: string) => {
  const current = getOutbox(connectionId);
  saveOutbox(connectionId, current.map((m) => m.id === messageId ? { ...m, error: true } : m));
};

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useMessages(connectionId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [deletedForMeIds, setDeletedForMeIds] = useState<Set<string>>(new Set());
  const [clearTimestamp, setClearTimestamp] = useState<string | null>(null);

  // Load local settings on connection change
  useEffect(() => {
    if (typeof window === "undefined") return;

    const starred = localStorage.getItem(`starred:${connectionId}`);
    if (starred) {
      try {
        setStarredIds(new Set(JSON.parse(starred)));
      } catch {}
    } else {
      setStarredIds(new Set());
    }

    const deleted = localStorage.getItem(`deleted_for_me:${connectionId}`);
    if (deleted) {
      try {
        setDeletedForMeIds(new Set(JSON.parse(deleted)));
      } catch {}
    } else {
      setDeletedForMeIds(new Set());
    }

    const clearTime = localStorage.getItem(`clear_timestamp:${connectionId}`);
    setClearTimestamp(clearTime || null);
  }, [connectionId]);

  const retryOutbox = useCallback(async (outboxList: OutboxMessage[]) => {
    if (!user) return;
    for (const om of outboxList) {
      try {
        // Broadcast the retry instantly in case it wasn't received
        const retryOptimistic: ExtendedMessage = {
          id: om.id,
          connection_id: connectionId,
          sender_id: user.id,
          content: om.content.trim(),
          message_type: "text",
          image_url: null,
          read_at: null,
          created_at: om.created_at,
          sender: {
            id: user.id,
            display_name: user.user_metadata?.full_name ?? "You",
            avatar_url: user.user_metadata?.avatar_url ?? null,
          },
        };
        if (channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "new_message",
            payload: retryOptimistic,
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const saved = await dbSendMessage(
          supabase as any,
          connectionId,
          user.id,
          om.content.trim(),
          "text",
          undefined,
          om.id,
          om.created_at
        );
        if (saved) {
          removeFromOutbox(connectionId, om.id);
          setMessages((prev) =>
            prev.map((m) => (m.id === om.id ? { ...saved, sender: m.sender, isSending: false, isFailed: false } : m))
          );
        } else {
          markOutboxError(connectionId, om.id);
          setMessages((prev) =>
            prev.map((m) => (m.id === om.id ? { ...m, isSending: false, isFailed: true } : m))
          );
        }
      } catch (err) {
        console.error("Error retrying outbox message:", err);
        markOutboxError(connectionId, om.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === om.id ? { ...m, isSending: false, isFailed: true } : m))
        );
      }
    }
  }, [connectionId, user]);

  // Initial load
  useEffect(() => {
    if (!connectionId) return;

    const load = async () => {
      setIsLoading(true);

      // Fetch connection to pre-populate senderProfileCache with both users' profiles
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: conn } = await getConnectionById(supabase as any, connectionId);
      if (conn) {
        const connAny = conn as any;
        if (connAny.requester) {
          senderProfileCache.set(connAny.requester.id, {
            id: connAny.requester.id,
            display_name: connAny.requester.display_name,
            avatar_url: connAny.requester.avatar_url,
          });
        }
        if (connAny.receiver) {
          senderProfileCache.set(connAny.receiver.id, {
            id: connAny.receiver.id,
            display_name: connAny.receiver.display_name,
            avatar_url: connAny.receiver.avatar_url,
          });
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msgs = await getMessages(supabase as any, connectionId);
      
      // Load outbox messages and append them to messages state
      const outbox = getOutbox(connectionId);
      const outboxMsgs: ExtendedMessage[] = outbox.map((om) => ({
        id: om.id,
        connection_id: om.connection_id,
        sender_id: om.sender_id,
        content: om.content,
        message_type: "text",
        image_url: null,
        read_at: null,
        created_at: om.created_at,
        isFailed: om.error,
        sender: user ? {
          id: user.id,
          display_name: user.user_metadata?.full_name ?? "You",
          avatar_url: user.user_metadata?.avatar_url ?? null,
        } : undefined,
      }));

      setMessages([...msgs, ...outboxMsgs]);
      setIsLoading(false);

      if (outbox.length > 0) {
        void retryOutbox(outbox);
      }

      // Mark all messages from the other user as read
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await markMessagesRead(supabase as any, connectionId, user.id);
      }
    };

    void load();
  }, [connectionId, user, retryOutbox]);

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
        "broadcast",
        { event: "new_message" },
        (payload: { payload: Message }) => {
          const newMsg = payload.payload;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Mark as read immediately if it's from the other user
          if (user && newMsg.sender_id !== user.id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            void (supabase as any)
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMsg.id);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const senderId = payload.new.sender_id;
            let sender = senderProfileCache.get(senderId);
            const newMsg: Message = {
              ...(payload.new as Message),
              sender: sender ?? undefined,
            };

            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            if (!sender) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              void (supabase as any)
                .from("profiles")
                .select("id, display_name, avatar_url")
                .eq("id", senderId)
                .single()
                .then(({ data }: any) => {
                  if (data) {
                    senderProfileCache.set(senderId, data);
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === newMsg.id ? { ...m, sender: data } : m
                      )
                    );
                  }
                });
            }

            // Mark as read immediately if it's from the other user
            if (user && payload.new.sender_id !== user.id) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              void (supabase as any)
                .from("messages")
                .update({ read_at: new Date().toISOString() })
                .eq("id", newMsg.id);
            }
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m))
            );
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
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

  // Periodic background poll fallback (every 15s)
  useEffect(() => {
    if (!connectionId) return;

    const interval = setInterval(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msgs = await getMessages(supabase as any, connectionId);
      if (msgs && msgs.length > 0) {
        setMessages((prev) => {
          const merged = [...prev];
          let changed = false;
          for (const m of msgs) {
            if (!merged.some((existing) => existing.id === m.id)) {
              merged.push(m);
              changed = true;
            }
          }
          if (changed) {
            return merged.sort((a, b) => a.created_at.localeCompare(b.created_at));
          }
          return prev;
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [connectionId]);

  // Synchronize outbox states from localStorage changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = () => {
      const outbox = getOutbox(connectionId);
      setMessages((prev) => {
        return prev.map((m) => {
          const om = outbox.find((o) => o.id === m.id);
          if (om) {
            return { ...m, isFailed: !!om.error, isSending: !om.error };
          }
          if (m.isSending || m.isFailed) {
            return { ...m, isSending: false, isFailed: false };
          }
          return m;
        });
      });
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [connectionId]);

  const sendMessage = useCallback(
    async (
      content: string,
      messageType: "text" | "image" | "system" | "agreement_request" | "agreement_confirmed" | "agreement_declined" | "bill_split" = "text"
    ) => {
      if (!user || !content.trim()) return;
      setIsSending(true);

      const messageId = generateUUID();

      // Optimistic update — add the message immediately to UI
      const optimisticMsg: ExtendedMessage = {
        id: messageId,
        connection_id: connectionId,
        sender_id: user.id,
        content: content.trim(),
        message_type: messageType,
        image_url: null,
        read_at: null,
        created_at: new Date().toISOString(),
        sender: {
          id: user.id,
          display_name: user.user_metadata?.full_name ?? "You",
          avatar_url: user.user_metadata?.avatar_url ?? null,
        },
        isSending: true,
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      // Broadcast immediately to the recipient channel before DB insert starts
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "new_message",
          payload: { ...optimisticMsg, isSending: false },
        });
      }

      // Save to outbox (only if it's text/image message)
      const isOutboxable = messageType === "text" || messageType === "image";
      if (isOutboxable) {
        const outboxMsg: OutboxMessage = {
          id: optimisticMsg.id,
          connection_id: connectionId,
          sender_id: user.id,
          content: optimisticMsg.content,
          created_at: optimisticMsg.created_at,
        };
        addToOutbox(connectionId, outboxMsg);
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const saved = await dbSendMessage(
          supabase as any,
          connectionId,
          user.id,
          content.trim(),
          messageType,
          undefined,
          messageId,
          optimisticMsg.created_at
        );

        if (saved) {
          if (isOutboxable) {
            removeFromOutbox(connectionId, optimisticMsg.id);
          }

          // Replace the optimistic message with the real database properties, set isSending to false
          setMessages((prev) =>
            prev.map((m) => (m.id === optimisticMsg.id ? { ...saved, sender: optimisticMsg.sender, isSending: false } : m))
          );

          // Trigger push notification to recipient (only for non-system messages)
          if (isOutboxable) {
            void fetch("/api/push/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                connectionId,
                body: content.trim(),
              }),
            }).catch((err) => console.error("Failed to send chat push notification:", err));
          }
        } else {
          if (isOutboxable) {
            markOutboxError(connectionId, optimisticMsg.id);
          }
          setMessages((prev) =>
            prev.map((m) => (m.id === optimisticMsg.id ? { ...m, isSending: false, isFailed: true } : m))
          );
        }
      } catch (err) {
        console.error("Failed to send message:", err);
        if (isOutboxable) {
          markOutboxError(connectionId, optimisticMsg.id);
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? { ...m, isSending: false, isFailed: true } : m))
        );
      } finally {
        setIsSending(false);
      }
    },
    [connectionId, user]
  );

  const retryMessage = useCallback(
    async (messageId: string) => {
      if (!user) return;
      const outbox = getOutbox(connectionId);
      const om = outbox.find((m) => m.id === messageId);
      if (!om) return;

      // Set status to sending in UI
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isSending: true, isFailed: false } : m))
      );

      // Broadcast immediately on retry
      const retryOptimistic: ExtendedMessage = {
        id: om.id,
        connection_id: connectionId,
        sender_id: user.id,
        content: om.content.trim(),
        message_type: "text",
        image_url: null,
        read_at: null,
        created_at: om.created_at,
        sender: {
          id: user.id,
          display_name: user.user_metadata?.full_name ?? "You",
          avatar_url: user.user_metadata?.avatar_url ?? null,
        },
      };
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "new_message",
          payload: retryOptimistic,
        });
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const saved = await dbSendMessage(
          supabase as any,
          connectionId,
          user.id,
          om.content.trim(),
          "text",
          undefined,
          om.id,
          om.created_at
        );
        if (saved) {
          removeFromOutbox(connectionId, om.id);
          setMessages((prev) =>
            prev.map((m) => (m.id === om.id ? { ...saved, sender: m.sender, isSending: false, isFailed: false } : m))
          );
        } else {
          markOutboxError(connectionId, om.id);
          setMessages((prev) =>
            prev.map((m) => (m.id === om.id ? { ...m, isSending: false, isFailed: true } : m))
          );
        }
      } catch (err) {
        console.error("Failed to retry message:", err);
        markOutboxError(connectionId, om.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === om.id ? { ...m, isSending: false, isFailed: true } : m))
        );
      }
    },
    [connectionId, user]
  );

  const toggleStarMessage = useCallback((messageId: string) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      localStorage.setItem(`starred:${connectionId}`, JSON.stringify(Array.from(next)));
      return next;
    });
  }, [connectionId]);

  const deleteMessageForMe = useCallback((messageId: string) => {
    setDeletedForMeIds((prev) => {
      const next = new Set(prev);
      next.add(messageId);
      localStorage.setItem(`deleted_for_me:${connectionId}`, JSON.stringify(Array.from(next)));
      return next;
    });
  }, [connectionId]);

  const deleteMessageForEveryone = useCallback(async (messageId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("messages").delete().eq("id", messageId);
    if (error) {
      console.error("Failed to delete message:", error);
      throw error;
    }
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const pinnedMessageId = useMemo(() => {
    let currentPinned: string | null = null;
    for (const m of messages) {
      if (m.message_type === "system") {
        if (m.content.startsWith("system:pin:")) {
          const parts = m.content.split(":");
          currentPinned = parts[2];
        } else if (m.content.startsWith("system:unpin:")) {
          const parts = m.content.split(":");
          const unpinId = parts[2];
          if (currentPinned === unpinId) {
            currentPinned = null;
          }
        }
      }
    }
    return currentPinned;
  }, [messages]);

  const pinnedMessage = useMemo(() => {
    if (!pinnedMessageId) return null;
    return messages.find((m) => m.id === pinnedMessageId) || null;
  }, [messages, pinnedMessageId]);

  const togglePinMessage = useCallback(async (messageId: string, content: string) => {
    const isCurrentlyPinned = pinnedMessageId === messageId;
    if (isCurrentlyPinned) {
      await sendMessage(`system:unpin:${messageId}`, "system");
    } else {
      if (pinnedMessageId) {
        await sendMessage(`system:unpin:${pinnedMessageId}`, "system");
      }
      const previewText = content.substring(0, 50);
      await sendMessage(`system:pin:${messageId}:${previewText}`, "system");
    }
  }, [pinnedMessageId, sendMessage]);

  const visibleMessages = useMemo(() => {
    return messages.filter((m) => {
      if (deletedForMeIds.has(m.id)) return false;
      if (clearTimestamp && new Date(m.created_at) <= new Date(clearTimestamp)) return false;
      if (
        m.message_type === "system" &&
        (m.content.startsWith("system:pin:") || m.content.startsWith("system:unpin:"))
      ) {
        return false;
      }
      return true;
    });
  }, [messages, deletedForMeIds, clearTimestamp]);

  return {
    messages: visibleMessages,
    rawMessages: messages,
    pinnedMessage,
    starredIds,
    isLoading,
    isSending,
    sendMessage,
    retryMessage,
    toggleStarMessage,
    togglePinMessage,
    deleteMessageForMe,
    deleteMessageForEveryone,
  };
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
