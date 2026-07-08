import "server-only";
import type {
  ApiEvent,
  ApiFixture,
  ApiLeagueStandings,
  ApiResponse,
  ApiStanding,
} from "@/types/apiFootball";
import type {
  EventItem,
  LineupInfo,
  Match,
  StandingGroup,
  StatItem,
} from "@/types/match";
import { mapEventType, mapStatus, statusLabel } from "@/lib/format";
import { sameTeam } from "@/lib/teams";
import { dateKeyOffset, toIsraelDateKey } from "@/lib/date";
import {
  MOCK_FIXTURES,
  MOCK_LINEUPS,
  MOCK_STANDINGS,
  MOCK_STATISTICS,
} from "@/lib/mockData";

const DEFAULT_HOST = "https://v3.football.api-sports.io";
const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = 2026;
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Server-only client for API-FOOTBALL that normalizes raw payloads into the
 * app's `Match`/`Standing` shapes and falls back to mock data without a key.
 */
class ApiFootballClient {
  private readonly key: string;
  private readonly host: string;

  constructor() {
    this.key = process.env.API_FOOTBALL_KEY?.trim() ?? "";
    this.host = (process.env.API_FOOTBALL_HOST?.trim() || DEFAULT_HOST).replace(/\/$/, "");
  }

  get hasKey(): boolean {
    return this.key.length > 0;
  }

