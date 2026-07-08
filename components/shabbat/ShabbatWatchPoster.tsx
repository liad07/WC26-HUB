"use client";

import type { ShabbatTimes } from "@/lib/shabbat/types";
import { formatShabbatClock } from "@/lib/shabbat/format";
import { getShabbatConfig } from "@/lib/shabbat/config";

interface ShabbatWatchPosterProps {
  times: ShabbatTimes;
  timezone: string;
}

/** Replaces the live player on /watch during Shabbat. */
export function ShabbatWatchPoster({ times, timezone }: ShabbatWatchPosterProps) {
  const config = getShabbatConfig();
  const havdalahLabel = formatShabbatClock(config.locale, timezone, times.havdalah);

  return (
    <div className="card relative aspect-video overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pitch-bg via-pitch-card to-pitch-elevated" />
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-brand-radial" />

      <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-4xl" aria-hidden>
          🕯️
        </span>
        <div>
          <p className="eyebrow mb-1">שבת שלום</p>
          <h2 className="text-xl font-black text-white sm:text-2xl">
            השידור החי אינו זמין <span className="brand-text">בשבת</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm text-gray-400">
          לוח השידורים והמידע הסטטי זמינים לאחר צאת השבת — משוער ב־
          <span className="font-bold text-pitch-gold">{havdalahLabel}</span>
        </p>
      </div>
    </div>
  );
}
