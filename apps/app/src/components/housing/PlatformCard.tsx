"use client";

import type { HousingPlatform } from "@repo/db/queries/housing";

interface PlatformCardProps {
  platform: HousingPlatform;
  connectionId: string;
}

export function PlatformCard({ platform, connectionId }: PlatformCardProps) {
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
        href={platform.url}
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
