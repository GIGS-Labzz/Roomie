"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Plus, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getProfileHref } from "@/lib/profile-url";
import { useMessages, useTypingPresence, type ExtendedMessage } from "@/hooks/useMessages";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BillSplitPinnedBanner } from "@/components/splits/BillSplitPinnedBanner";
import { CongratsModal } from "@/components/connect/CongratsModal";
import { Avatar } from "@repo/ui/avatar";
import { Modal } from "@repo/ui/modal";
import { createClient } from "@repo/db/client";
import { getConnectionById } from "@repo/db/queries/connections";
import { useProfile } from "@/hooks/useProfile";

const supabase = createClient();

const BADGE_COLORS = ["brand", "peach", "sage", "slate"] as const;
const BADGE_VARIANTS = ["standard", "outline", "glass"] as const;
const BADGE_THEMES = ["light", "dark"] as const;

type BadgeColor = (typeof BADGE_COLORS)[number];
type BadgeVariant = (typeof BADGE_VARIANTS)[number];
type BadgeTheme = (typeof BADGE_THEMES)[number];

const BADGE_COLOR_LABELS: Record<BadgeColor, string> = {
  brand: "Brand green",
  peach: "Peach",
  sage: "Sage",
  slate: "Slate",
};

function getBadgeClasses(color: string, variant: string, theme: string): string {
  if (theme === "dark") {
    if (variant === "outline") return "bg-transparent border border-white/70 text-white";
    if (variant === "glass") return "bg-white/15 backdrop-blur-sm border border-white/20 text-white";
    return "bg-white/90 border border-white/60 text-slate-900";
  }
  const colorMap: Record<string, string> = {
    brand: "bg-brand-100 border-brand-200/50 text-brand-800",
    peach: "bg-peach-100 border-peach-200/50 text-slate-800",
    sage: "bg-sage-surface border-slate-200/50 text-slate-700",
    slate: "bg-slate-100 border-slate-200/50 text-slate-700",
  };
  const base = colorMap[color] ?? colorMap.brand;
  if (variant === "outline") {
    const textClass = base.split(" ").find((c) => c.startsWith("text-")) ?? "text-slate-700";
    return `bg-transparent border border-slate-300 ${textClass}`;
  }
  if (variant === "glass") return `${base} backdrop-blur-sm bg-opacity-70`;
  return `${base} border`;
}

const fontClassMap: Record<string, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
  handwritten: "italic font-serif font-black tracking-wide",
};

const fontLabels: Record<string, string> = {
  sans: "Sans-Serif",
  serif: "Serif",
  mono: "Monospace",
  handwritten: "Handwritten",
};

const bgPatterns = ["solid", "gradient", "stripes", "dots", "grid"];

