"use client";

import { useState } from "react";
import { Shield, Key, Check, X } from "lucide-react";

interface RoomieIdRequestCardProps {
  messageId: string;
  requestId: string;
  requesterId: string;
  requesterName: string;
  targetId: string;
  targetName: string;
  roomieId: string;
  initialStatus: string;
  currentUserId: string;
}

export function RoomieIdRequestCard({
  messageId,
  requesterId,
  requesterName,
  targetId,
  targetName,
  initialStatus,
  currentUserId,
}: RoomieIdRequestCardProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (approve: boolean) => {
    setIsProcessing(true);
    setError("");
    try {
      const response = await fetch(`/api/messages/${messageId}/roomie-id-request`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: approve ? "approve" : "decline" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to update request");
      setStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request");
    } finally {
      setIsProcessing(false);
    }
  };

  const isRequester = currentUserId === requesterId;
  const isTarget = currentUserId === targetId;

  return (
    <div className="my-2 mx-auto w-full max-w-sm bg-white border border-slate-100 rounded-2xl shadow-md p-4 text-slate-800 space-y-3 transition-all hover:shadow-lg">
      <div className="flex items-start gap-2.5">
        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
          <Key className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Roomie ID Access
          </h4>
          <p className="text-sm font-bold text-slate-900 mt-0.5 leading-normal">
            {isRequester
              ? `You requested to view the Roomie ID from ${targetName}.`
              : `${requesterName} is requesting approval to view the Roomie ID.`}
          </p>
        </div>
      </div>

      {status === "pending" && (
        <div className="pt-1 border-t border-slate-50">
          {isTarget ? (
            <div className="space-y-2">
              <div className="flex gap-2.5">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAction(true)}
                  className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAction(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Decline
                </button>
              </div>
              {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Awaiting response from {targetName}...
            </p>
          )}
        </div>
      )}

      {status === "approved" && (
        <div className="pt-2 border-t border-slate-50 flex items-center gap-1.5 text-xs text-green-600 font-bold">
          <Check className="w-4 h-4" />
          <span>Approved by {isTarget ? "you" : targetName}</span>
        </div>
      )}

      {status === "declined" && (
        <div className="pt-2 border-t border-slate-50 flex items-center gap-1.5 text-xs text-red-500 font-bold">
          <X className="w-4 h-4" />
          <span>Declined by {isTarget ? "you" : targetName}</span>
        </div>
      )}
    </div>
  );
}
