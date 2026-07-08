import type { StandingGroup } from "@/types/match";
import { TeamCrest } from "@/components/common";

/** Renders a single group standings table with qualification highlights. */
export function StandingsTable({ group }: { group: StandingGroup }) {
  const hasQualified = group.rows.some((r) => r.qualified);
  return (
    <div className="overflow-hidden rounded-2xl border border-pitch-border bg-pitch-card">
      <div className="border-b border-pitch-border bg-pitch-bg/40 px-4 py-2.5">
        <h3 className="text-sm font-bold text-pitch-accent">{group.group}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">נבחרת</th>
              <th className="px-2 py-2 text-center font-medium">מש׳</th>
              <th className="px-2 py-2 text-center font-medium">נצ׳</th>
              <th className="px-2 py-2 text-center font-medium">תק׳</th>
              <th className="px-2 py-2 text-center font-medium">הפ׳</th>
              <th className="px-2 py-2 text-center font-medium">הפרש</th>
              <th className="px-2 py-2 text-center font-bold text-gray-300">נק׳</th>
            </tr>
          </thead>
          <tbody>
            {group.rows.map((row) => (
              <tr
                key={row.team.id}
                className={`border-t border-pitch-border/60 ${row.qualified ? "bg-pitch-accent/5" : ""}`}
              >
                <td className="py-2.5 pr-3 pl-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-black tabular-nums ${
                      row.qualified ? "bg-pitch-accent/20 text-pitch-accent" : "text-gray-400"
                    }`}
                  >
                    {row.rank}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <TeamCrest team={row.team} size={22} />
                    <span className="font-semibold text-gray-100">{row.team.name}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center tabular-nums text-gray-400">{row.played}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-gray-400">{row.win}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-gray-400">{row.draw}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-gray-400">{row.lose}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-gray-400">
                  {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                </td>
                <td className="px-2 py-2.5 text-center font-black tabular-nums text-white">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasQualified && (
        <div className="flex items-center gap-2 border-t border-pitch-border px-4 py-2 text-xs text-gray-500">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-pitch-accent/60" />
          עלו לשלב הבא
        </div>
      )}
    </div>
  );
}
