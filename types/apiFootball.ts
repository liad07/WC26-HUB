export interface ApiResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: string[] | Record<string, string>;
  results: number;
  paging: { current: number; total: number };
  response: T;
}

export interface ApiTeam {
  id: number;
  name: string;
  logo: string;
  winner?: boolean | null;
}

export interface ApiVenue {
  id: number | null;
  name: string | null;
  city: string | null;
}

export interface ApiFixtureStatus {
  long: string;
  short: string;
  elapsed: number | null;
}

export interface ApiFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    venue: ApiVenue;
    status: ApiFixtureStatus;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: { home: ApiTeam; away: ApiTeam };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
  events?: ApiEvent[];
  lineups?: ApiLineup[];
  statistics?: ApiStatistics[];
}

export interface ApiEvent {
  time: { elapsed: number; extra: number | null };
  team: ApiTeam;
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
}

export interface ApiLineupPlayer {
  player: {
    id: number;
    name: string;
    number: number;
    pos: string | null;
    grid: string | null;
  };
}

export interface ApiLineup {
  team: ApiTeam;
  formation: string | null;
  coach: { id: number | null; name: string | null; photo: string | null };
  startXI: ApiLineupPlayer[];
  substitutes: ApiLineupPlayer[];
}

export interface ApiStatistics {
  team: ApiTeam;
  statistics: { type: string; value: number | string | null }[];
}

export interface ApiStanding {
  rank: number;
  team: ApiTeam;
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
}

export interface ApiLeagueStandings {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    standings: ApiStanding[][];
  };
}
