"use client";

import type { HousingPlatform } from "@repo/db/queries/housing";

interface PlatformCardProps {
  platform: HousingPlatform;
  connectionId: string;
  roomieId?: string | null;
  roommateUsername?: string | null;
  agreementId?: string | null;
}

export function PlatformCard({
  platform,
  connectionId,
  roomieId,
  roommateUsername,
  agreementId,
}: PlatformCardProps) {
  const trackClick = () => {
    const payload = JSON.stringify({ connectionId });
    const url = `/api/platforms/${platform.id}/click`;

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      return;
    }

    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  };

  // Construct final URL with query parameters for roomie identity and roommate agreement mapping
  let finalUrl = platform.url;
  try {
    const urlObj = new URL(platform.url);
    if (roomieId) {
      urlObj.searchParams.set("roomie_id", roomieId);
    }
    if (roommateUsername) {
      urlObj.searchParams.set("roommate_id", roommateUsername);
    }
    if (agreementId) {
      urlObj.searchParams.set("agreement_id", agreementId);
    }
    finalUrl = urlObj.toString();
  } catch (e) {
    console.error("Invalid platform URL:", e);
  }

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-sage-surface text-sm font-bold text-brand-700">
          {platform.logo_url ? (
            <img src={platform.logo_url} alt="" className="h-full w-full rounded-2xl object-cover" />
          ) : (
            platform.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-bold text-slate-900">{platform.name}</h2>
            {/* Verified Badge */}
            <div className="group relative flex items-center">
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-0.5 text-emerald-600 cursor-help" aria-label="Verified provider by Roomie">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-lg bg-slate-950 px-2.5 py-1.5 text-center text-[11px] font-medium text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 pointer-events-none shadow-md">
                Verified provider by Roomie
                <div className="absolute top-full left-1/2 -mt-1 h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-slate-950"></div>
              </div>
            </div>
            {platform.is_featured && (
              <span className="rounded-full bg-peach-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                Featured
              </span>
            )}
          </div>
          {platform.description && (
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{platform.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {platform.cities.slice(0, 3).map((city) => (
          <span key={city} className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
            {city}
          </span>
        ))}
        {(platform.campus_tags ?? []).slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            {tag}
          </span>
        ))}
      </div>

      <a
        href={finalUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackClick}
        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
      >
        Visit provider
      </a>
    </article>
  );
}
