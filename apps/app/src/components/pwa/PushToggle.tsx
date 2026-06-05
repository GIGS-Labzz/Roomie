"use client";

import { useEffect, useState } from "react";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    ),
  });
  return sub;
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}

export function PushToggle() {
  const [permState, setPermState] = useState<PermissionState>("default");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSub, setCurrentSub] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermState("unsupported");
      return;
    }
    setPermState(Notification.permission as PermissionState);

    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setCurrentSub(sub);
      });
    });
  }, []);

  const isEnabled = permState === "granted" && !!currentSub;

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermState(permission as PermissionState);
      if (permission !== "granted") { setIsLoading(false); return; }

      const sub = await subscribeToPush();
      if (!sub) { setIsLoading(false); return; }

      const subJson = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
        expirationTime?: number | null;
      };

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subJson),
      });

      setCurrentSub(sub);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!currentSub) return;
    setIsLoading(true);
    try {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: currentSub.endpoint }),
      });
      await currentSub.unsubscribe();
      setCurrentSub(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (permState === "unsupported") return null;

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Push notifications</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {permState === "denied"
            ? "Blocked in browser settings — enable from site permissions"
            : isEnabled
            ? "You'll be notified for messages and connections"
            : "Get notified when someone connects or messages you"}
        </p>
      </div>

      {permState === "denied" ? (
        <span className="text-xs text-slate-400 italic flex-shrink-0">Blocked</span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          disabled={isLoading}
          onClick={isEnabled ? handleDisable : handleEnable}
          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
            isEnabled ? "bg-brand-500" : "bg-slate-200"
          } disabled:opacity-60`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      )}
    </div>
  );
}
