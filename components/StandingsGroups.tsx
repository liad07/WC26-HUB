import { StandingsTable } from "@/components/StandingsTable";
import { EmptyState, ErrorState } from "@/components/common";
import type { StandingGroup } from "@/types/match";

/** Shared grid of every group standings table with empty/error fallbacks. */
export function StandingsGroups({ groups, failed }: { groups: StandingGroup[]; failed: boolean }) {
  if (failed) return <ErrorState message="לא ניתן לטעון טבלאות כרגע" retryHref="/tournament" />;
  if (groups.length === 0)
    return <EmptyState title="אין טבלאות זמינות" hint="הטבלאות יופיעו עם תחילת הטורניר" />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {groups.map((g) => (
        <StandingsTable key={g.group} group={g} />
      ))}
    </div>
  );
}
