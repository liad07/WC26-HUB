import type { Match } from "@/types/match";

export const ROUND_ORDER = [
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Final",
] as const;

const THIRD_PLACE = "Play-off for third place";

const ROUND_HE: Record<string, string> = {
  "Round of 32": "שלב ה-32",
  "Round of 16": "שמינית הגמר",
  "Quarter-final": "רבע הגמר",
  "Semi-final": "חצי הגמר",
  Final: "הגמר",
  [THIRD_PLACE]: "המקום השלישי",
};

export interface BracketColumn {
  round: string;
  label: string;
  matches: Match[];
}

export function roundLabel(round: string): string {
  return ROUND_HE[round] ?? round;
}

/** Groups knockout fixtures into ordered bracket columns (skipping empty rounds). */
export function buildColumns(matches: Match[]): BracketColumn[] {
  const columns: BracketColumn[] = [];
  for (const round of ROUND_ORDER) {
    const roundMatches = matches
      .filter((m) => m.round === round)
      .sort((a, b) => a.timestamp - b.timestamp);
    if (roundMatches.length > 0) {
      columns.push({ round, label: roundLabel(round), matches: roundMatches });
    }
  }
  return columns;
}

export function thirdPlaceMatch(matches: Match[]): Match | null {
  return matches.find((m) => m.round === THIRD_PLACE) ?? null;
}

/** Winning team of a finished match, or null (undecided / draw). */
export function winnerOf(match: Match): "home" | "away" | null {
  if (match.status !== "FINISHED" || match.goalsHome == null || match.goalsAway == null) return null;
  if (match.goalsHome === match.goalsAway) return null;
  return match.goalsHome > match.goalsAway ? "home" : "away";
}

/** The tournament champion once the final is decided, else null. */
export function champion(matches: Match[]): Match["home"] | null {
  const final = matches.find((m) => m.round === "Final");
  if (!final) return null;
  const side = winnerOf(final);
  if (!side) return null;
  return side === "home" ? final.home : final.away;
}
