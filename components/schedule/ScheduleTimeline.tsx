"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Match } from "@/types/match";
import { scheduleTimeline } from "@/lib/scheduleTimeline";
import { TimelineMatchRow } from "./TimelineMatchRow";

interface ScheduleTimelineProps {
  matches: Match[];
}

/** Vertical match timeline with day groups, now marker and auto-scroll to next fixture. */
export function ScheduleTimeline({ matches }: ScheduleTimelineProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrolled = useRef(false);
  const entries = useMemo(() => scheduleTimeline.build(matches), [matches]);

  useEffect(() => {
    if (scrolled.current || !scrollRef.current) return;
    scrolled.current = true;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }, [entries]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute bottom-0 right-[9px] top-0 w-px bg-pitch-border" />
      <div className="space-y-0">
        {entries.map((entry, i) => {
          if (entry.kind === "day") {
            return (
              <div key={`day-${entry.key}`} className="sticky top-14 z-20 mb-2 mt-6 first:mt-0">
                <h2 className="rounded-xl border border-pitch-border/60 bg-pitch-bg/90 px-4 py-2 text-sm font-bold text-pitch-accent backdrop-blur-sm">
                  {entry.label}
                </h2>
              </div>
            );
          }
          if (entry.kind === "now") {
            return (
              <div key={`now-${i}`} className="relative my-2 flex items-center gap-3 pe-5">
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-l from-pitch-live/60 to-transparent" />
                  <span className="shrink-0 text-xs font-black uppercase tracking-wider text-pitch-live">עכשיו</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-pitch-live/60 to-transparent" />
                </div>
                <span className="relative z-10 flex h-4 w-4 items-center justify-center">
                  <span className="absolute h-4 w-4 animate-ping rounded-full bg-pitch-live/40" />
                  <span className="relative h-3 w-3 rounded-full bg-pitch-live ring-2 ring-pitch-bg" />
                </span>
              </div>
            );
          }
          return (
            <TimelineMatchRow
              key={entry.match.id}
              match={entry.match}
              scrollRef={entry.isScrollTarget ? scrollRef : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
