import type { EventItem, TeamInfo } from "@/types/match";
import { eventMeta, formatMinute } from "@/lib/format";
import { EmptyState } from "@/components/common";

interface MatchEventsProps {
  events: EventItem[];
  home: TeamInfo;
}

/** Timeline of match events, aligned by home/away side. */
export function MatchEvents({ events, home }: MatchEventsProps) {
  if (!events.length) {
    return <EmptyState title="אין אירועים עדיין" hint="האירועים יופיעו כאן במהלך המשחק" />;
  }

  return (
    <ul className="space-y-2">
      {events.map((e, i) => {
        const meta = eventMeta(e.type);
        const isHome = e.teamId === home.id;
        return (
          <li
            key={i}
            className={`flex items-center gap-3 rounded-xl border border-pitch-border bg-pitch-card px-3 py-2 ${
              isHome ? "flex-row" : "flex-row-reverse text-left"
            }`}
          >
            <span className="w-10 shrink-0 text-center text-sm font-bold tabular-nums text-gray-400">
              {formatMinute(e.minute, e.extra)}
            </span>
            <span className="text-xl">{meta.icon}</span>
            <div className={`flex-1 ${isHome ? "text-right" : "text-left"}`}>
              <p className="text-sm font-semibold text-gray-100">{e.player ?? meta.label}</p>
              <p className="text-xs text-gray-500">
                {meta.label}
                {e.assist ? ` · בישול: ${e.assist}` : ""} · {e.teamName}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
