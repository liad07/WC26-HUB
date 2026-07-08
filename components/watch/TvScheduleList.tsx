import type { TvKind, TvProgram } from "@/types/tv";
import { formatIsraelDate, toIsraelDateKey } from "@/lib/date";

interface TvScheduleListProps {
  programs: TvProgram[];
  currentIndex: number;
  source: "api" | "mock";
}

const KIND_ICON: Record<TvKind, string> = {
  match: "⚽",
  pre: "🎙️",
  post: "🎬",
  studio: "📺",
};

/** World Cup broadcast schedule with live highlight, kind markers and day dividers. */
export function TvScheduleList({ programs, currentIndex, source }: TvScheduleListProps) {
  const todayKey = toIsraelDateKey();

  return (
    <div className="rounded-2xl border border-pitch-border bg-pitch-card">
      <div className="flex items-center justify-between border-b border-pitch-border px-4 py-3">
        <div>
          <h2 className="font-bold text-white">לוח שידורים · מונדיאל 2026</h2>
          <p className="text-xs text-gray-500">השידור נפתח עם האולפן המקדים, כחצי שעה עד שעה לפני המשחק</p>
        </div>
        <span className="text-2xl">🏆</span>
      </div>

      <div className="max-h-[440px] overflow-y-auto p-2">
        {programs.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">אין שידורי מונדיאל כרגע</p>
        ) : (
          <ul className="space-y-1">
            {programs.map((p, i) => {
              const dayKey = toIsraelDateKey(new Date(p.startTs));
              const prevKey = i > 0 ? toIsraelDateKey(new Date(programs[i - 1].startTs)) : dayKey;
              const showDivider = i === 0 || dayKey !== prevKey;
              return (
                <li key={`${p.startTs}-${i}`}>
                  {showDivider && dayKey !== todayKey && (
                    <p className="px-3 pb-1 pt-2 text-[11px] font-bold text-pitch-accent">
                      {formatIsraelDate(new Date(p.startTs).toISOString())}
                    </p>
                  )}
                  <ProgramRow program={p} live={i === currentIndex} />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {source === "mock" && (
        <p className="border-t border-pitch-border px-4 py-2 text-[11px] text-gray-600">
          לוח משוער — לא נטען מהמקור החי.
        </p>
      )}
    </div>
  );
}

function ProgramRow({ program, live }: { program: TvProgram; live: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
        live ? "bg-pitch-live/10 ring-1 ring-pitch-live/40" : "hover:bg-pitch-bg/60"
      }`}
    >
      <div className="w-12 shrink-0 text-center">
        <span className={`text-sm font-bold tabular-nums ${live ? "text-pitch-live" : "text-gray-300"}`}>
          {program.start}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-100">
          <span className="mr-1">{KIND_ICON[program.kind]}</span>
          {program.subtitle ?? program.title}
        </p>
        <p className="truncate text-xs text-gray-500">{program.title}</p>
      </div>
      {live && (
        <span className="inline-flex items-center gap-1 rounded-full bg-pitch-live/20 px-2 py-0.5 text-[11px] font-bold text-pitch-live">
          <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-pitch-live" />
          עכשיו
        </span>
      )}
    </div>
  );
}
