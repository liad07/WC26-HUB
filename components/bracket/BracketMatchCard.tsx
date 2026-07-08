"use client";

import type { Match, TeamInfo } from "@/types/match";
import { flagUrl } from "@/lib/flags";
import { isLiveStatus } from "@/lib/format";
import { formatIsraelTime } from "@/lib/date";
import { winnerOf } from "@/lib/bracket";

/** A single knockout tie: two teams, scores, live/kickoff state and winner highlight. */
export function BracketMatchCard({ match, delay = 0 }: { match: Match; delay?: number }) {
  const live = isLiveStatus(match.status);
  const played = live || match.status === "FINISHED";
  const win = winnerOf(match);

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`group animate-fade-up overflow-hidden rounded-xl border bg-gradient-to-b from-pitch-card to-pitch-bg/70 shadow-lg transition duration-300 hover:-translate-y-0.5 hover:border-pitch-accent/50 hover:shadow-pitch-accent/10 ${
        live ? "animate-glow-live border-pitch-live/60" : "border-pitch-border"
      }`}
    >
      <div className="flex items-center justify-between px-2.5 pt-1.5">
        <span className="text-[10px] font-semibold text-gray-500">
          {played ? "" : formatIsraelTime(match.dateISO)}
        </span>
        {live ? (
          <LiveChip match={match} />
        ) : match.status === "FINISHED" ? (
          <span className="text-[9px] font-bold text-gray-500">הסתיים</span>
        ) : (
          <span className="text-[9px] text-gray-600">{shortDate(match.dateISO)}</span>
        )}
      </div>

      <TeamRow team={match.home} score={match.goalsHome} isWinner={win === "home"} dim={win === "away"} showScore={played} />
      <div className="mx-2.5 h-px bg-pitch-border/70" />
      <TeamRow team={match.away} score={match.goalsAway} isWinner={win === "away"} dim={win === "home"} showScore={played} />
    </div>
  );
}

function TeamRow({
  team,
  score,
  isWinner,
  dim,
  showScore,
}: {
  team: TeamInfo;
  score: number | null;
  isWinner: boolean;
  dim: boolean;
  showScore: boolean;
}) {
  const named = Boolean(team.name);
  const flag = named ? flagUrl(team.name, 40) : null;
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1.5 ${
        isWinner ? "text-white" : dim ? "text-gray-500" : "text-gray-200"
      }`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pitch-bg ring-1 ring-white/15">
        {flag ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={flag} alt={team.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] text-gray-500">?</span>
        )}
      </span>
      <span className={`min-w-0 flex-1 truncate text-[13px] ${isWinner ? "font-black" : "font-semibold"}`}>
        {named ? team.name : "טרם נקבע"}
      </span>
      {isWinner && <span className="text-[10px] text-pitch-accent">✓</span>}
      {showScore && (
        <span className={`w-5 text-center text-sm tabular-nums ${isWinner ? "font-black text-pitch-accent" : "font-bold"}`}>
          {score ?? "-"}
        </span>
      )}
    </div>
  );
}

function LiveChip({ match }: { match: Match }) {
  const label = match.status === "HALF_TIME" ? "מחצית" : match.elapsed != null ? `${match.elapsed}′` : "LIVE";
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-pitch-live px-1.5 py-0.5 text-[9px] font-black text-white">
      <span className="h-1 w-1 animate-pulse-live rounded-full bg-white" />
      {label}
    </span>
  );
}

function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("he-IL", { timeZone: "Asia/Jerusalem", day: "numeric", month: "numeric" }).format(
    new Date(iso)
  );
}
