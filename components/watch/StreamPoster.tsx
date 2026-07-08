import Link from "next/link";
import type { Match } from "@/types/match";
import { Countdown } from "@/components/Countdown";
import { Icon } from "@/components/Icon";
import { formatIsraelTime, toIsraelDateKey } from "@/lib/date";

interface StreamPosterProps {
  nextMatch: Match | null;
}

/** Player-shaped cinematic placeholder shown when no Mundial content is on air. */
export function StreamPoster({ nextMatch }: StreamPosterProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-pitch-border bg-black shadow-xl shadow-black/40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-pitch-brand/15 via-black/40 to-black" />
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-56 bg-brand-radial" />
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient shadow-glow">
          <Icon name="play" size={28} className="text-white" />
        </span>

        <h3 className="mt-4 text-lg font-black text-white sm:text-2xl">
          אין כרגע שידור חי של המונדיאל
        </h3>
        <p className="mt-1.5 max-w-md text-xs text-gray-400 sm:text-sm">
          הערוץ יחזור לשידור סביב משחקי גביע העולם 2026 — כאן, ב-World Cup Hub.
        </p>

        {nextMatch ? (
          <div className="mt-5 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-pitch-accent">
              המשחק הבא · {kickoffLabel(nextMatch)}
            </span>
            <Countdown target={nextMatch.dateISO} />
          </div>
        ) : (
          <Link href="/schedule" className="btn-ghost mt-5">
            <Icon name="calendar" size={16} />
            ללוח המשחקים
          </Link>
        )}
      </div>
    </div>
  );
}

function kickoffLabel(match: Match): string {
  const time = formatIsraelTime(match.dateISO);
  const isToday = toIsraelDateKey(new Date(match.dateISO)) === toIsraelDateKey();
  return isToday ? `היום ${time}` : `מחר ${time}`;
}
