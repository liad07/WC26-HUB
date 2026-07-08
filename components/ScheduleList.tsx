"use client";

import { useMemo, useState } from "react";
import type { Match } from "@/types/match";
import { useFetch } from "@/lib/useFetch";
import { MatchCard } from "@/components/MatchCard";
import { MatchListSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState, ErrorState } from "@/components/common";
import { formatIsraelDate } from "@/lib/date";
import { ScheduleTimeline } from "@/components/schedule/ScheduleTimeline";

type DateFilter = "today" | "tomorrow" | "all";

interface MatchesResponse {
  matches: Match[];
}

const FILTERS: { id: DateFilter; label: string }[] = [
  { id: "today", label: "היום" },
  { id: "tomorrow", label: "מחר" },
  { id: "all", label: "כל המשחקים" },
];

/** Schedule with date filter, team search and grouping by date. */
export function ScheduleList() {
  const [filter, setFilter] = useState<DateFilter>("all");
  const [query, setQuery] = useState("");
  const endpoint = filter === "all" ? "/api/matches?date=all" : `/api/matches?date=${filter}`;
  const { data, loading, error } = useFetch<MatchesResponse>(endpoint);

  const filtered = useMemo(() => {
    const list = data?.matches ?? [];
    const q = query.trim();
    if (!q) return list;
    return list.filter(
      (m) => m.home.name.includes(q) || m.away.name.includes(q)
    );
  }, [data, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              filter === f.id
                ? "bg-pitch-accent text-black"
                : "bg-pitch-card text-gray-300 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="חיפוש לפי נבחרת…"
        className="w-full rounded-xl border border-pitch-border bg-pitch-card px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-pitch-accent focus:outline-none"
      />

      {loading ? (
        <MatchListSkeleton />
      ) : error ? (
        <ErrorState message={error} retryHref="/schedule" />
      ) : filtered.length === 0 ? (
        <EmptyState title="לא נמצאו משחקים" hint="נסו לשנות סינון או חיפוש" />
      ) : filter === "all" ? (
        <ScheduleTimeline matches={filtered} />
      ) : (
        <ScheduleGroups matches={filtered} />
      )}
    </div>
  );
}

function ScheduleGroups({ matches }: { matches: Match[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of matches) {
      const key = formatIsraelDate(m.dateISO);
      const arr = map.get(key) ?? [];
      arr.push(m);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [matches]);

  return (
    <div className="space-y-6">
      {groups.map(([date, list]) => (
        <section key={date}>
          <h2 className="mb-2 text-sm font-bold text-pitch-accent">{date}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {list
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
