import Link from "next/link";
import { notFound } from "next/navigation";
import { matchProvider } from "@/lib/matchProvider";
import { formatIsraelDate, formatIsraelTime } from "@/lib/date";
import { isLiveStatus } from "@/lib/format";
import { EmptyState, SectionHeader, StatusPill, TeamCrest } from "@/components/common";
import { LiveClock } from "@/components/LiveClock";
import { MatchEvents } from "@/components/MatchEvents";
import { Lineups } from "@/components/Lineups";
import { MatchStats } from "@/components/MatchStats";
import { FanChat } from "@/components/FanChat";
import { HighlightsLink } from "@/components/schedule/HighlightsLink";

export const dynamic = "force-dynamic";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const { data: match } = await matchProvider.getFixtureById(numericId);
  if (!match) notFound();

  const live = isLiveStatus(match.status);
  const finished = match.status === "FINISHED";
  const played = live || finished;

  return (
    <div className="space-y-6">
      <Link href="/schedule" className="text-sm font-bold text-pitch-accent transition hover:brightness-110">
        → חזרה ללוח המשחקים
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-pitch-card/80 p-6 shadow-card">
        <div className="pointer-events-none absolute inset-x-0 -top-20 h-40 bg-brand-radial" />
        <div className="relative mb-5 flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold">{match.round || match.leagueName}</span>
          {live ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pitch-live/15 px-2.5 py-0.5 text-xs font-black text-pitch-live ring-1 ring-pitch-live/30">
              <span className="h-2 w-2 animate-pulse-live rounded-full bg-pitch-live" />
              <LiveClock elapsed={match.elapsed} extra={match.elapsedExtra} status={match.status} />
            </span>
          ) : (
            <StatusPill status={match.status} label={match.statusLabel} />
          )}
        </div>

        <div className="relative flex items-center justify-between gap-3">
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <span className="rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
              <TeamCrest team={match.home} size={64} />
            </span>
            <span className="font-black text-white">{match.home.name}</span>
          </div>
          <div className="flex flex-col items-center">
            {played ? (
              <span className={`text-4xl font-black tabular-nums sm:text-5xl ${live ? "text-pitch-live" : "text-white"}`}>
                {match.goalsHome ?? 0} : {match.goalsAway ?? 0}
              </span>
            ) : (
              <>
                <span className="text-2xl font-black text-white sm:text-3xl">{formatIsraelTime(match.dateISO)}</span>
                <span className="text-xs text-gray-500">{formatIsraelDate(match.dateISO)}</span>
              </>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <span className="rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
              <TeamCrest team={match.away} size={64} />
            </span>
            <span className="font-black text-white">{match.away.name}</span>
          </div>
        </div>

        <dl className="relative mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-3">
          <InfoItem label="מועד" value={`${formatIsraelDate(match.dateISO)} · ${formatIsraelTime(match.dateISO)}`} />
          {match.venue && <InfoItem label="אצטדיון" value={match.city ? `${match.venue}, ${match.city}` : match.venue} />}
          {match.referee && <InfoItem label="שופט" value={match.referee} />}
        </dl>

        {finished && (
          <div className="relative mt-5 flex justify-center border-t border-white/10 pt-4">
            <HighlightsLink home={match.home.name} away={match.away.name} />
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="אירועים" />
        <MatchEvents events={match.events ?? []} home={match.home} />
      </section>

      {played && (
        <section>
          <SectionHeader title="הרכבים" />
          {match.lineups && match.lineups.length > 0 ? (
            <Lineups lineups={match.lineups} />
          ) : (
            <EmptyState title="אין נתוני הרכב" hint="ההרכבים לא זמינים למשחק זה" />
          )}
        </section>
      )}

      {played && (
        <section>
          <SectionHeader title="סטטיסטיקות" />
          {match.statistics && match.statistics.length > 0 ? (
            <MatchStats stats={match.statistics} />
          ) : (
            <EmptyState title="אין סטטיסטיקות" hint="הנתונים לא זמינים למשחק זה" />
          )}
        </section>
      )}

      <section>
        <SectionHeader title="צ׳אט המשחק" />
        <FanChat roomId={`match-${match.id}`} title={`${match.home.name} נגד ${match.away.name}`} />
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-semibold text-gray-100">{value}</dd>
    </div>
  );
}
