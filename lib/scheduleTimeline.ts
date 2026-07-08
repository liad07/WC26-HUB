import type { Match } from "@/types/match";
import { formatIsraelDate } from "@/lib/date";
import { isLiveStatus } from "@/lib/format";

export type TimelineEntry =
  | { kind: "day"; key: string; label: string }
  | { kind: "match"; match: Match; isScrollTarget: boolean }
  | { kind: "now" };

/** Builds chronologically ordered timeline entries with day dividers and a now marker. */
export class ScheduleTimelineBuilder {
  build(matches: Match[]): TimelineEntry[] {
    const sorted = [...matches].sort((a, b) => a.timestamp - b.timestamp);
    const nowSec = Date.now() / 1000;
    const targetId = this.scrollTargetId(sorted, nowSec);
    const nowIdx = this.nowMarkerIndex(sorted, nowSec);
    const entries: TimelineEntry[] = [];
    let flatIdx = 0;
    let lastDay = "";

    for (const match of sorted) {
      if (flatIdx === nowIdx) entries.push({ kind: "now" });
      const dayKey = formatIsraelDate(match.dateISO);
      if (dayKey !== lastDay) {
        entries.push({ kind: "day", key: dayKey, label: dayKey });
        lastDay = dayKey;
      }
      entries.push({ kind: "match", match, isScrollTarget: match.id === targetId });
      flatIdx++;
    }
    if (flatIdx === nowIdx) entries.push({ kind: "now" });
    return entries;
  }

  scrollTargetId(matches: Match[], nowSec = Date.now() / 1000): number | null {
    const upcoming = matches.find((m) => m.status === "NOT_STARTED" && m.timestamp > nowSec);
    if (upcoming) return upcoming.id;
    const played = matches.filter((m) => isLiveStatus(m.status) || m.status === "FINISHED");
    if (played.length) return played[played.length - 1].id;
    return matches[0]?.id ?? null;
  }

  private nowMarkerIndex(matches: Match[], nowSec: number): number {
    let idx = 0;
    for (const m of matches) {
      if (this.isPast(m, nowSec)) idx++;
      else break;
    }
    return idx;
  }

  isPast(match: Match, nowSec: number): boolean {
    if (isLiveStatus(match.status) || match.status === "FINISHED") return true;
    return match.timestamp <= nowSec;
  }
}

/** YouTube search deep link for match highlights. */
export function buildHighlightsUrl(home: string, away: string): string {
  const query = `${home} vs ${away} World Cup 2026 highlights`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export const scheduleTimeline = new ScheduleTimelineBuilder();
