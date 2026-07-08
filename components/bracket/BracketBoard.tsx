"use client";

import { useMemo } from "react";
import type { Match } from "@/types/match";
import { useFetch } from "@/lib/useFetch";
import { buildColumns, champion, thirdPlaceMatch } from "@/lib/bracket";
import { flagUrl } from "@/lib/flags";
import { EmptyState, ErrorState } from "@/components/common";
import { MatchListSkeleton } from "@/components/LoadingSkeleton";
import { BracketMatchCard } from "@/components/bracket/BracketMatchCard";

type BracketResponse = { matches: Match[]; source: string };

/** Live knockout bracket: champion banner, ordered round columns and the third-place tie. */
export function BracketBoard() {
  const { data, loading, error } = useFetch<BracketResponse>("/api/bracket", 60_000);
  const matches = useMemo(() => data?.matches ?? [], [data]);
  const columns = useMemo(() => buildColumns(matches), [matches]);
  const third = useMemo(() => thirdPlaceMatch(matches), [matches]);
  const winner = useMemo(() => champion(matches), [matches]);

  if (loading && !data) return <MatchListSkeleton count={4} />;
  if (error) return <ErrorState message={error} retryHref="/tournament?tab=knockout" />;
  if (columns.length === 0)
    return <EmptyState title="הבראקט טרם נפתח" hint="שלב הנוקאאוט יופיע כאן ברגע שייקבע" />;

  return (
    <div className="space-y-6">
      {winner && <ChampionBanner name={winner.name} />}

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4 md:gap-6">
          {columns.map((col, ci) => (
            <div key={col.round} className="flex w-[230px] shrink-0 flex-col">
              <RoundHeader label={col.label} count={col.matches.length} />
              <div className="flex flex-1 flex-col justify-around gap-3">
                {col.matches.map((m, mi) => (
                  <BracketMatchCard key={m.id} match={m} delay={ci * 90 + mi * 45} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {third && (
        <div className="max-w-[280px]">
          <RoundHeader label="המקום השלישי" count={1} muted />
          <BracketMatchCard match={third} />
        </div>
      )}
    </div>
  );
}

function RoundHeader({ label, count, muted }: { label: string; count: number; muted?: boolean }) {
  return (
    <div
      className={`mb-3 flex items-center justify-between rounded-lg border px-3 py-1.5 ${
        muted
          ? "border-pitch-border bg-pitch-card"
          : "border-pitch-accent/30 bg-gradient-to-l from-pitch-accent/15 to-transparent"
      }`}
    >
      <span className="text-sm font-black text-white">{label}</span>
      <span className="rounded-full bg-pitch-bg px-1.5 text-[11px] font-bold text-gray-400">{count}</span>
    </div>
  );
}

function ChampionBanner({ name }: { name: string }) {
  const flag = flagUrl(name, 160);
  return (
    <div className="animate-glow-champion relative overflow-hidden rounded-2xl border border-yellow-500/50 bg-gradient-to-l from-yellow-500/15 via-pitch-card to-pitch-card p-5 text-center">
      <div className="flex items-center justify-center gap-3">
        <span className="animate-float text-4xl">🏆</span>
        {flag && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={flag}
            alt={name}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-yellow-400/70"
          />
        )}
      </div>
      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-yellow-400/80">אלופת העולם</p>
      <p className="text-gradient-gold text-2xl font-black">{name}</p>
    </div>
  );
}
