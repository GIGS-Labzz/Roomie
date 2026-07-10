"use client";

import { useState } from "react";

declare global {
  interface Window {
    PaystackPop?: new () => {
      resumeTransaction: (accessCode: string) => void;
      newTransaction: (config: PaystackTransactionConfig) => void;
    };
    Paystack?: new () => {
      resumeTransaction: (accessCode: string) => void;
      newTransaction: (config: PaystackTransactionConfig) => void;
    };
  }
}

interface PaystackTransactionConfig {
  key?: string;
  accessCode: string;
  onSuccess: (transaction: { reference: string }) => void;
  onCancel: () => void;
}

interface PaystackButtonProps {
  agreementId: string;
  connectionId: string;
  className?: string;
  disabled?: boolean;
  onStarted?: () => void;
  onConfirmed?: () => void;
}

function loadPaystackScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Browser unavailable"));
    if (window.PaystackPop || window.Paystack) return resolve();

    const existing = document.querySelector<HTMLScriptElement>("script[data-paystack-inline]");
    if (existing) {
      if (existing.dataset.loaded === "true") { resolve(); return; }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Paystack failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.dataset.paystackInline = "true";
    script.onload = () => { script.dataset.loaded = "true"; resolve(); };
    script.onerror = () => reject(new Error("Paystack failed to load"));
    document.body.appendChild(script);
  });
}

export function PaystackButton({
  agreementId,
  connectionId,
  className = "",
  disabled = false,
  onStarted,
  onConfirmed,
}: PaystackButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (isLoading || disabled) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/agreements/${agreementId}/accept`, { method: "POST" });
      const data = await response.json() as {
        confirmed?: boolean;
        accessCode?: string;
        reference?: string;
        authorizationUrl?: string;
        error?: string;
      };

      if (!response.ok) throw new Error(data.error ?? "Could not start payment");

      // Already paid — skip straight to housing
      if (data.confirmed) {
        onConfirmed?.();
        window.location.href = `/housing?connectionId=${connectionId}`;
        return;
      }

      if (!data.accessCode) throw new Error("No access code returned from server");

      if (data.accessCode.startsWith("mock_")) {
        onStarted?.();
        setTimeout(async () => {
          try {
            const confirmRes = await fetch(`/api/agreements/${agreementId}/confirm`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: data.reference }),
            });
            if (confirmRes.ok) {
              onConfirmed?.();
            }
          } finally {
            window.location.href = `/housing?connectionId=${connectionId}&celebrate=1`;
          }
        }, 1500);
        return;
      }

      await loadPaystackScript();

      const PaystackCheckout = window.PaystackPop ?? window.Paystack;
      if (!PaystackCheckout) {
        // Fallback: full-page redirect (no callbacks possible, webhook must confirm)
        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
          return;
        }
        throw new Error("Paystack checkout is unavailable");
      }

      const paymentReference = data.reference ?? "";
      onStarted?.();

      const popup = new PaystackCheckout();
      popup.newTransaction({
        accessCode: data.accessCode,
        onSuccess: async (transaction) => {
          const ref = transaction.reference || paymentReference;
          try {
            const confirmRes = await fetch(`/api/agreements/${agreementId}/confirm`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: ref }),
            });
            // Whether confirm succeeded or failed, the webhook will also fire.
            // Navigate to housing — it will show providers if either path confirmed the agreement.
            if (confirmRes.ok) {
              onConfirmed?.();
            }
          } finally {
            window.location.href = `/housing?connectionId=${connectionId}&celebrate=1`;
          }
        },
        onCancel: () => {
          // User closed the popup before paying — keep the card in PENDING state
          setError("Payment cancelled. You can try again.");
          setIsLoading(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`inline-flex w-full items-center justify-center rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {isLoading ? "Opening payment…" : "Accept & pay ₦2,000"}
      </button>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
