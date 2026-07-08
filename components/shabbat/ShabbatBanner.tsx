"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { useShabbat } from "@/components/shabbat/ShabbatProvider";
import { formatShabbatClock } from "@/lib/shabbat/format";
import { getShabbatConfig } from "@/lib/shabbat/config";

/** Subtle pre-Shabbat warning before candle lighting. */
export function ShabbatBanner() {
  const { isApproaching, times, location } = useShabbat();
  const [dismissed, setDismissed] = useState(false);
  const config = getShabbatConfig();

  if (!isApproaching || dismissed || !times || !location) return null;

  const lightingLabel = formatShabbatClock(config.locale, location.timezone, times.candleLighting);

  return (
    <div className="fixed inset-x-0 top-0 z-[9998] px-4 pt-3 lg:mr-64">
      <div className="card mx-auto flex max-w-3xl items-center justify-between gap-3 border-pitch-gold/30 bg-pitch-elevated/95 px-4 py-3 shadow-glow">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-lg" aria-hidden>
            🕯️
          </span>
          <p className="text-sm text-gray-200">
            <span className="font-bold text-pitch-gold">הדלקת נרות ב־{lightingLabel}</span>
            <span className="hidden sm:inline"> — האתר ייסגר לכבוד שבת עם כניסתה</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
          aria-label="סגור התראה"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}
