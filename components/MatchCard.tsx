import Link from "next/link";
import type { Match } from "@/types/match";
import { isLiveStatus } from "@/lib/format";
import { formatIsraelTime } from "@/lib/date";
import { LiveBadge, StatusPill, TeamCrest } from "@/components/common";

interface MatchCardProps {
  match: Match;
  featured?: boolean;
}

/** Compact fixture card linking to the match page, with score or kickoff time. */
export function MatchCard({ match, featured = false }: MatchCardProps) {
  const live = isLiveStatus(match.status);
  const played = live || match.status === "FINISHED";

  return (
    <Link
      href={`/match/${match.id}`}
      className={`card card-hover group relative block overflow-hidden p-4 ${
        featured ? "ring-1 ring-pitch-brand/40" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 -top-16 h-24 bg-brand-radial opacity-0 transition group-hover:opacity-100" />

      <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
        <span className="truncate font-semibold text-gray-500">{match.round || match.leagueName}</span>
        {live ? (
          <LiveBadge label={match.status === "HALF_TIME" ? "מחצית" : `${match.elapsed ?? ""}'`} />
        ) : (
          <StatusPill status={match.status} label={match.statusLabel} />
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <TeamSide name={match.home.name} logo={match.home.logo} teamId={match.home.id} />

        <div className="flex min-w-[68px] flex-col items-center">
          {played ? (
            <span
              className={`rounded-xl px-2.5 py-1 text-2xl font-black tabular-nums ${
                live ? "bg-pitch-live/10 text-pitch-live" : "bg-white/5 text-white"
              }`}
            >
              {match.goalsHome ?? 0} : {match.goalsAway ?? 0}
            </span>
          ) : (
            <span className="rounded-xl bg-white/5 px-3 py-1 text-lg font-black tabular-nums text-gray-100">
              {formatIsraelTime(match.dateISO)}
            </span>
          )}
        </div>

        <TeamSide name={match.away.name} logo={match.away.logo} teamId={match.away.id} />
      </div>
    </Link>
  );
}

function TeamSide({ name, logo, teamId }: { name: string; logo: string; teamId: number }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 text-center">
      <span className="rounded-full bg-white/5 p-1 ring-1 ring-white/10">
        <TeamCrest team={{ id: teamId, name, logo }} size={42} />
      </span>
      <span className="text-sm font-bold text-gray-100">{name}</span>
    </div>
  );
}
