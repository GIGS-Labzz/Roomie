"use client";

import { useEffect, useState } from "react";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not defined");
    return null;
  }

  // Await ready state with a 3-second timeout to prevent hanging forever
  const reg = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Service worker activation timed out")), 3000)
    ),
  ]).catch((err) => {
    console.error("Failed to get active service worker:", err);
    return null;
  });

  if (!reg) return null;

  try {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
    return sub;
  } catch (err) {
    console.error("Error subscribing to push notifications:", err);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  if (!base64String) return new ArrayBuffer(0);
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

    // Check if already subscribed without hanging
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        reg.pushManager.getSubscription().then((sub) => {
          setCurrentSub(sub);
        }).catch((err) => {
          console.error("Error getting push subscription:", err);
        });
      }
    }).catch((err) => {
      console.error("Error checking service worker registration:", err);
    });
  }, []);

  const isEnabled = permState === "granted" && !!currentSub;

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermState(permission as PermissionState);
      if (permission !== "granted") {
        setIsLoading(false);
        return;
      }

      const sub = await subscribeToPush();
      if (!sub) {
        alert("Could not subscribe to push notifications. Ensure your browser supports them and the service worker is active.");
        setIsLoading(false);
        return;
      }

      const subJson = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
        expirationTime?: number | null;
      };

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subJson),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save subscription on server");
      }

      setCurrentSub(sub);
    } catch (err: any) {
      console.error("Failed to enable push notifications:", err);
      alert(err?.message || "Failed to enable push notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!currentSub) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: currentSub.endpoint }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to remove subscription from server");
      }

      await currentSub.unsubscribe();
      setCurrentSub(null);
    } catch (err: any) {
      console.error("Failed to disable push notifications:", err);
      alert(err?.message || "Failed to disable push notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasVapidKey = typeof window !== "undefined" ? !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : true;

  if (permState === "unsupported") return null;

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Push notifications</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {!hasVapidKey
            ? "Push notifications are not configured on the server (VAPID key missing)"
            : permState === "denied"
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
          disabled={isLoading || !hasVapidKey}
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
