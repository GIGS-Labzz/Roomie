"use client";

import { useEffect, useState } from "react";
import { Modal } from "@repo/ui/modal";
import { LottieIcon } from "@repo/ui/lottie-icon";
import matchFoundAnimation from "@repo/animations/match-found";

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

  useEffect(() => {
    if (!agreementId || !roomieId) return;
    if (!window.localStorage.getItem(storageKey(agreementId))) {
      setIsOpen(true);
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
            Congrats, you are now Roomies! 🎉
          </h2>
          <p className="max-w-xs text-sm text-slate-500">
            {roommateName ? `You and ${roommateName} have` : "You've"} confirmed your roommate
            agreement. Housing providers are now unlocked for both of you.
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
