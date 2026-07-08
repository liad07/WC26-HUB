import "server-only";
import type {
  EventItem,
  LineupInfo,
  LineupPlayer,
  Match,
  MatchStatus,
  StandingGroup,
  StatItem,
} from "@/types/match";
import { statusLabel } from "@/lib/format";
import { dateKeyOffset, toIsraelDateKey } from "@/lib/date";

const BASE = "https://api.fifa.com/api/v3";
const WORLD_CUP_COMPETITION = "17";
const REQUEST_TIMEOUT_MS = 6000;
const TOURNAMENT_START = "2026-06-01";
const TOURNAMENT_END = "2026-07-31";

interface FifaLocalized {
  Locale: string;
  Description: string;
}
interface FifaTeam {
  IdTeam: string;
  Score: number | null;
  TeamName: FifaLocalized[];
  PictureUrl: string | null;
  Tactics?: string | null;
  Coaches?: { Name: FifaLocalized[]; Role: number }[];
  Players?: FifaPlayer[];
}
interface FifaPlayer {
  IdPlayer: string;
  ShirtNumber: number;
  Status: number;
  Captain: boolean;
  PlayerName: FifaLocalized[];
  Position: number | null;
  PlayerPicture?: { PictureUrl?: string | null } | null;
}
interface FifaMatch {
  IdMatch: string;
  IdSeason: string;
  IdStage: string;
  IdCompetition: string;
  Date: string;
  MatchStatus: number;
  MatchTime: string | null;
  Period?: number;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  Home: FifaTeam | null;
  Away: FifaTeam | null;
  HomeTeam?: FifaTeam;
  AwayTeam?: FifaTeam;
  CompetitionName?: FifaLocalized[];
  StageName?: FifaLocalized[];
  GroupName?: FifaLocalized[];
  Stadium?: { Name?: FifaLocalized[]; CityName?: FifaLocalized[] } | null;
  Officials?: { OfficialType: number; OfficialName?: FifaLocalized[]; NameShort?: FifaLocalized[] }[];
}
interface FifaStandingRow {
  IdGroup: string;
  Group: FifaLocalized[];
  Won: number;
  Lost: number;
  Drawn: number;
  Played: number;
  Against: number;
  For: number;
  Position: number;
  Points: number;
  GoalsDiference: number;
  QualificationStatus?: string;
  Team: { IdTeam: string; Name: FifaLocalized[]; PictureUrl?: string | null };
}
interface FifaTimelineEvent {
  Type: number;
  TypeLocalized?: FifaLocalized[];
  MatchMinute: string | null;
  Period?: number;
  IdTeam: string | null;
  PlayerName?: FifaLocalized[];
}

const PENALTY_SHOOTOUT_PERIOD = 11;
const FIFA_EVENT_TYPE: Record<number, EventItem["type"]> = {
  0: "GOAL",
  34: "GOAL",
  41: "GOAL",
  2: "YELLOW",
  3: "RED",
  5: "SUBST",
  71: "VAR",
};

const POSITION_HE: Record<number, string> = { 0: "שוער", 1: "הגנה", 2: "קישור", 3: "חלוץ" };

/**
 * Keyless client for the official FIFA API, normalizing live World Cup data
 * (fixtures, scores, events, lineups) into the app's `Match` shape.
 */
class FifaApiClient {
  private stageIndex = new Map<number, { season: string; stage: string }>();
  private groupStage: { season: string; stage: string } | null = null;

  private text(loc?: FifaLocalized[] | null): string {
    return loc?.[0]?.Description ?? "";
  }

