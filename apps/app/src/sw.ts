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
