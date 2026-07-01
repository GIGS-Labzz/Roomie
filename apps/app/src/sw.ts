/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Google Fonts — immutable, cache forever
    {
      matcher: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: new CacheFirst({ cacheName: "roomie-fonts" }),
    },
    // Supabase storage (avatars, student IDs) — serve cached, revalidate in bg
    {
      matcher: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
      handler: new StaleWhileRevalidate({ cacheName: "roomie-avatars" }),
    },
    // lh3.googleusercontent.com avatars
    {
      matcher: /^https:\/\/lh3\.googleusercontent\.com\/.*/i,
      handler: new StaleWhileRevalidate({ cacheName: "roomie-avatars" }),
    },
    // Chat & payment routes — never cache (must be live)
    {
      matcher: /^\/(chat|api\/payments|api\/agreements)/,
      handler: new NetworkOnly(),
    },
    // Discovery & feed pages — network first, fall back to cache
    {
      matcher: /^\/(discover|feed)/,
      handler: new NetworkFirst({ cacheName: "roomie-discover" }),
    },
    // Remaining Next.js default caching
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// Handle incoming push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || "Roomie";
    const options = {
      body: payload.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [100, 50, 100],
      data: payload.data || {},
      actions: [
        { action: "open", title: "Open Chat" }
      ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Error receiving push notification:", err);
  }
});

// Handle notification clicks (e.g. redirect user directly to the relevant chat page)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const connectionId = event.notification.data?.connection_id;
  const targetUrl = connectionId ? `/chat/${connectionId}` : "/discover";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, navigate it to targetUrl and focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.navigate(targetUrl).then((focusedClient) => focusedClient?.focus());
        }
      }
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
