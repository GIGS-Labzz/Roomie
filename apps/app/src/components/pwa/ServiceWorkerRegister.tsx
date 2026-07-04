"use client";
 
import { useEffect } from "react";
 
const REFRESH_INTERVAL = 20 * 60 * 1000; // 20 minutes
const CHECK_INTERVAL = 60 * 1000; // 1 minute
 
export function ServiceWorkerRegister() {
  useEffect(() => {
    // 1. Service Worker registration
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {
          // SW registration failures are non-fatal — app works without it
        });
    }
 
    // 2. Periodic PWA cache refresh logic
    const checkAndRefreshCache = async () => {
      if (typeof window === "undefined" || !navigator.onLine) return;
 
      const lastRefreshStr = localStorage.getItem("roomie_last_cache_refresh");
      const lastRefresh = lastRefreshStr ? parseInt(lastRefreshStr, 10) : 0;
      const now = Date.now();
 
      if (now - lastRefresh >= REFRESH_INTERVAL) {
        if ("caches" in window) {
          try {
            // Delete the existing discovery cache to clear stale data
            await caches.delete("roomie-discover");
 
            // Refetch target pages from network to let the Service Worker re-cache them
            await Promise.allSettled([
              fetch("/discover", { cache: "no-store" }),
              fetch("/feed", { cache: "no-store" }),
            ]);
 
            localStorage.setItem("roomie_last_cache_refresh", now.toString());
          } catch (err) {
            console.error("[PWA Cache] Failed to refresh cache:", err);
          }
        }
      }
    };
 
    // Run initial check after 5 seconds to avoid blocking page load
    const initialTimeout = setTimeout(() => {
      checkAndRefreshCache();
    }, 5000);
 
    // Set up periodic check interval
    const interval = setInterval(checkAndRefreshCache, CHECK_INTERVAL);
 
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);
 
  return null;
}

