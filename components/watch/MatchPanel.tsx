"use client";

import Link from "next/link";
import type { Match } from "@/types/match";
import { useFetch } from "@/lib/useFetch";
import { isLiveStatus } from "@/lib/format";
import { teamImageSrc } from "@/lib/flags";
import { LiveBadge } from "@/components/common";
import { LiveClock } from "@/components/LiveClock";
import { MatchEvents } from "@/components/MatchEvents";
import { Lineups } from "@/components/Lineups";
import { MatchStats } from "@/components/MatchStats";

/** Full live-match panel for the on-air broadcast: score, minute, events, formations and stats. */
export function MatchPanel({ summary }: { summary: Match }) {
  const { data, loading } = useFetch<{ match: Match }>(`/api/match/${summary.id}`, 60_000);
  const match = data?.match ?? summary;
  const live = isLiveStatus(match.status);

  return (
    <section className="overflow-hidden rounded-2xl border border-pitch-accent/40 bg-pitch-card">
      <div className="flex items-center justify-between border-b border-pitch-border bg-pitch-accent/10 px-4 py-2.5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-pitch-accent">⚽ המשחק שמשודר עכשיו</h2>
        {live && (
          <div className="flex items-center gap-2">
            <LiveClock
              elapsed={match.elapsed}
              extra={match.elapsedExtra}
              status={match.status}
              className="rounded-full bg-pitch-live px-2 py-0.5 text-xs font-black text-white"
            />
            <LiveBadge label="בשידור" />
          </div>
        )}
      </div>

      <div className="p-4">
        <MatchHeader match={match} live={live} />

        <MatchMeta match={match} />

        {loading && !data && <p className="mt-4 text-center text-sm text-gray-500">טוען פרטי משחק…</p>}

        <div className="mt-5 space-y-5">
          {match.events && match.events.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold text-gray-200">אירועים</h3>
              <MatchEvents events={match.events} home={match.home} />
            </div>
          )}

          {match.lineups && match.lineups.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold text-gray-200">הרכבים</h3>
              <Lineups lineups={match.lineups} />
            </div>
          )}

          {match.statistics && match.statistics.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold text-gray-200">סטטיסטיקות</h3>
              <MatchStats stats={match.statistics} />
            </div>
          )}

          <Link
            href={`/match/${match.id}`}
            className="block rounded-lg bg-pitch-accent px-4 py-2 text-center text-sm font-bold text-black transition hover:brightness-110"
          >
            לעמוד המשחק המלא ←
          </Link>
        </div>
      </div>
    </section>
  );
}

function MatchHeader({ match, live }: { match: Match; live: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <TeamSide name={match.home.name} logo={match.home.logo} />
      <div className="flex flex-col items-center px-2">
        <span className={`text-3xl font-black tabular-nums ${live ? "text-pitch-live" : "text-white"}`}>
          {match.goalsHome ?? 0} : {match.goalsAway ?? 0}
        </span>
        {match.status === "HALF_TIME" ? (
          <span className="mt-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-sm font-black text-amber-400">
            מחצית
          </span>
        ) : live && match.elapsed != null ? (
          <span className="mt-1 flex items-center gap-1 rounded-full bg-pitch-live/15 px-2.5 py-0.5 text-base font-black text-pitch-live">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-live rounded-full bg-pitch-live" />
            <LiveClock elapsed={match.elapsed} extra={match.elapsedExtra} status={match.status} />
          </span>
        ) : (
          <span className="text-[11px] text-gray-500">{match.statusLabel}</span>
        )}
      </div>
      <TeamSide name={match.away.name} logo={match.away.logo} />
    </div>
  );
}

/** Compact stadium/referee row shown under the score. */
function MatchMeta({ match }: { match: Match }) {
  const venue = match.venue ? (match.city ? `${match.venue}, ${match.city}` : match.venue) : null;
  if (!venue && !match.referee) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
      {venue && <span>🏟️ {venue}</span>}
      {match.referee && <span>🧑‍⚖️ שופט: {match.referee}</span>}
    </div>
  );
}

function TeamSide({ name, logo }: { name: string; logo?: string }) {
  const src = teamImageSrc({ name, logo: logo ?? "" }, 80);
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        width={52}
        height={38}
        loading="lazy"
        className="h-[38px] w-[52px] rounded object-cover shadow"
      />
      <span className="text-sm font-bold text-gray-100">{name}</span>
    </div>
  );
}