  private async get<T>(path: string): Promise<T | null> {
    try {
      const res = await fetch(`${BASE}${path}`, {
        headers: { "User-Agent": "Mozilla/5.0 Chrome/124.0 Safari/537.36", Accept: "application/json" },
        next: { revalidate: 20 },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }

  /** World Cup fixtures on an Israel date key (YYYY-MM-DD). Null when FIFA is unreachable. */
  async getFixturesByDate(dateKey: string): Promise<Match[] | null> {
    const raw = await this.fetchWindow(dateKeyOffset(-1, dateKey), dateKeyOffset(1, dateKey));
    if (raw === null) return null;
    return raw
      .map((m) => this.normalize(m))
      .filter((m) => toIsraelDateKey(new Date(m.dateISO)) === dateKey)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /** Every World Cup fixture across the whole tournament window. Null when FIFA is unreachable. */
  async getAllFixtures(): Promise<Match[] | null> {
    const raw = await this.fetchWindow(TOURNAMENT_START, TOURNAMENT_END);
    if (raw === null) return null;
    return raw.map((m) => this.normalize(m)).sort((a, b) => a.timestamp - b.timestamp);
  }

  /** Currently live World Cup fixtures. Null when FIFA is unreachable. */
  async getLiveFixtures(): Promise<Match[] | null> {
    const today = toIsraelDateKey();
    const raw = await this.fetchWindow(dateKeyOffset(-1, today), dateKeyOffset(1, today));
    if (raw === null) return null;
    return raw
      .map((m) => this.normalize(m))
      .filter((m) => m.status === "LIVE" || m.status === "HALF_TIME");
  }

  /** All knockout-stage fixtures (R32 → Final + third place). Null when FIFA is unreachable. */
  async getKnockoutFixtures(): Promise<Match[] | null> {
    const raw = await this.fetchWindow("2026-06-25", "2026-07-20");
    if (raw === null) return null;
    const knockout = new Set([
      "Round of 32",
      "Round of 16",
      "Quarter-final",
      "Semi-final",
      "Play-off for third place",
      "Final",
    ]);
    return raw
      .map((m) => this.normalize(m))
      .filter((m) => knockout.has(m.round))
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /** Real World Cup group tables (12 groups), FIFA-sourced. Null when unreachable. */
  async getStandings(): Promise<StandingGroup[] | null> {
    const ref = await this.resolveGroupStage();
    if (!ref) return null;
    const data = await this.get<{ Results: FifaStandingRow[] }>(
      `/calendar/${WORLD_CUP_COMPETITION}/${ref.season}/${ref.stage}/standing?language=en&count=200`
    );
    if (!data) return null;
    return this.groupStandings(data.Results ?? []);
  }

  /** Resolves the group-stage season+stage ids from the June calendar (cached). */
  private async resolveGroupStage(): Promise<{ season: string; stage: string } | null> {
    if (this.groupStage) return this.groupStage;
    const raw = await this.fetchWindow("2026-06-11", "2026-06-27");
    if (raw === null) return null;
    const groupMatch = raw.find((m) => this.text(m.GroupName));
    if (!groupMatch) return null;
    this.groupStage = { season: groupMatch.IdSeason, stage: groupMatch.IdStage };
    return this.groupStage;
  }

  /** Buckets FIFA standing rows into ordered Hebrew-labelled groups. */
  private groupStandings(rows: FifaStandingRow[]): StandingGroup[] {
    const byGroup = new Map<string, StandingGroup>();
    for (const r of rows) {
      const groupName = this.text(r.Group);
      if (!groupName) continue;
      let group = byGroup.get(groupName);
      if (!group) {
        group = { leagueName: "גביע העולם", group: groupName.replace(/^Group\s+/i, "בית "), rows: [] };
        byGroup.set(groupName, group);
      }
      group.rows.push({
        rank: r.Position,
        team: { id: Number(r.Team.IdTeam), name: this.text(r.Team.Name), logo: r.Team.PictureUrl ?? "" },
        played: r.Played,
        win: r.Won,
        draw: r.Drawn,
        lose: r.Lost,
        goalsFor: r.For,
        goalsAgainst: r.Against,
        goalsDiff: r.GoalsDiference,
        points: r.Points,
        group: groupName,
        form: null,
        qualified: r.QualificationStatus === "ConfirmedQualified",
      });
    }
    const groups = [...byGroup.values()];
    groups.forEach((g) => g.rows.sort((a, b) => a.rank - b.rank));
    groups.sort((a, b) => a.group.localeCompare(b.group, "he"));
    return groups;
  }

  /** Full match detail (events + lineups) by FIFA match id. */
  async getFixtureById(id: number): Promise<Match | null> {
    let ref = this.stageIndex.get(id);
    if (!ref) {
      const today = toIsraelDateKey();
      await this.fetchWindow(dateKeyOffset(-3, today), dateKeyOffset(3, today));
      ref = this.stageIndex.get(id);
    }
    if (!ref) {
      await this.fetchWindow(TOURNAMENT_START, TOURNAMENT_END);
      ref = this.stageIndex.get(id);
    }
    if (!ref) return null;

    const detail = await this.get<FifaMatch>(
      `/live/football/${WORLD_CUP_COMPETITION}/${ref.season}/${ref.stage}/${id}?language=en`
    );
    if (!detail) return null;

    const match = this.normalize(detail);
    match.lineups = this.buildLineups(detail);
    match.statistics = this.buildStats(detail);
    match.referee = this.buildReferee(detail);
    match.events = await this.buildEvents(ref.season, ref.stage, id, detail);
    return match;
  }

  /** Finds a fixture (today/tomorrow) matching a pair of team names. */
  async findFixtureByTeams(names: string[], sameTeam: (a: string, b: string) => boolean): Promise<Match | null> {
    if (names.length < 2) return null;
    const [a, b] = names;
    const today = toIsraelDateKey();
    const raw = await this.fetchWindow(dateKeyOffset(-1, today), dateKeyOffset(2, today));
    if (raw === null) return null;
    const matches = raw.map((m) => this.normalize(m));
    return (
      matches.find(
        (m) =>
          (sameTeam(m.home.name, a) && sameTeam(m.away.name, b)) ||
          (sameTeam(m.home.name, b) && sameTeam(m.away.name, a))
      ) ?? null
    );
  }

  /** Fetches WC matches in a UTC date range and indexes their season/stage. Null when unreachable. */
  private async fetchWindow(fromKey: string, toKey: string): Promise<FifaMatch[] | null> {
    const url = `/calendar/matches?idCompetition=${WORLD_CUP_COMPETITION}&from=${fromKey}T00:00:00Z&to=${toKey}T23:59:59Z&count=200&language=en`;
    const data = await this.get<{ Results: FifaMatch[] }>(url);
    if (data === null) return null;
    const results = data.Results ?? [];
    for (const m of results) {
      this.stageIndex.set(Number(m.IdMatch), { season: m.IdSeason, stage: m.IdStage });
    }
    return results;
  }

  private normalize(m: FifaMatch): Match {
    const home = m.HomeTeam ?? m.Home;
    const away = m.AwayTeam ?? m.Away;
    const status = this.mapStatus(m.MatchStatus, m.Period);
    const clock = this.parseMinute(m.MatchTime);
    return {
      id: Number(m.IdMatch),
      dateISO: m.Date,
      timestamp: Math.floor(new Date(m.Date).getTime() / 1000),
      status,
      statusLabel: statusLabel(status),
      elapsed: status === "LIVE" && m.MatchTime ? clock.minute : null,
      elapsedExtra: status === "LIVE" && m.MatchTime ? clock.extra : null,
      leagueId: 17,
      leagueName: this.text(m.CompetitionName) || "גביע העולם",
      round: this.text(m.StageName) || this.text(m.GroupName),
      venue: this.text(m.Stadium?.Name) || null,
      city: this.text(m.Stadium?.CityName) || null,
      referee: null,
      home: { id: Number(home?.IdTeam ?? 0), name: this.text(home?.TeamName), logo: "" },
      away: { id: Number(away?.IdTeam ?? 0), name: this.text(away?.TeamName), logo: "" },
      goalsHome: m.HomeTeamScore ?? home?.Score ?? null,
      goalsAway: m.AwayTeamScore ?? away?.Score ?? null,
    };
  }

  private mapStatus(code: number, period?: number): MatchStatus {
    if (code === 3) return period === 4 || period === 8 ? "HALF_TIME" : "LIVE";
    if (code === 0) return "FINISHED";
    if (code === 1) return "NOT_STARTED";
    if (code === 4 || code === 12) return "POSTPONED";
    return "UNKNOWN";
  }

  private parseMinute(value: string | null): { minute: number; extra: number | null } {
    if (!value) return { minute: 0, extra: null };
    const m = value.match(/(\d+)(?:\s*\+\s*(\d+))?/);
    return { minute: m ? Number(m[1]) : 0, extra: m && m[2] ? Number(m[2]) : null };
  }

  private buildLineups(m: FifaMatch): LineupInfo[] {
    const build = (team: FifaTeam | null | undefined): LineupInfo | null => {
      if (!team?.Players?.length) return null;
      const toPlayer = (p: FifaPlayer): LineupPlayer => ({
        id: Number(p.IdPlayer),
        name: this.text(p.PlayerName),
        number: p.ShirtNumber,
        position: p.Position != null ? POSITION_HE[p.Position] ?? null : null,
        photo: this.playerPhoto(p),
      });
      return {
        teamId: Number(team.IdTeam),
        teamName: this.text(team.TeamName),
        formation: team.Tactics ?? null,
        coach: team.Coaches?.length ? this.text(team.Coaches[0].Name) : null,
        startXI: team.Players.filter((p) => p.Status === 1).map(toPlayer),
        substitutes: team.Players.filter((p) => p.Status !== 1).map(toPlayer),
      };
    };
    return [build(m.HomeTeam ?? m.Home), build(m.AwayTeam ?? m.Away)].filter(
      (l): l is LineupInfo => l !== null
    );
  }

  /** Face-focused, CDN-cropped player photo URL, or null. */
  private playerPhoto(p: FifaPlayer): string | null {
    const url = p.PlayerPicture?.PictureUrl;
    return url ? `${url}?io=transform:crop,width:300,height:540` : null;
  }

  private buildStats(m: FifaMatch): StatItem[] {
    const bp = (m as unknown as { BallPossession?: { Overall?: { Home: number; Away: number } } }).BallPossession;
    if (!bp?.Overall) return [];
    return [
      {
        type: "החזקת כדור",
        home: `${Math.round(bp.Overall.Home * 100)}%`,
        away: `${Math.round(bp.Overall.Away * 100)}%`,
      },
    ];
  }

  private buildReferee(m: FifaMatch): string | null {
    const ref = m.Officials?.find((o) => o.OfficialType === 1);
    if (!ref) return null;
    return this.text(ref.OfficialName) || this.text(ref.NameShort) || null;
  }

  private async buildEvents(
    season: string,
    stage: string,
    id: number,
    detail: FifaMatch
  ): Promise<EventItem[]> {
    const data = await this.get<{ Event?: FifaTimelineEvent[] }>(
      `/timelines/${WORLD_CUP_COMPETITION}/${season}/${stage}/${id}?language=en`
    );
    const homeId = String((detail.HomeTeam ?? detail.Home)?.IdTeam ?? "");
    const homeName = this.text((detail.HomeTeam ?? detail.Home)?.TeamName);
    const awayName = this.text((detail.AwayTeam ?? detail.Away)?.TeamName);
    const events: EventItem[] = [];
    for (const e of data?.Event ?? []) {
      if (e.Period === PENALTY_SHOOTOUT_PERIOD) continue;
      const type = FIFA_EVENT_TYPE[e.Type];
      if (!type) continue;
      const { minute, extra } = this.parseMinute(e.MatchMinute);
      const isHome = String(e.IdTeam) === homeId;
      events.push({
        minute,
        extra,
        teamId: Number(e.IdTeam ?? 0),
        teamName: isHome ? homeName : awayName,
        player: this.text(e.PlayerName) || null,
        assist: null,
        type,
        detail: this.text(e.TypeLocalized),
      });
    }
    return events.sort((a, b) => a.minute - b.minute);
  }
}

export const fifaApi = new FifaApiClient();
