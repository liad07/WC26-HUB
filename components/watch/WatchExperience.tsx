"use client";

import { useEffect, useMemo, useState } from "react";
import type { TvSchedule } from "@/types/tv";
import type { Match } from "@/types/match";
import { useFetch } from "@/lib/useFetch";
import { currentProgramIndex } from "@/lib/tvTime";
import { isLiveStatus } from "@/lib/format";
import { LivePlayer } from "@/components/LivePlayer";
import { FanChat } from "@/components/FanChat";
import { MatchListSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/common";
import { TvScheduleList } from "@/components/watch/TvScheduleList";
import { NoActiveMatch } from "@/components/watch/NoActiveMatch";
import { MatchPanel } from "@/components/watch/MatchPanel";
import { StreamPoster } from "@/components/watch/StreamPoster";
import { ShabbatWatchPoster } from "@/components/shabbat/ShabbatWatchPoster";
import { useShabbat } from "@/components/shabbat/ShabbatProvider";

interface WatchExperienceProps {
  streamUrl: string;
}

type FixtureResponse = { matches: Match[] };

/** Orchestrates the live channel: player, on-air schedule, live-match panel and chat. */
export function WatchExperience({ streamUrl }: WatchExperienceProps) {
  const { isShabbat, times, location } = useShabbat();
  const { data, loading, error } = useFetch<TvSchedule>("/api/tv-schedule", 300_000);
  const today = useFetch<FixtureResponse>("/api/matches?date=today", 60_000);
  const tomorrow = useFetch<FixtureResponse>("/api/matches?date=tomorrow", 300_000);

  const [now, setNow] = useState(() => Date.now());
  const [resolved, setResolved] = useState<Match | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const programs = useMemo(() => data?.programs ?? [], [data]);
  const currentIndex = useMemo(() => currentProgramIndex(programs, now), [programs, now]);
  const current = currentIndex >= 0 ? programs[currentIndex] : null;

  const teamsKey = current?.isMatch && current.teams ? current.teams.join("|") : "";

  useEffect(() => {
    if (!teamsKey) {
      setResolved(null);
      return;
    }
    const [home, away] = teamsKey.split("|");
    let active = true;
    const url = `/api/match/resolve?home=${encodeURIComponent(home)}&away=${encodeURIComponent(away)}`;
    fetch(url)
      .then((r) => r.json())
      .then((d: { match: Match | null }) => active && setResolved(d.match ?? null))
      .catch(() => active && setResolved(null));
    return () => {
      active = false;
    };
  }, [teamsKey]);

  const todayMatches = useMemo(() => today.data?.matches ?? [], [today.data]);
  const liveMatch = useMemo(
    () => resolveLiveMatch(resolved, todayMatches, current?.isMatch ?? false),
    [resolved, todayMatches, current]
  );
  const nextMatch = useMemo(
    () => findNextMatch(todayMatches, tomorrow.data?.matches ?? []),
    [todayMatches, tomorrow.data]
  );

  const mundialOnAir = Boolean(liveMatch) || current !== null;

  const chatRoom = liveMatch ? `match-${liveMatch.id}` : "mundial-general";
  const chatTitle = liveMatch
    ? `${liveMatch.home.name} נגד ${liveMatch.away.name}`
    : "צ׳אט המונדיאל";

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {isShabbat && times && location ? (
          <ShabbatWatchPoster times={times} timezone={location.timezone} />
        ) : mundialOnAir ? (
          <LivePlayer src={streamUrl} />
        ) : (
          <StreamPoster nextMatch={nextMatch} />
        )}

        {loading ? (
          <MatchListSkeleton count={2} />
        ) : error ? (
          <ErrorState message={error} retryHref="/watch" />
        ) : (
          <>
            {liveMatch ? (
              <MatchPanel summary={liveMatch} />
            ) : (
              <NoActiveMatch currentProgram={current} nextMatch={nextMatch} />
            )}
          </>
        )}
      </div>

      <aside className="space-y-4">
        {data && <TvScheduleList programs={programs} currentIndex={currentIndex} source={data.source} />}
        <FanChat roomId={chatRoom} title={chatTitle} />
      </aside>
    </div>
  );
}

/** Picks the on-air live match: the resolved broadcast fixture, or the sole live fixture. */
function resolveLiveMatch(resolved: Match | null, todayMatches: Match[], currentIsMatch: boolean): Match | null {
  if (resolved && isLiveStatus(resolved.status)) return resolved;
  const live = todayMatches.filter((m) => isLiveStatus(m.status));
  if (currentIsMatch && live.length === 1) return live[0];
  return null;
}

/** Soonest not-started fixture across today and tomorrow. */
function findNextMatch(today: Match[], tomorrow: Match[]): Match | null {
  const now = Date.now();
  return (
    [...today, ...tomorrow]
      .filter((m) => m.status === "NOT_STARTED" && m.timestamp * 1000 > now)
      .sort((a, b) => a.timestamp - b.timestamp)[0] ?? null
  );
}
