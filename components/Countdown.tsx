"use client";

import { useEffect, useState } from "react";

interface Part {
  label: string;
  value: number;
}

/** Live ticking countdown to a target ISO date, rendered as day/hour/min/sec cells. */
export function Countdown({ target }: { target: string }) {
  const [parts, setParts] = useState<Part[]>(() => compute(target));

  useEffect(() => {
    const id = setInterval(() => setParts(compute(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {parts.map((p) => (
        <div key={p.label} className="flex flex-col items-center">
          <span className="grid min-w-[3rem] place-items-center rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-xl font-black tabular-nums text-white sm:text-2xl">
            {String(p.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

function compute(target: string): Part[] {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const sec = Math.floor(diff / 1000);
  return [
    { label: "ימים", value: Math.floor(sec / 86400) },
    { label: "שעות", value: Math.floor((sec % 86400) / 3600) },
    { label: "דקות", value: Math.floor((sec % 3600) / 60) },
    { label: "שניות", value: sec % 60 },
  ];
}
