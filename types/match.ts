export type MatchStatus =
  | "NOT_STARTED"
  | "LIVE"
  | "HALF_TIME"
  | "FINISHED"
  | "POSTPONED"
  | "UNKNOWN";

export interface TeamInfo {
  id: number;
  name: string;
  logo: string;
}

export interface EventItem {
  minute: number;
  extra: number | null;
  teamId: number;
  teamName: string;
  player: string | null;
  assist: string | null;
  type: "GOAL" | "YELLOW" | "RED" | "SUBST" | "VAR" | "OTHER";
  detail: string;
}

export interface LineupPlayer {
  id: number;
  name: string;
  number: number;
  position: string | null;
  photo: string | null;
}

export interface LineupInfo {
  teamId: number;
  teamName: string;
  formation: string | null;
  coach: string | null;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface StatItem {
  type: string;
  home: number | string | null;
  away: number | string | null;
}

export interface Match {
  id: number;
  matchNumber?: number;
  dateISO: string;
  timestamp: number;
  status: MatchStatus;
  statusLabel: string;
  elapsed: number | null;
  elapsedExtra?: number | null;
  leagueId: number;
  leagueName: string;
  round: string;
  venue: string | null;
  city: string | null;
  referee: string | null;
  home: TeamInfo;
  away: TeamInfo;
  goalsHome: number | null;
  goalsAway: number | null;
  events?: EventItem[];
  lineups?: LineupInfo[];
  statistics?: StatItem[];
}

export interface StandingRow {
  rank: number;
  team: TeamInfo;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
  points: number;
  group: string;
  form: string | null;
  qualified?: boolean;
}

export interface StandingGroup {
  leagueName: string;
  group: string;
  rows: StandingRow[];
}
