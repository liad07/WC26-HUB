"use client";

import { useMemo } from "react";
import type { Match } from "@/types/match";
import { useFetch } from "@/lib/useFetch";
import { champion } from "@/lib/bracket";
import { buildBracketView } from "@/lib/bracketTree";
import { flagUrl } from "@/lib/flags";
import { EmptyState, ErrorState } from "@/components/common";
import { MatchListSkeleton } from "@/components/LoadingSkeleton";
import { BracketMatchCard } from "@/components/bracket/BracketMatchCard";
import { BracketConnectors } from "@/components/bracket/BracketConnectors";

type BracketResponse = { matches: Match[]; source: string };

/** Live knockout bracket: champion banner, tree columns with feeder connectors. */
export function BracketBoard() {
  const { data, loading, error } = useFetch<BracketResponse>("/api/bracket", 60_000);
  const matches = useMemo(() => data?.matches ?? [], [data]);
  const view = useMemo(() => buildBracketView(matches), [matches]);
  const winner = useMemo(() => champion(matches), [matches]);

  if (loading && !data) return <MatchListSkeleton count={4} />;
  if (error) return <ErrorState message={error} retryHref="/tournament?tab=knockout" />;
  if (view.rounds.length === 0)
    return <EmptyState title="הבראקט טרם נפתח" hint="שלב הנוקאאוט יופיע כאן ברגע שייקבע" />;

  return (
    <div className="space-y-6">
      {winner && <ChampionBanner name={winner.name} />}

      <div className="overflow-x-auto pb-4">
        <div dir="rtl" className="inline-flex min-w-max items-start gap-0 px-1">
          {view.rounds.map((round, index) => (
            <div key={round.round} className="flex items-start">
              <BracketRoundColumn round={round} totalHeight={view.totalHeight} delayBase={index * 90} />
              {index < view.rounds.length - 1 && (
                <BracketConnectors
                  left={round}
                  right={view.rounds[index + 1]}
                  height={view.totalHeight}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {view.thirdPlace && (
        <div className="max-w-[280px]">
          <RoundHeader label="המקום השלישי" count={1} muted />
          <BracketMatchCard match={view.thirdPlace} />
        </div>
      )}
    </div>
  );
}

function BracketRoundColumn({
  round,
  totalHeight,
  delayBase,
}: {
  round: ReturnType<typeof buildBracketView>["rounds"][number];
  totalHeight: number;
  delayBase: number;
}) {
  return (
    <div className="w-[220px] shrink-0 md:w-[230px]">
      <RoundHeader label={round.label} count={round.slots.length} />
      <div className="relative" style={{ height: totalHeight }}>
        {round.slots.map((slot, index) => (
          <div
            key={slot.match.id}
            className="absolute inset-x-0"
            style={{ top: slot.topPx }}
          >
            <BracketMatchCard match={slot.match} delay={delayBase + index * 45} />
          </div>
        ))}
      </div>
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
