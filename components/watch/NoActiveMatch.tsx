import Link from "next/link";
import type { Match } from "@/types/match";
import type { TvKind, TvProgram } from "@/types/tv";
import { Countdown } from "@/components/Countdown";
import { TeamCrest } from "@/components/common";
import { Icon } from "@/components/Icon";
import { formatIsraelTime, toIsraelDateKey } from "@/lib/date";

interface NoActiveMatchProps {
  currentProgram: TvProgram | null;
  nextMatch: Match | null;
}

const KIND_LABEL: Record<TvKind, string> = {
  match: "שידור משחק",
  pre: "אולפן מקדים",
  post: "אולפן מסכם",
  studio: "אולפן המונדיאל",
};

/** Shown on /watch when no World Cup match is live: context + countdown to next match. */
export function NoActiveMatch({ currentProgram, nextMatch }: NoActiveMatchProps) {
  const context = describeContext(currentProgram);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-pitch-card/70 p-6 text-center shadow-card sm:p-8">
      <div className="pointer-events-none absolute inset-x-0 -top-20 h-40 bg-brand-radial" />
      <div className="relative">
        <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-3xl ring-1 ring-white/10">
          ⏳
        </span>
        <h3 className="text-xl font-black text-white">אין כרגע משחק חי</h3>
        <p className="mt-1 text-sm text-gray-400">
          {context ? "השידור ממשיך סביב המשחקים —" : "הערוץ ישדר את המונדיאל סביב המשחקים."}{" "}
          {context && <span className="font-bold text-pitch-accent">{context}</span>}
        </p>

        {nextMatch ? (
          <div className="mt-6">
            <p className="eyebrow mb-3">המשחק הבא מתחיל בעוד</p>
            <div className="flex justify-center">
              <Countdown target={nextMatch.dateISO} />
            </div>

            <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-4">
              <TeamMini name={nextMatch.home.name} logo={nextMatch.home.logo} id={nextMatch.home.id} />
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-white">{kickoffLabel(nextMatch)}</span>
                <span className="text-[11px] text-gray-500">{nextMatch.round || nextMatch.leagueName}</span>
              </div>
              <TeamMini name={nextMatch.away.name} logo={nextMatch.away.logo} id={nextMatch.away.id} />
            </div>

            <Link href="/schedule" className="btn-ghost mt-6">
              <Icon name="calendar" size={16} />
              ללוח המלא
            </Link>
          </div>
        ) : (
          <p className="mt-6 text-sm text-gray-600">אין משחק קרוב בלוח כרגע.</p>
        )}
      </div>
    </div>
  );
}

/** A short Hebrew label for the current Mundial studio/rerun, or null. */
function describeContext(program: TvProgram | null): string | null {
  if (!program) return null;
  const text = `${program.title} ${program.subtitle ?? ""}`;
  if (/שידור חוזר/.test(text)) return "כרגע: שידור חוזר";
  return `כרגע: ${KIND_LABEL[program.kind]}`;
}

function kickoffLabel(match: Match): string {
  const time = formatIsraelTime(match.dateISO);
  const isToday = toIsraelDateKey(new Date(match.dateISO)) === toIsraelDateKey();
  return isToday ? `היום · ${time}` : `מחר · ${time}`;
}

function TeamMini({ name, logo, id }: { name: string; logo: string; id: number }) {
  return (
    <div className="flex w-24 flex-col items-center gap-1.5 text-center">
      <span className="rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10">
        <TeamCrest team={{ id, name, logo }} size={44} />
      </span>
      <span className="text-sm font-bold text-gray-100">{name}</span>
    </div>
  );
}
