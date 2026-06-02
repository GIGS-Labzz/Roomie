"use client";

import { useState } from "react";

declare global {
  interface Window {
    Paystack?: new () => {
      resumeTransaction: (accessCode: string) => void;
    };
    PaystackPop?: new () => {
      resumeTransaction: (accessCode: string) => void;
    };
  }
}

interface PaystackButtonProps {
  agreementId: string;
  className?: string;
  disabled?: boolean;
  onStarted?: () => void;
}

function loadPaystackScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Browser unavailable"));
    if (window.Paystack || window.PaystackPop) return resolve();

    const existing = document.querySelector<HTMLScriptElement>("script[data-paystack-inline]");
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Paystack failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.dataset.paystackInline = "true";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Paystack failed to load"));
    document.body.appendChild(script);
  });
}

export function PaystackButton({ agreementId, className = "", disabled = false, onStarted }: PaystackButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (isLoading || disabled) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/agreements/${agreementId}/accept`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Could not start payment");
      if (data.confirmed) {
        window.location.href = "/housing";
        return;
      }

      await loadPaystackScript();
      const PaystackCheckout = window.Paystack ?? window.PaystackPop;
      if (!PaystackCheckout) {
        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
          return;
        }
        throw new Error("Paystack checkout is unavailable");
      }

      const popup = new PaystackCheckout();
      popup.resumeTransaction(data.accessCode);
      onStarted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {isLoading ? "Starting payment..." : "Accept and pay NGN 2,000"}
      </button>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
