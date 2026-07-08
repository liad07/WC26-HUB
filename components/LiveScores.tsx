"use client";

import type { Match } from "@/types/match";
import { useFetch } from "@/lib/useFetch";
import { MatchCard } from "@/components/MatchCard";
import { MatchListSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState, ErrorState } from "@/components/common";

interface LiveResponse {
  count: number;
  matches: Match[];
}

/** Auto-refreshing (30s) grid of live matches. */
export function LiveScores() {
  const { data, loading, error } = useFetch<LiveResponse>("/api/live", 30_000);

  if (loading) return <MatchListSkeleton />;
  if (error) return <ErrorState message={error} retryHref="/live" />;
  if (!data || data.matches.length === 0) {
    return <EmptyState title="אין משחקים חיים כרגע" hint="חזרו מאוחר יותר לתוצאות בזמן אמת" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="h-2 w-2 animate-pulse-live rounded-full bg-pitch-live" />
        מתעדכן אוטומטית כל 30 שניות · {data.count} משחקים חיים
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
    </div>
  );
}
