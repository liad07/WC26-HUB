"use client";

import { Icon } from "@/components/Icon";
import { useShabbat } from "@/components/shabbat/ShabbatProvider";
import { formatShabbatClock } from "@/lib/shabbat/format";
import { getShabbatConfig } from "@/lib/shabbat/config";

/** Full-screen Shabbat closure overlay, styled for World Cup Hub. */
export function ShabbatOverlay() {
  const { isShabbat, times, location } = useShabbat();
  const config = getShabbatConfig();

  if (!isShabbat || !times || !location) return null;

  const havdalahLabel = formatShabbatClock(config.locale, location.timezone, times.havdalah);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-pitch-bg/95 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shabbat-overlay-title"
    >
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-brand-radial" />

      <div className="card glass relative w-full max-w-lg animate-fade-up p-8 text-center shadow-card">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient shadow-glow">
          <span className="text-3xl" aria-hidden>
            🕯️
          </span>
        </div>

        <p className="eyebrow mb-2">שבת שלום</p>
        <h1 id="shabbat-overlay-title" className="text-2xl font-black text-white sm:text-3xl">
          האתר אינו פעיל <span className="brand-text">בשבת</span>
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-gray-400">
          World Cup Hub נסגר לכבוד שבת קודש. השידורים, הצ׳אט והפעולות האינטראקטיביות יחודשו לאחר צאת השבת.
        </p>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs font-bold text-gray-500">צאת השבת משוערת</p>
          <p className="mt-1 text-lg font-black text-pitch-gold">{havdalahLabel}</p>
        </div>

        <a
          href="https://www.hebcal.com/shabbat"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost mt-6 inline-flex text-xs"
        >
          <Icon name="info" size={14} className="text-pitch-accent" />
          זמני שבת ב־Hebcal
        </a>
      </div>
    </div>
  );
}
