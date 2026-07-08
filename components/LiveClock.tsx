"use client";

import { useEffect, useState } from "react";
import type { MatchStatus } from "@/types/match";

interface LiveClockProps {
  elapsed: number | null;
  extra?: number | null;
  status: MatchStatus;
  className?: string;
}

/** Live match clock that interpolates seconds locally between API minute updates and shows stoppage time. */
export function LiveClock({ elapsed, extra, status, className = "" }: LiveClockProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick(0);
  }, [elapsed, status]);

  useEffect(() => {
    if (status !== "LIVE") return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [status, elapsed]);

  if (status === "HALF_TIME") return <span className={className}>מחצית</span>;
  if (elapsed == null) return null;

  const minute = elapsed + Math.floor(tick / 60);
  const second = tick % 60;
  const mm = String(minute).padStart(2, "0");
  const ss = String(second).padStart(2, "0");

  return (
    <span className={`inline-flex items-baseline gap-0.5 ${className}`}>
      <span className="tabular-nums">
        {mm}:{ss}
      </span>
      {extra ? <span className="text-[0.7em] font-bold opacity-80">+{extra}</span> : null}
    </span>
  );
}
