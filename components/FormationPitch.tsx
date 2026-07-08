"use client";

import { useState } from "react";
import type { LineupInfo, LineupPlayer } from "@/types/match";

/** Splits the starting XI into pitch rows based on the formation string. */
function buildRows(players: LineupPlayer[], formation: string | null): LineupPlayer[][] {
  const nums = (formation ?? "")
    .split(/[^0-9]+/)
    .map(Number)
    .filter((n) => n > 0);
  const total = nums.reduce((a, b) => a + b, 0);

  const lines: LineupPlayer[][] = [];
  let idx = 0;
  if (total === players.length) {
    for (const n of nums) {
      lines.push(players.slice(idx, idx + n));
      idx += n;
    }
  } else if (total === players.length - 1) {
    lines.push([players[0]]);
    idx = 1;
    for (const n of nums) {
      lines.push(players.slice(idx, idx + n));
      idx += n;
    }
  } else {
    return chunk(players, Math.ceil(players.length / 4)).reverse();
  }
  return lines.reverse();
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Visual football pitch rendering a team's starting XI by formation, plus bench. */
export function FormationPitch({ lineup }: { lineup: LineupInfo }) {
  const rows = buildRows(lineup.startXI, lineup.formation);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-white">{lineup.teamName}</span>
        {lineup.formation && (
          <span className="rounded-full bg-pitch-bg px-2 py-0.5 text-xs font-bold text-pitch-accent">
            {lineup.formation}
          </span>
        )}
      </div>

      <div className="relative flex min-h-[380px] flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-emerald-900 bg-gradient-to-b from-emerald-700/80 to-emerald-900/90 px-1.5 py-5 sm:min-h-[520px] sm:px-3">
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-white/15 sm:inset-3" />
        <div className="pointer-events-none absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/15 sm:inset-x-3" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 sm:h-20 sm:w-20" />
        <div className="pointer-events-none absolute left-1/2 top-2 h-8 w-24 -translate-x-1/2 rounded-b-lg border border-white/15 sm:top-3 sm:h-11 sm:w-36" />
        <div className="pointer-events-none absolute bottom-2 left-1/2 h-8 w-24 -translate-x-1/2 rounded-t-lg border border-white/15 sm:bottom-3 sm:h-11 sm:w-36" />
        {rows.map((row, i) => (
          <div key={i} className="relative flex items-start justify-evenly gap-1">
            {row.map((p) => (
              <PlayerChip key={p.id} player={p} />
            ))}
          </div>
        ))}
      </div>

      {lineup.coach && <p className="mt-2 text-xs text-gray-400">מאמן: {lineup.coach}</p>}

      {lineup.substitutes.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-bold text-gray-400">ספסל</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {lineup.substitutes.map((p) => (
              <span key={p.id} className="text-xs text-gray-400">
                <span className="font-bold text-gray-300">{p.number}</span> {p.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Player surname (last token) for compact pitch labels. */
function surname(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

function PlayerChip({ player }: { player: LineupPlayer }) {
  const [broken, setBroken] = useState(false);
  const showPhoto = player.photo && !broken;

  return (
    <div className="flex min-w-0 flex-1 basis-0 flex-col items-center gap-1 px-0.5">
      <div className="relative h-[56px] w-9 overflow-hidden rounded-lg border border-white/25 bg-emerald-950/70 shadow-md ring-1 ring-black/20 sm:h-[78px] sm:w-12">
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.photo as string}
            alt={player.name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-base font-black text-white/90 sm:text-xl">
            {player.number}
          </div>
        )}
        <span className="absolute bottom-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-tl-md bg-pitch-accent px-1 text-[9px] font-black text-black sm:h-5 sm:min-w-5 sm:text-[10px]">
          {player.number}
        </span>
      </div>
      <span
        title={player.name}
        className="line-clamp-2 max-w-full break-words text-center text-[9px] font-semibold leading-tight text-white drop-shadow sm:text-[10px]"
      >
        {surname(player.name)}
      </span>
    </div>
  );
}
