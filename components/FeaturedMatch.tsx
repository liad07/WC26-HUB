import Link from "next/link";
import type { Match } from "@/types/match";
import { isLiveStatus } from "@/lib/format";
import { formatIsraelTime } from "@/lib/date";
import { LiveBadge, StatusPill, TeamCrest } from "@/components/common";
import { Icon } from "@/components/Icon";

/** Cinematic hero card for the standout match, over the trophy backdrop. */
export function FeaturedMatch({ match }: { match: Match }) {
  const live = isLiveStatus(match.status);
  const played = live || match.status === "FINISHED";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-card">
      <div className="absolute inset-0 bg-[url('/images/hero-trophy.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-pitch-bg via-pitch-bg/85 to-pitch-bg/45" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_120%,rgba(99,102,241,0.25),transparent_70%)]" />

      <div className="relative flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          {live ? (
            <LiveBadge label={match.status === "HALF_TIME" ? "מחצית" : `${match.elapsed ?? ""}'`} />
          ) : (
            <StatusPill status={match.status} label={match.statusLabel} />
          )}
          <span className="text-xs font-bold text-gray-300">{match.round || match.leagueName}</span>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-10">
          <TeamBlock name={match.home.name} logo={match.home.logo} teamId={match.home.id} />

          <div className="flex flex-col items-center">
            {played ? (
              <span className={`text-4xl font-black tabular-nums sm:text-6xl ${live ? "text-white" : "text-white"}`}>
                {match.goalsHome ?? 0} <span className="text-gray-600">-</span> {match.goalsAway ?? 0}
              </span>
            ) : (
              <span className="text-3xl font-black tabular-nums text-white sm:text-5xl">
                {formatIsraelTime(match.dateISO)}
              </span>
            )}
            {live && match.status !== "HALF_TIME" && (
              <span className="mt-1 text-sm font-black text-pitch-live">{match.elapsed}′</span>
            )}
          </div>

          <TeamBlock name={match.away.name} logo={match.away.logo} teamId={match.away.id} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/watch" className="btn-primary">
            <Icon name="play" size={16} />
            צפו בשידור
          </Link>
          <Link href={`/match/${match.id}`} className="btn-ghost">
            מרכז המשחק
          </Link>
        </div>
      </div>
    </div>
  );
}

function TeamBlock({ name, logo, teamId }: { name: string; logo: string; teamId: number }) {
  return (
    <div className="flex w-24 flex-col items-center gap-2 text-center sm:w-36">
      <span className="rounded-2xl bg-white/5 p-2 ring-1 ring-white/10 backdrop-blur">
        <TeamCrest team={{ id: teamId, name, logo }} size={56} />
      </span>
      <span className="text-sm font-black text-white sm:text-lg">{name}</span>
    </div>
  );
}
