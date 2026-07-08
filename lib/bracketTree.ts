import type { Match, TeamInfo } from "@/types/match";
import { roundLabel, winnerOf } from "@/lib/bracket";

export const BRACKET_CARD_HEIGHT = 76;
export const BRACKET_GAP = 10;
export const BRACKET_UNIT = BRACKET_CARD_HEIGHT + BRACKET_GAP;

const THIRD_PLACE = "Play-off for third place";

const R32_FEEDERS: readonly (readonly [number, number])[] = [
  [74, 77],
  [73, 75],
  [76, 78],
  [79, 80],
  [81, 82],
  [83, 84],
  [85, 87],
  [86, 88],
];

const R16_FEEDERS: readonly (readonly [number, number])[] = [
  [89, 90],
  [91, 92],
  [93, 94],
  [95, 96],
];

const QF_FEEDERS: readonly (readonly [number, number])[] = [
  [97, 98],
  [99, 100],
];

const SF_FEEDERS: readonly [number, number] = [101, 102];

export const ROUND_SLOT_NUMBERS: Record<string, number[]> = {
  "Round of 32": R32_FEEDERS.flat(),
  "Round of 16": R16_FEEDERS.flat(),
  "Quarter-final": QF_FEEDERS.flat(),
  "Semi-final": SF_FEEDERS,
  Final: [104],
  [THIRD_PLACE]: [103],
};

const ROUND_DEPTH: Record<string, number> = {
  "Round of 32": 0,
  "Round of 16": 1,
  "Quarter-final": 2,
  "Semi-final": 3,
  Final: 4,
};

const DISPLAY_ROUNDS = [
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Final",
] as const;

export interface BracketSlot {
  match: Match;
  slot: number;
  topPx: number;
}

export interface BracketRoundView {
  round: string;
  label: string;
  depth: number;
  slots: BracketSlot[];
}

export interface BracketView {
  rounds: BracketRoundView[];
  thirdPlace: Match | null;
  totalHeight: number;
}

/** Builds a positioned knockout tree using FIFA match numbers and feeder paths. */
export function buildBracketView(matches: Match[]): BracketView {
  const resolved = hydrateBracketMatches(matches);
  const byNumber = indexByMatchNumber(resolved);
  const rounds: BracketRoundView[] = [];

  for (const round of DISPLAY_ROUNDS) {
    const numbers = ROUND_SLOT_NUMBERS[round];
    const slots: BracketSlot[] = [];
    numbers.forEach((num, slot) => {
      const match = byNumber.get(num);
      if (!match) return;
      slots.push({
        match,
        slot,
        topPx: slotTop(ROUND_DEPTH[round], slot),
      });
    });
    if (slots.length > 0) {
      rounds.push({
        round,
        label: roundLabel(round),
        depth: ROUND_DEPTH[round],
        slots,
      });
    }
  }

  return {
    rounds,
    thirdPlace: byNumber.get(103) ?? resolved.find((m) => m.round === THIRD_PLACE) ?? null,
    totalHeight: 16 * BRACKET_UNIT,
  };
}

/** Replaces FIFA placeholder labels with winners/losers from finished parent ties. */
export function hydrateBracketMatches(matches: Match[]): Match[] {
  const byNumber = indexByMatchNumber(matches);
  return matches.map((match) => ({
    ...match,
    home: resolveTeamSlot(match.home, byNumber) ?? match.home,
    away: resolveTeamSlot(match.away, byNumber) ?? match.away,
  }));
}

function indexByMatchNumber(matches: Match[]): Map<number, Match> {
  const map = new Map<number, Match>();
  for (const match of matches) {
    if (match.matchNumber != null) map.set(match.matchNumber, match);
  }
  return map;
}

function resolveTeamSlot(team: TeamInfo, byNumber: Map<number, Match>): TeamInfo | null {
  const winner = team.name.match(/^W(\d+)$/i);
  if (winner) {
    const parent = byNumber.get(Number(winner[1]));
    if (!parent) return null;
    const side = winnerOf(parent);
    if (!side) return null;
    return side === "home" ? parent.home : parent.away;
  }

  const runnerUp = team.name.match(/^RU(\d+)$/i);
  if (runnerUp) {
    const parent = byNumber.get(Number(runnerUp[1]));
    if (!parent) return null;
    const side = winnerOf(parent);
    if (!side) return null;
    return side === "home" ? parent.away : parent.home;
  }

  if (!team.name) return null;
  return null;
}

function slotTop(depth: number, slot: number): number {
  const block = BRACKET_UNIT * 2 ** depth;
  return slot * block + (block - BRACKET_CARD_HEIGHT) / 2;
}

export function feederPair(round: string, slot: number): readonly [number, number] | null {
  if (round === "Round of 16") return R32_FEEDERS[slot] ?? null;
  if (round === "Quarter-final") return R16_FEEDERS[slot] ?? null;
  if (round === "Semi-final") return QF_FEEDERS[slot] ?? null;
  if (round === "Final") return SF_FEEDERS;
  return null;
}