function getPatternStyle(color: string, pattern: string) {
  if (pattern === "solid") return {};
  if (pattern === "gradient") {
    const gradients: Record<string, string> = {
      brand: "linear-gradient(135deg, #10B981, #059669)",
      peach: "linear-gradient(135deg, #FFEDD5, #FED7AA)",
      sage: "linear-gradient(135deg, #CBD5E1, #94A3B8)",
      slate: "linear-gradient(135deg, #E2E8F0, #94A3B8)",
    };
    return { backgroundImage: gradients[color] || gradients.brand };
  }
  if (pattern === "stripes") {
    return {
      backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.15), rgba(255,255,255,0.15) 6px, transparent 6px, transparent 12px)"
    };
  }
  if (pattern === "dots") {
    return {
      backgroundImage: "radial-gradient(rgba(0,0,0,0.12) 20%, transparent 20%)",
      backgroundSize: "6px 6px"
    };
  }
  if (pattern === "grid") {
    return {
      backgroundImage: "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
      backgroundSize: "8px 8px"
    };
  }
  return {};
}

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
  const { profile } = useProfile();

  const connectionId = params.connectionId;

  const {
    messages,
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
  } = useMessages(connectionId);

  const [infoMsg, setInfoMsg] = useState<ExtendedMessage | null>(null);
  const [deleteEveryoneMsgId, setDeleteEveryoneMsgId] = useState<string | null>(null);

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  const { isOtherTyping, setTyping } = useTypingPresence(connectionId, user?.id ?? "");

  interface ActivePool {
    roomie_id: string;
    names: string[];
  }

  const [other, setOther] = useState<OtherUser | null | undefined>(undefined);
  const [agreementStatus, setAgreementStatus] = useState<"NONE" | "PENDING_APPROVAL" | "PENDING" | "CONFIRMED" | "DECLINED">("NONE");
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const [roomieId, setRoomieId] = useState<string | null>(null);
  const [justConfirmed, setJustConfirmed] = useState(false);
  const agreementStatusRef = useRef(agreementStatus);
  const [badgeColor, setBadgeColor] = useState<BadgeColor>("brand");
  const [badgeVariant, setBadgeVariant] = useState<BadgeVariant>("standard");
  const [badgeTheme, setBadgeTheme] = useState<BadgeTheme>("light");
  const [badgeFont, setBadgeFont] = useState<string>("sans");
  const [badgeBgPattern, setBadgeBgPattern] = useState<string>("solid");
  const [agreementCreatedAt, setAgreementCreatedAt] = useState<string | null>(null);
  
  const [showBadgeCustomizer, setShowBadgeCustomizer] = useState(false);
  const [savingBadge, setSavingBadge] = useState(false);
  const [isProposingAgreement, setIsProposingAgreement] = useState(false);
  const [agreementError, setAgreementError] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [agreementLoadError, setAgreementLoadError] = useState<string | null>(null);

  // Security approval states for Roomie ID
  const [poolMembers, setPoolMembers] = useState<any[]>([]);
  const [loadingPoolMembers, setLoadingPoolMembers] = useState(false);
  const [showIdRequested, setShowIdRequested] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameVerified, setUsernameVerified] = useState(false);
  const [selectedApprovalRoommateId, setSelectedApprovalRoommateId] = useState("");
  const [approvalRequestStatus, setApprovalRequestStatus] = useState<"idle" | "loading" | "success">("idle");
  const [roomieIdVisible, setRoomieIdVisible] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<"style" | "details">("style");

  const [activePools, setActivePools] = useState<ActivePool[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string>("NEW_AGREEMENT");
  const [showProposeOptions, setShowProposeOptions] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const isSupport =
    other?.id === "a99928a0-8de7-4da0-871a-22077d13945d" ||
    other?.display_name?.toLowerCase() === "roomie.app" ||
    other?.username?.toLowerCase() === "fav_roomiee" ||
    profile?.id === "a99928a0-8de7-4da0-871a-22077d13945d" ||
    profile?.display_name?.toLowerCase() === "roomie.app" ||
    profile?.username?.toLowerCase() === "fav_roomiee";

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  useEffect(() => {
    agreementStatusRef.current = agreementStatus;
  }, [agreementStatus]);

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
          .select("id, status, roomie_id, badge_color, badge_variant, badge_theme, badge_font, badge_bg_pattern, created_at")
          .eq("connection_id", connectionId)
          .maybeSingle();
        if (error) throw error;
        setAgreementStatus(data?.status ?? "NONE");
        setAgreementId(data?.id ?? null);
        setRoomieId(data?.roomie_id ?? null);
        setBadgeColor(data?.badge_color ?? "brand");
        setBadgeVariant(data?.badge_variant ?? "standard");
        setBadgeTheme(data?.badge_theme ?? "light");
        setBadgeFont(data?.badge_font ?? "sans");
        setBadgeBgPattern(data?.badge_bg_pattern ?? "solid");
        setAgreementCreatedAt(data?.created_at ?? null);
      } catch (err) {
        console.error("Failed to roommate agreement status:", err);
        setAgreementLoadError(err instanceof Error ? err.message : "Failed to load agreement status");
      }
    };
    void load();
  }, [connectionId, user]);

  // Load user's active roommate pools
  useEffect(() => {
    if (!user) return;
    const loadPools = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("roommate_agreements")
          .select(`
            roomie_id,
            initiator:profiles!initiator_id(id, display_name),
            acceptor:profiles!acceptor_id(id, display_name)
          `)
          .eq("status", "CONFIRMED")
          .or(`initiator_id.eq.${user.id},acceptor_id.eq.${user.id}`);

        if (error) throw error;

        const poolMap: Record<string, Set<string>> = {};
        for (const row of (data ?? [])) {
          if (!row.roomie_id) continue;
          if (!poolMap[row.roomie_id]) poolMap[row.roomie_id] = new Set();
          
          const init = row.initiator as any;
          const acc = row.acceptor as any;

          if (init && init.id !== user.id) poolMap[row.roomie_id].add(init.display_name);
          if (acc && acc.id !== user.id) poolMap[row.roomie_id].add(acc.display_name);
        }

        const pools = Object.entries(poolMap).map(([roomie_id, namesSet]) => ({
          roomie_id,
          names: Array.from(namesSet)
        }));
        
        setActivePools(pools);
      } catch (err) {
        console.error("Failed to load active pools:", err);
      }
    };
    void loadPools();
  }, [user]);

  // Load connection pool members when badge customizer is opened
  useEffect(() => {
    if (!showBadgeCustomizer) {
      // Clear pool members and auto-hide states on close
      setPoolMembers([]);
      setShowIdRequested(false);
      setInputUsername("");
      setUsernameError("");
      setUsernameVerified(false);
      setSelectedApprovalRoommateId("");
      setApprovalRequestStatus("idle");
      setRoomieIdVisible(false);
      setCustomizerTab("style");
      return;
    }

    const loadPoolMembers = async () => {
      if (!user) return;
      setLoadingPoolMembers(true);
      try {
        let rId = roomieId;
        if (!rId && agreementId) {
          const { data: agreementData } = await (supabase as any)
            .from("roommate_agreements")
            .select("roomie_id")
            .eq("id", agreementId)
            .maybeSingle();
          rId = agreementData?.roomie_id ?? null;
        }

        const memberIds = new Set<string>();
        if (user?.id) memberIds.add(user.id);
        if (other?.id) memberIds.add(other.id);

        if (rId) {
          const { data: agreementsData } = await (supabase as any)
            .from("roommate_agreements")
            .select("initiator_id, acceptor_id")
            .eq("roomie_id", rId)
            .eq("status", "CONFIRMED");

          for (const row of (agreementsData ?? [])) {
            if (row.initiator_id) memberIds.add(row.initiator_id);
            if (row.acceptor_id) memberIds.add(row.acceptor_id);
          }
        }

        if (memberIds.size > 0) {
          const { data: profiles } = await (supabase as any)
            .from("profiles")
            .select("id, display_name, username, avatar_url")
            .in("id", Array.from(memberIds));
          setPoolMembers(profiles ?? []);

          // Check if there is an existing roomie_id_request message in the active connections with pool roommates
          for (const memberId of Array.from(memberIds)) {
            if (memberId === user.id) continue;
            
            const { data: conn } = await (supabase as any)
              .from("connections")
              .select("id")
              .or(`and(requester_id.eq.${user.id},receiver_id.eq.${memberId}),and(requester_id.eq.${memberId},receiver_id.eq.${user.id})`)
              .eq("status", "ACTIVE")
              .maybeSingle();

            if (conn) {
              const { data: lastRequest } = await (supabase as any)
                .from("messages")
                .select("content")
                .eq("connection_id", conn.id)
                .eq("message_type", "roomie_id_request")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

              if (lastRequest) {
                try {
                  const content = JSON.parse(lastRequest.content);
                  if (content.requester_id === user.id && content.target_id === memberId) {
                    setSelectedApprovalRoommateId(memberId);
                    setApprovalRequestStatus(content.status);
                    if (content.status === "approved") {
                      setRoomieIdVisible(true);
                    }
                  }
                } catch (e) {
                  console.error("Failed to parse last request content:", e);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load pool members:", err);
      } finally {
        setLoadingPoolMembers(false);
      }
    };

    void loadPoolMembers();
  }, [showBadgeCustomizer, roomieId, agreementId, user, other]);

  // Listen to realtime updates on roomie_id_request messages to update state
  useEffect(() => {
    if (!showBadgeCustomizer || !user) return;

    const currentUserId = user.id;

    const channel = supabase
      .channel(`roomie-id-request-listener:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: "message_type=eq.roomie_id_request",
        },
        (payload) => {
          const row = payload.new as any;
          if (!row) return;
          try {
            const content = JSON.parse(row.content);
            if (content.requester_id === currentUserId && content.target_id === selectedApprovalRoommateId) {
              setApprovalRequestStatus(content.status);
              if (content.status === "approved") {
                setRoomieIdVisible(true);
              } else {
                setRoomieIdVisible(false);
              }
            }
          } catch (e) {
            console.error("Failed to parse request status update", e);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [showBadgeCustomizer, user, selectedApprovalRoommateId]);

  // Realtime: update instantly when the roommate accepts and pays
  useEffect(() => {
    if (!connectionId) return;
    const channel = supabase
      .channel(`agreement:${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "roommate_agreements",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const row = payload.new as any;
          if (!row) return;
          if (row.status === "CONFIRMED" && agreementStatusRef.current !== "CONFIRMED") {
            setJustConfirmed(true);
          }
          setAgreementStatus(row.status ?? "NONE");
          setAgreementId(row.id ?? null);
          setRoomieId(row.roomie_id ?? null);
          setBadgeColor(row.badge_color ?? "brand");
          setBadgeVariant(row.badge_variant ?? "standard");
          setBadgeTheme(row.badge_theme ?? "light");
          setBadgeFont(row.badge_font ?? "sans");
          setBadgeBgPattern(row.badge_bg_pattern ?? "solid");
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [connectionId]);

  const proposeAgreement = async (poolRoomieId?: string) => {
    if (isProposingAgreement || agreementStatus === "PENDING" || agreementStatus === "PENDING_APPROVAL" || agreementStatus === "CONFIRMED") return;
    setIsProposingAgreement(true);
    setAgreementError("");
    try {
      const res = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, poolRoomieId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not propose agreement");
      setAgreementStatus(poolRoomieId ? "PENDING_APPROVAL" : "PENDING");
      setShowProposeOptions(false);
    } catch (err) {
      setAgreementError(err instanceof Error ? err.message : "Could not propose agreement");
    } finally {
      setIsProposingAgreement(false);
    }
  };

  const saveBadgeCustomization = async (
    color: BadgeColor,
    variant: BadgeVariant,
    theme: BadgeTheme,
    font: string,
    bgPattern: string
  ) => {
    if (!agreementId || savingBadge) return;
    setSavingBadge(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("roommate_agreements")
        .update({
          badge_color: color,
          badge_variant: variant,
          badge_theme: theme,
          badge_font: font,
          badge_bg_pattern: bgPattern,
        })
        .eq("id", agreementId);
      if (error) throw error;
      setBadgeColor(color);
      setBadgeVariant(variant);
      setBadgeTheme(theme);
      setBadgeFont(font);
      setBadgeBgPattern(bgPattern);
    } catch (err) {
      console.error("Failed to save badge customization:", err);
    } finally {
      setSavingBadge(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-sage-surface">
      {/* Desktop sidebar */}
      <AppSidebar />

      <div className="flex-1 flex justify-center min-w-0 overflow-hidden">
        <div className="flex flex-col w-full max-w-3xl h-full min-h-0 overflow-hidden">

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
                href={getProfileHref(other)}
                className="flex items-center gap-2.5 flex-1 min-w-0 group"
              >
                <div className="relative flex-shrink-0">
                  <Avatar src={other.avatar_url} name={other.display_name} size="sm" className="ring-2 ring-white/30" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-300 rounded-full border-2 border-brand-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="font-semibold text-white text-[15px] truncate leading-tight group-hover:underline">
                      {other.display_name.split(" ")[0]}
                    </p>
                    {agreementStatus === "CONFIRMED" && (
                      <Shield className="w-4 h-4 text-white fill-current shrink-0" />
                    )}
                    {other.student_verified && (
                      <svg className="w-3.5 h-3.5 text-white/80 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {agreementStatus === "CONFIRMED" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowBadgeCustomizer(true);
                        }}
                        style={getPatternStyle(badgeColor, badgeBgPattern)}
                        title="Customize your Roomie badge"
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-sm transition-transform hover:scale-105 shrink-0 ${getBadgeClasses(badgeColor, badgeVariant, badgeTheme)} ${fontClassMap[badgeFont] || "font-sans"} ${badgeBgPattern === "gradient" && badgeColor === "brand" ? "text-white" : ""}`}
                      >
                        Roomie
                      </button>
                    )}
                  </div>
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
            ) : other === null ? (
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Avatar src={null} name="User" size="sm" className="ring-2 ring-white/30" />
                <div className="min-w-0">
                  <p className="font-semibold text-white text-[15px] truncate leading-tight">
                    Deactivated User
                  </p>
                  <p className="text-white/70 text-xs truncate leading-tight">
                    This account is inactive
                  </p>
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
            {!isSupport && agreementStatus === "CONFIRMED" && (
              <Link
                href={`/housing?connectionId=${connectionId}`}
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

          {/* Pinned Message Banner */}
          {pinnedMessage && (
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm z-20 shrink-0">
              <div
                onClick={() => scrollToMessage(pinnedMessage.id)}
                className="flex items-center gap-2 cursor-pointer min-w-0 flex-1"
                title="Click to view message"
              >
                <div className="bg-brand-50 rounded-lg p-1.5 shrink-0 text-brand-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">Pinned Message</p>
                  <p className="text-sm text-slate-600 truncate font-medium">
                    {pinnedMessage.image_url ? "[Photo]" : pinnedMessage.content}
                  </p>
                </div>
              </div>
              <button
                onClick={() => togglePinMessage(pinnedMessage.id, pinnedMessage.content)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0 cursor-pointer"
                title="Unpin message"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

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
                {messages.map((msg: ExtendedMessage, idx: number) => {
                  const showDateSep =
                    idx === 0 || !isSameDay(messages[idx - 1].created_at, msg.created_at);

                  return (
                    <div key={msg.id} id={`msg-${msg.id}`}>
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
                        isStarred={starredIds.has(msg.id)}
                        isPinned={pinnedMessage?.id === msg.id}
                        onStar={toggleStarMessage}
                        onPin={(messageId) => togglePinMessage(messageId, msg.content)}
                        onDeleteForMe={deleteMessageForMe}
                        onDeleteForEveryone={(messageId) => setDeleteEveryoneMsgId(messageId)}
                        onShowInfo={(m) => setInfoMsg(m)}
                        disableActions={isSupport}
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
            {!isSupport && agreementStatus !== "PENDING" && agreementStatus !== "PENDING_APPROVAL" && agreementStatus !== "CONFIRMED" && (
              <div className="bg-white border-t border-slate-200 px-4 py-2">
                {activePools.length > 0 ? (
                  !showProposeOptions ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProposeOptions(true);
                          if (activePools.length > 0) {
                            setSelectedPoolId(activePools[0].roomie_id);
                          }
                        }}
                        disabled={!other}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4.5 w-4.5" />
                        Add Roomie Pool
                      </button>
                      <button
                        type="button"
                        onClick={() => proposeAgreement()}
                        disabled={isProposingAgreement || !other}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                        New Roomie Proposal
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 p-1">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="pool-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Select roommate pool
                        </label>
                        <select
                          id="pool-select"
                          value={selectedPoolId}
                          onChange={(e) => setSelectedPoolId(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
                        >
                          {activePools.map((pool) => (
                            <option key={pool.roomie_id} value={pool.roomie_id}>
                              Add to pool: {pool.names.join(" & ")} ({pool.roomie_id})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isProposingAgreement}
                          onClick={() => {
                            void proposeAgreement(selectedPoolId);
                          }}
                          className="flex-1 rounded-xl bg-brand-500 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
                        >
                          {isProposingAgreement ? "Sending..." : "Send proposal"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowProposeOptions(false)}
                          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => proposeAgreement()}
                    disabled={isProposingAgreement || !other}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {isProposingAgreement ? "Proposing…" : "Propose roommate agreement"}
                  </button>
                )}
                {agreementError && (
                  <p className="mt-1 text-center text-xs text-red-500">{agreementError}</p>
                )}
              </div>
            )}

            {!isSupport && agreementStatus === "PENDING_APPROVAL" && (
              <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 text-center text-xs font-semibold text-amber-700 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Agreement pending pool approval
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

      {justConfirmed && (
        <CongratsModal agreementId={agreementId} roomieId={roomieId} roommateName={other?.display_name} />
      )}

      {/* Customize Roomie Badge Sheet */}
      <Modal
        isOpen={showBadgeCustomizer}
        onClose={() => setShowBadgeCustomizer(false)}
        title="Customize Roomie Badge"
      >
        <div className="space-y-5">
          {/* Badge Preview */}
          <div className="flex justify-center py-5 rounded-2xl bg-brand-500 relative overflow-hidden">
            <span
              style={getPatternStyle(badgeColor, badgeBgPattern)}
              className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all duration-300 ${getBadgeClasses(
                badgeColor,
                badgeVariant,
                badgeTheme
              )} ${fontClassMap[badgeFont] || "font-sans"} ${
                badgeBgPattern === "gradient" && badgeColor === "brand" ? "text-white" : ""
              }`}
            >
              Roomie
            </span>
          </div>

          {/* Tab selector */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setCustomizerTab("style")}
              className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 ${
                customizerTab === "style"
                  ? "border-brand-500 text-brand-600 font-black"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Personalize
            </button>
            <button
              type="button"
              onClick={() => setCustomizerTab("details")}
              className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 ${
                customizerTab === "details"
                  ? "border-brand-500 text-brand-600 font-black"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Badge Details
            </button>
          </div>

          {customizerTab === "style" ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {BADGE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => void saveBadgeCustomization(color, badgeVariant, badgeTheme, badgeFont, badgeBgPattern)}
                      disabled={savingBadge}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                        badgeColor === color
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {BADGE_COLOR_LABELS[color]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Style</p>
                <div className="flex gap-2 flex-wrap">
                  {BADGE_VARIANTS.map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => void saveBadgeCustomization(badgeColor, variant, badgeTheme, badgeFont, badgeBgPattern)}
                      disabled={savingBadge}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-colors ${
                        badgeVariant === variant
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Theme</p>
                <div className="flex gap-2 flex-wrap">
                  {BADGE_THEMES.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => void saveBadgeCustomization(badgeColor, badgeVariant, theme, badgeFont, badgeBgPattern)}
                      disabled={savingBadge}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-colors ${
                        badgeTheme === theme
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Font</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(fontLabels).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => void saveBadgeCustomization(badgeColor, badgeVariant, badgeTheme, f, badgeBgPattern)}
                      disabled={savingBadge}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                        badgeFont === f
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {fontLabels[f]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Background Pattern</p>
                <div className="flex gap-2 flex-wrap">
                  {bgPatterns.map((pattern) => (
                    <button
                      key={pattern}
                      type="button"
                      onClick={() => void saveBadgeCustomization(badgeColor, badgeVariant, badgeTheme, badgeFont, pattern)}
                      disabled={savingBadge}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-colors ${
                        badgeBgPattern === pattern
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
                Changes apply instantly for both you and {other?.display_name ?? "your roommate"}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date Created</p>
                <p className="text-xs font-bold text-slate-700">
                  {agreementCreatedAt
                    ? new Date(agreementCreatedAt).toLocaleDateString("en-NG", {
                        dateStyle: "long",
                      })
                    : "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Connection Members ({poolMembers.length})</p>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3">
                  {loadingPoolMembers ? (
                    <div className="text-xs text-slate-500 animate-pulse">Loading members...</div>
                  ) : (
                    poolMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-2.5">
                        <Avatar src={member.avatar_url} name={member.display_name} size="xs" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{member.display_name}</p>
                          <p className="text-[10px] text-slate-400">@{member.username || "username"}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Roomie ID</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  {!showIdRequested ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-mono text-xs tracking-wider text-slate-400 select-none">RM-••••••••</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowIdRequested(true)}
                        className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                      >
                        Unlock ID
                      </button>
                    </div>
                  ) : !usernameVerified ? (
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        To view the Roomie ID, please verify your identity by entering your username:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputUsername}
                          onChange={(e) => {
                            setInputUsername(e.target.value);
                            setUsernameError("");
                          }}
                          placeholder="Enter your username"
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const currentUsername = profile?.username || "";
                            if (!inputUsername.trim()) {
                              setUsernameError("Username is required");
                              return;
                            }
                            if (inputUsername.trim().toLowerCase() !== currentUsername.trim().toLowerCase()) {
                              setUsernameError("Incorrect username");
                              return;
                            }
                            setUsernameVerified(true);
                          }}
                          className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                        >
                          Verify
                        </button>
                      </div>
                      {usernameError && (
                        <p className="text-[10px] text-red-500 font-bold">{usernameError}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setShowIdRequested(false);
                          setInputUsername("");
                          setUsernameError("");
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-600 underline font-semibold block"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : !roomieIdVisible ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Select a roommate in this pool to request authorization from:
                      </p>
                      <div className="space-y-2">
                        {poolMembers.filter(m => m.id !== user.id).length === 0 ? (
                          <div className="text-xs text-slate-400 italic">No other roommates in this connection pool.</div>
                        ) : (
                          poolMembers.filter(m => m.id !== user.id).map((roommate) => {
                            const isSelected = selectedApprovalRoommateId === roommate.id;
                            return (
                              <div key={roommate.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <Avatar src={roommate.avatar_url} name={roommate.display_name} size="xs" />
                                  <span className="text-xs font-bold text-slate-700">{roommate.display_name}</span>
                                </div>
                                
                                {isSelected ? (
                                  approvalRequestStatus === "loading" ? (
                                    <div className="flex flex-col items-end">
                                      <div className="flex items-center gap-1 text-[10px] text-brand-600 font-bold">
                                        <svg className="animate-spin h-3.5 w-3.5 text-brand-500" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Awaiting...
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setApprovalRequestStatus("success");
                                          setRoomieIdVisible(true);
                                        }}
                                        className="text-[9px] text-brand-600 underline font-semibold mt-1"
                                      >
                                        Simulate Approval
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                                      ✓ Approved
                                    </span>
                                  )
                                ) : (
                                  <button
                                    type="button"
                                    disabled={approvalRequestStatus === "loading"}
                                    onClick={async () => {
                                      setSelectedApprovalRoommateId(roommate.id);
                                      setApprovalRequestStatus("loading");
                                      
                                      try {
                                        const myName = profile?.display_name || "Your roommate";
                                        
                                        // 1. Send push notification fallback
                                        await (supabase as any).from("notifications").insert({
                                          user_id: roommate.id,
                                          type: "ROOMIE_ID_VIEW_REQUEST",
                                          title: "Roomie ID access request",
                                          body: `${myName} is requesting approval to view the Roomie ID.`,
                                          data: { connection_id: connectionId, agreement_id: agreementId },
                                        });

                                        // 2. Find active connection to post chat message card
                                        const { data: conn } = await (supabase as any)
                                          .from("connections")
                                          .select("id")
                                          .or(`and(requester_id.eq.${user.id},receiver_id.eq.${roommate.id}),and(requester_id.eq.${roommate.id},receiver_id.eq.${user.id})`)
                                          .eq("status", "ACTIVE")
                                          .maybeSingle();

                                        if (conn) {
                                          await (supabase as any).from("messages").insert({
                                            connection_id: conn.id,
                                            sender_id: user.id,
                                            content: JSON.stringify({
                                              request_id: crypto.randomUUID(),
                                              requester_id: user.id,
                                              requester_name: myName,
                                              target_id: roommate.id,
                                              target_name: roommate.display_name,
                                              status: "pending",
                                              roomie_id: roomieId
                                            }),
                                            message_type: "roomie_id_request"
                                          });
                                        }
                                      } catch (e) {
                                        console.error("Failed to process ID request:", e);
                                        setApprovalRequestStatus("idle");
                                        setSelectedApprovalRoommateId("");
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm"
                                  >
                                    Request
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-xl">
                        <span className="font-mono text-sm font-black text-green-700 tracking-wider select-all">
                          {roomieId || "RM-NO-ID"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(roomieId || "");
                          }}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Copy Roomie ID"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-[10px] text-green-600 font-bold leading-normal">
                        ✓ Roomie ID unlocked! Note: This ID will auto-hide immediately when you exit this panel.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Info Modal */}
      {infoMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4 text-slate-800 animate-in fade-in zoom-in duration-200">
            <h3 className="font-display font-bold text-lg text-slate-900 border-b pb-2">Message Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold text-slate-500 block">Sent:</span>
                <span className="font-medium">{new Date(infoMsg.created_at).toLocaleString("en-NG", { dateStyle: "long", timeStyle: "medium" })}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Status:</span>
                <span className="font-medium">{infoMsg.read_at ? "Read" : "Delivered"}</span>
              </div>
              {infoMsg.read_at && (
                <div>
                  <span className="font-semibold text-slate-500 block">Read at:</span>
                  <span className="font-medium">{new Date(infoMsg.read_at).toLocaleString("en-NG", { dateStyle: "long", timeStyle: "medium" })}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setInfoMsg(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Everyone Confirmation Modal */}
      {deleteEveryoneMsgId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4 text-slate-800 animate-in fade-in zoom-in duration-200">
            <h3 className="font-display font-bold text-lg text-slate-900">Delete Message?</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete this message for everyone? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteEveryoneMsgId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteEveryoneMsgId) {
                    await deleteMessageForEveryone(deleteEveryoneMsgId);
                    setDeleteEveryoneMsgId(null);
                  }
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
