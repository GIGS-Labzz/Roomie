"use client";

import { useEffect } from "react";
import { createClient } from "@repo/db/client";
import { useAuth } from "@/context/AuthContext";

const supabase = createClient();

function getPlatform() {
  if (typeof window === "undefined") return "Unknown";
  const ua = window.navigator.userAgent;
  if (/android/i.test(ua)) return "Android";
  if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}

export function PwaInstallTracker() {
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const logInstall = async (source: "event" | "standalone") => {
      const isLogged = localStorage.getItem("roomie_pwa_install_logged");
      if (isLogged === "true") return;

      const platform = getPlatform();
      const ua = window.navigator.userAgent;

      try {
        const { error } = await (supabase as any).from("pwa_installs").insert({
          user_id: user?.id || null,
          platform,
          user_agent: ua,
        });

        if (!error) {
          localStorage.setItem("roomie_pwa_install_logged", "true");
        }
      } catch (err) {
        console.error(`Failed to log PWA installation from ${source}:`, err);
      }
    };

    // 1. Listen for the appinstalled event (fired on Android/Chrome/Edge/Windows/macOS when user accepts install prompt)
    const handleAppInstalled = () => {
      void logInstall("event");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // 2. Check if the app is currently running in standalone (PWA) mode (covers iOS and pre-install launches)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      void logInstall("standalone");
    }

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [user]);

  return null;
}