  /** Performs an authenticated GET against API-FOOTBALL and returns the response array. */
  private async request<T>(path: string, params: Record<string, string>): Promise<T[]> {
    const url = new URL(`${this.host}${path}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const isRapid = this.host.includes("rapidapi.com");
    const headers: Record<string, string> = isRapid
      ? { "x-rapidapi-key": this.key, "x-rapidapi-host": new URL(this.host).host }
      : { "x-apisports-key": this.key };

    const res = await fetch(url.toString(), {
      headers,
      next: { revalidate: 20 },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`API-FOOTBALL ${res.status}`);
    const json = (await res.json()) as ApiResponse<T[]>;
    return json.response ?? [];
  }

  /** Normalized offline fixtures, always available as a last-resort fallback. */
  getMockFixtures(): Match[] {
    return MOCK_FIXTURES.map((f) => this.normalizeFixture(f));
  }

  /** Fixtures for the World Cup on a given date (YYYY-MM-DD), mock-aware. */
  async getFixturesByDate(date: string): Promise<Match[]> {
    if (!this.hasKey) return this.getMockFixtures();
    const raw = await this.request<ApiFixture>("/fixtures", {
      league: String(WORLD_CUP_LEAGUE_ID),
      season: String(WORLD_CUP_SEASON),
      date,
      timezone: "Asia/Jerusalem",
    });
    return raw.map((f) => this.normalizeFixture(f));
  }

  /** Every World Cup fixture for the season, mock-aware. */
  async getAllFixtures(): Promise<Match[]> {
    if (!this.hasKey) return this.getMockFixtures();
    const raw = await this.request<ApiFixture>("/fixtures", {
      league: String(WORLD_CUP_LEAGUE_ID),
      season: String(WORLD_CUP_SEASON),
      timezone: "Asia/Jerusalem",
    });
    return raw.map((f) => this.normalizeFixture(f));
  }

  /** Currently live World Cup fixtures, mock-aware. */
  async getLiveFixtures(): Promise<Match[]> {
    if (!this.hasKey) {
      return this.getMockFixtures().filter(
        (m) => m.status === "LIVE" || m.status === "HALF_TIME"
      );
    }
    const raw = await this.request<ApiFixture>("/fixtures", {
      league: String(WORLD_CUP_LEAGUE_ID),
      season: String(WORLD_CUP_SEASON),
      live: "all",
      timezone: "Asia/Jerusalem",
    });
    return raw.map((f) => this.normalizeFixture(f));
  }

  /** Full match detail incl. events, lineups and statistics, mock-aware. */
  async getFixtureById(id: number): Promise<Match | null> {
    if (!this.hasKey) {
      const mock = MOCK_FIXTURES.find((f) => f.fixture.id === id);
      if (!mock) return null;
      const match = this.normalizeFixture(mock);
      if (id === 900001) {
        match.lineups = MOCK_LINEUPS.map((l) => this.normalizeLineup(l));
        match.statistics = this.normalizeStatistics(MOCK_STATISTICS);
      }
      return match;
    }
    const raw = await this.request<ApiFixture>("/fixtures", { id: String(id), timezone: "Asia/Jerusalem" });
    if (raw.length === 0) return null;
    const match = this.normalizeFixture(raw[0]);
    if (raw[0].lineups?.length) match.lineups = raw[0].lineups.map((l) => this.normalizeLineup(l));
    if (raw[0].statistics?.length) match.statistics = this.normalizeStatistics(raw[0].statistics);
    return match;
  }

  /** Finds a fixture (today/tomorrow) matching a pair of team names, or null. */
  async findFixtureByTeams(names: string[]): Promise<Match | null> {
    if (names.length < 2) return null;
    const [a, b] = names;
    const days = await Promise.all([
      this.getFixturesByDate(toIsraelDateKey()),
      this.getFixturesByDate(dateKeyOffset(1)),
    ]);
    const fixtures = days.flat();
    return (
      fixtures.find((m) => {
        const home = m.home.name;
        const away = m.away.name;
        return (
          (sameTeam(home, a) && sameTeam(away, b)) ||
          (sameTeam(home, b) && sameTeam(away, a))
        );
      }) ?? null
    );
  }

  /** World Cup standings grouped by group name, mock-aware. */
  async getStandings(): Promise<StandingGroup[]> {
    const raw = this.hasKey
      ? await this.request<ApiLeagueStandings>("/standings", {
          league: String(WORLD_CUP_LEAGUE_ID),
          season: String(WORLD_CUP_SEASON),
        })
      : MOCK_STANDINGS;
    return this.normalizeStandings(raw);
  }

  private normalizeFixture(f: ApiFixture): Match {
    const status = mapStatus(f.fixture.status.short);
    return {
      id: f.fixture.id,
      dateISO: f.fixture.date,
      timestamp: f.fixture.timestamp,
      status,
      statusLabel: statusLabel(status),
      elapsed: f.fixture.status.elapsed,
      leagueId: f.league.id,
      leagueName: f.league.name,
      round: f.league.round,
      venue: f.fixture.venue?.name ?? null,
      city: f.fixture.venue?.city ?? null,
      referee: f.fixture.referee,
      home: { id: f.teams.home.id, name: f.teams.home.name, logo: f.teams.home.logo },
      away: { id: f.teams.away.id, name: f.teams.away.name, logo: f.teams.away.logo },
      goalsHome: f.goals.home,
      goalsAway: f.goals.away,
      events: f.events?.map((e) => this.normalizeEvent(e)),
    };
  }

  private normalizeEvent(e: ApiEvent): EventItem {
    return {
      minute: e.time.elapsed,
      extra: e.time.extra,
      teamId: e.team.id,
      teamName: e.team.name,
      player: e.player?.name ?? null,
      assist: e.assist?.name ?? null,
      type: mapEventType(e.type, e.detail),
      detail: e.detail,
    };
  }

  private normalizeLineup(l: NonNullable<ApiFixture["lineups"]>[number]): LineupInfo {
    const mapPlayer = (p: { player: { id: number; name: string; number: number; pos: string | null } }) => ({
      id: p.player.id,
      name: p.player.name,
      number: p.player.number,
      position: p.player.pos,
      photo: null,
    });
    return {
      teamId: l.team.id,
      teamName: l.team.name,
      formation: l.formation,
      coach: l.coach?.name ?? null,
      startXI: l.startXI.map(mapPlayer),
      substitutes: l.substitutes.map(mapPlayer),
    };
  }

  private normalizeStatistics(stats: NonNullable<ApiFixture["statistics"]>): StatItem[] {
    if (stats.length < 2) return [];
    const [home, away] = stats;
    return home.statistics.map((s, i) => ({
      type: s.type,
      home: s.value,
      away: away.statistics[i]?.value ?? null,
    }));
  }

  private normalizeStandings(raw: ApiLeagueStandings[]): StandingGroup[] {
    const groups: StandingGroup[] = [];
    for (const league of raw) {
      for (const table of league.league.standings) {
        if (!table.length) continue;
        groups.push({
          leagueName: league.league.name,
          group: table[0].group,
          rows: table.map((row: ApiStanding) => ({
            rank: row.rank,
            team: { id: row.team.id, name: row.team.name, logo: row.team.logo },
            played: row.all.played,
            win: row.all.win,
            draw: row.all.draw,
            lose: row.all.lose,
            goalsFor: row.all.goals.for,
            goalsAgainst: row.all.goals.against,
            goalsDiff: row.goalsDiff,
            points: row.points,
            group: row.group,
            form: row.form,
          })),
        });
      }
    }
    return groups;
  }
}

export const apiFootball = new ApiFootballClient();
