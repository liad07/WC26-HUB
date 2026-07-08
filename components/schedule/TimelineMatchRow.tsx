import type { RefObject } from "react";
import Link from "next/link";
import type { Match } from "@/types/match";
import { isLiveStatus } from "@/lib/format";
import { formatIsraelTime } from "@/lib/date";
import { LiveBadge, StatusPill, TeamCrest } from "@/components/common";

interface TimelineMatchRowProps {
  match: Match;
  scrollRef?: RefObject<HTMLDivElement | null>;
}

/** Compact timeline row linking to match detail with kickoff, score and status. */
export function TimelineMatchRow({ match, scrollRef }: TimelineMatchRowProps) {
  const live = isLiveStatus(match.status);
  const played = live || match.status === "FINISHED";

  return (
    <div ref={scrollRef} className="relative flex gap-3">
      <Link
        href={`/match/${match.id}`}
        className="card card-hover group relative mb-3 flex flex-1 items-center gap-3 overflow-hidden p-3 sm:p-4"
      >
        <div className="pointer-events-none absolute inset-x-0 -top-12 h-20 bg-brand-radial opacity-0 transition group-hover:opacity-100" />
        <span className="w-14 shrink-0 text-center text-sm font-bold tabular-nums text-gray-400">
          {formatIsraelTime(match.dateISO)}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <TeamBlock team={match.home} />
          <div className="flex min-w-[56px] flex-col items-center">
            {played ? (
              <span
                className={`rounded-lg px-2 py-0.5 text-lg font-black tabular-nums sm:text-xl ${
                  live ? "text-pitch-live" : "text-white"
                }`}
              >
                {match.goalsHome ?? 0} : {match.goalsAway ?? 0}
              </span>
            ) : (
              <span className="text-xs font-semibold text-gray-500">מול</span>
            )}
          </div>
          <TeamBlock team={match.away} align="end" />
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <span className="max-w-[120px] truncate text-xs text-gray-500">{match.round || match.leagueName}</span>
          {live ? (
            <LiveBadge label={match.status === "HALF_TIME" ? "מחצית" : `${match.elapsed ?? ""}'`} />
          ) : (
            <StatusPill status={match.status} label={match.statusLabel} />
          )}
        </div>
      </Link>
      <div className="relative flex w-5 shrink-0 justify-center pt-5">
        <div
          className={`relative z-10 h-3 w-3 rounded-full ring-2 ring-pitch-bg ${
            live ? "bg-pitch-live" : played ? "bg-gray-500" : "bg-pitch-accent"
          }`}
        />
      </div>
    </div>
  );
}

function TeamBlock({
  team,
  align = "start",
}: {
  team: Match["home"];
  align?: "start" | "end";
}) {
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2 ${align === "end" ? "flex-row-reverse" : ""}`}>
      <span className="rounded-full bg-white/5 p-0.5 ring-1 ring-white/10">
        <TeamCrest team={team} size={32} />
      </span>
      <span className="truncate text-sm font-bold text-gray-100">{team.name}</span>
    </div>
  );
}
