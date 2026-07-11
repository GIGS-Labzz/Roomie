"use client";

import { useEffect, useState } from "react";
import { Modal } from "@repo/ui/modal";
import { LottieIcon } from "@repo/ui/lottie-icon";
import matchFoundAnimation from "@repo/animations/match-found";
import { createClient } from "@repo/db/client";

const supabase = createClient();

interface CongratsModalProps {
  agreementId?: string | null;
  roomieId?: string | null;
  roommateName?: string | null;
}

function storageKey(agreementId: string) {
  return `roomie_celebrated_${agreementId}`;
}

export function CongratsModal({ agreementId, roomieId, roommateName }: CongratsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPool, setIsPool] = useState(false);

  useEffect(() => {
    if (!agreementId || !roomieId) return;
    if (!window.localStorage.getItem(storageKey(agreementId))) {
      setIsOpen(true);
      
      const checkPool = async () => {
        try {
          const { data } = await (supabase as any)
            .from("roommate_agreements")
            .select("pool_roomie_id")
            .eq("id", agreementId)
            .maybeSingle();
          if (data?.pool_roomie_id) {
            setIsPool(true);
          }
        } catch (e) {
          console.error("Failed to check pool status:", e);
        }
      };
      void checkPool();
    }
  }, [agreementId, roomieId]);

  const handleClose = () => {
    if (agreementId) window.localStorage.setItem(storageKey(agreementId), "true");
    setIsOpen(false);
  };

  if (!agreementId || !roomieId) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-sm">
      <div className="flex flex-col items-center gap-4 text-center py-2">
        <div className="h-32 w-32">
          <LottieIcon
            animationData={matchFoundAnimation}
            size={128}
            loop={false}
            autoplay
            className="h-full w-full"
          />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            {isPool ? "Joined Roomie Pool! 🎉" : "Congrats, you are now Roomies! 🎉"}
          </h2>
          <p className="max-w-xs text-sm text-slate-500">
            {isPool
              ? `You and other pool members have confirmed your roommate agreement. Housing providers are now unlocked for everyone in the pool.`
              : roommateName
              ? `You and ${roommateName} have confirmed your roommate agreement. Housing providers are now unlocked for both of you.`
              : "You've confirmed your roommate agreement. Housing providers are now unlocked."}
          </p>
        </div>

        <div className="w-full rounded-2xl border border-brand-100 bg-sage-surface px-4 py-3.5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-600">
            Your Roomie ID
          </p>
          <p className="font-mono text-lg font-bold tracking-wide text-slate-900">{roomieId}</p>
        </div>

        <button
          onClick={handleClose}
          className="mt-2 w-full rounded-2xl bg-brand-500 py-3 font-bold text-white transition-colors hover:bg-brand-600"
        >
          Continue
        </button>
      </div>
    </Modal>
  );
}
