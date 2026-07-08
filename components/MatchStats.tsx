import type { StatItem } from "@/types/match";

function toNumber(v: number | string | null): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v) || 0;
  return 0;
}

/** Comparative bar for a single statistic row. */
function StatRow({ stat }: { stat: StatItem }) {
  const home = toNumber(stat.home);
  const away = toNumber(stat.away);
  const total = home + away || 1;
  const homePct = (home / total) * 100;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-bold tabular-nums text-gray-100">{stat.home ?? 0}</span>
        <span className="text-xs text-gray-500">{stat.type}</span>
        <span className="font-bold tabular-nums text-gray-100">{stat.away ?? 0}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-pitch-border">
        <div className="bg-pitch-accent" style={{ width: `${homePct}%` }} />
        <div className="bg-sky-500" style={{ width: `${100 - homePct}%` }} />
      </div>
    </div>
  );
}

export function MatchStats({ stats }: { stats: StatItem[] }) {
  return (
    <div className="space-y-3 rounded-2xl border border-pitch-border bg-pitch-card p-4">
      {stats.map((s) => (
        <StatRow key={s.type} stat={s} />
      ))}
    </div>
  );
}
