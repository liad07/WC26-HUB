"use client";

import { useShabbat } from "@/components/shabbat/ShabbatProvider";
import { formatShabbatClock } from "@/lib/shabbat/format";
import { getShabbatConfig } from "@/lib/shabbat/config";

/** Compact Shabbat status chip for sidebar and footer. */
export function ShabbatIndicator({ compact = false }: { compact?: boolean }) {
  const { isShabbat, isApproaching, times, location } = useShabbat();
  const config = getShabbatConfig();

  if (!config.enabled || (!isShabbat && !isApproaching) || !times || !location) return null;

  const label = isShabbat
    ? `שבת · עד ${formatShabbatClock(config.locale, location.timezone, times.havdalah)}`
    : `נרות ${formatShabbatClock(config.locale, location.timezone, times.candleLighting)}`;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-pitch-gold/15 px-2 py-0.5 text-[10px] font-bold text-pitch-gold">
        <span aria-hidden>🕯️</span>
        {isShabbat ? "שבת" : "לפני שבת"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-pitch-gold/25 bg-pitch-gold/10 px-3 py-2 text-xs font-bold text-pitch-gold">
      <span aria-hidden>🕯️</span>
      <span>{label}</span>
    </div>
  );
}
