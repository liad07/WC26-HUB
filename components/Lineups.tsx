import type { LineupInfo } from "@/types/match";
import { FormationPitch } from "./FormationPitch";

/** Side-by-side formation pitches for both teams. */
export function Lineups({ lineups }: { lineups: LineupInfo[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {lineups.map((l) => (
        <div key={l.teamId} className="rounded-2xl border border-pitch-border bg-pitch-card p-4">
          <FormationPitch lineup={l} />
        </div>
      ))}
    </div>
  );
}
