import type { ApiFixture, ApiLeagueStandings } from "@/types/apiFootball";

const now = Date.now();
const hour = 3600 * 1000;

function iso(offsetMs: number): string {
  return new Date(now + offsetMs).toISOString();
}

function team(id: number, name: string) {
  return { id, name, logo: `https://media.api-sports.io/football/teams/${id}.png` };
}

/** Static fixtures used when no API key is configured. */
export const MOCK_FIXTURES: ApiFixture[] = [
  {
    fixture: {
      id: 900001,
      referee: "דני מקללי",
      timezone: "UTC",
      date: iso(-30 * 60 * 1000),
      timestamp: Math.floor((now - 30 * 60 * 1000) / 1000),
      venue: { id: 1, name: "אצטדיון לוסייל", city: "לוסייל" },
      status: { long: "Second Half", short: "2H", elapsed: 63 },
    },
    league: {
      id: 1,
      name: "גביע העולם",
      country: "World",
      logo: "https://media.api-sports.io/football/leagues/1.png",
      flag: null,
      season: 2026,
      round: "שלב הבתים - מחזור 2",
    },
    teams: { home: team(6, "ברזיל"), away: team(2, "ארגנטינה") },
    goals: { home: 2, away: 1 },
    score: {
      halftime: { home: 1, away: 1 },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
    events: [
      {
        time: { elapsed: 12, extra: null },
        team: team(6, "ברזיל"),
        player: { id: 1, name: "ויניסיוס" },
        assist: { id: 2, name: "רודריגו" },
        type: "Goal",
        detail: "Normal Goal",
        comments: null,
      },
      {
        time: { elapsed: 27, extra: null },
        team: team(2, "ארגנטינה"),
        player: { id: 3, name: "מסי" },
        assist: { id: null, name: null },
        type: "Goal",
        detail: "Penalty",
        comments: null,
      },
      {
        time: { elapsed: 41, extra: null },
        team: team(2, "ארגנטינה"),
        player: { id: 4, name: "דה פול" },
        assist: { id: null, name: null },
        type: "Card",
        detail: "Yellow Card",
        comments: null,
      },
      {
        time: { elapsed: 58, extra: null },
        team: team(6, "ברזיל"),
        player: { id: 5, name: "נדב" },
        assist: { id: 6, name: "ראפיניה" },
        type: "Goal",
        detail: "Normal Goal",
        comments: null,
      },
    ],
  },
  {
    fixture: {
      id: 900002,
      referee: null,
      timezone: "UTC",
      date: iso(2 * hour),
      timestamp: Math.floor((now + 2 * hour) / 1000),
      venue: { id: 2, name: "אצטדיון אל באיט", city: "אל חור" },
      status: { long: "Not Started", short: "NS", elapsed: null },
    },
    league: {
      id: 1,
      name: "גביע העולם",
      country: "World",
      logo: "https://media.api-sports.io/football/leagues/1.png",
      flag: null,
      season: 2026,
      round: "שלב הבתים - מחזור 2",
    },
    teams: { home: team(10, "צרפת"), away: team(25, "גרמניה") },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
    events: [],
  },
  {
    fixture: {
      id: 900003,
      referee: "פייר טורנייה",
      timezone: "UTC",
      date: iso(-3 * hour),
      timestamp: Math.floor((now - 3 * hour) / 1000),
      venue: { id: 3, name: "אצטדיון תחריר", city: "אל ריאן" },
      status: { long: "Match Finished", short: "FT", elapsed: 90 },
    },
    league: {
      id: 1,
      name: "גביע העולם",
      country: "World",
      logo: "https://media.api-sports.io/football/leagues/1.png",
      flag: null,
      season: 2026,
      round: "שלב הבתים - מחזור 2",
    },
    teams: { home: team(768, "ישראל"), away: team(27, "פורטוגל") },
    goals: { home: 1, away: 1 },
    score: {
      halftime: { home: 0, away: 1 },
      fulltime: { home: 1, away: 1 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
    events: [
      {
        time: { elapsed: 33, extra: null },
        team: team(27, "פורטוגל"),
        player: { id: 7, name: "רונאלדו" },
        assist: { id: null, name: null },
        type: "Goal",
        detail: "Normal Goal",
        comments: null,
      },
      {
        time: { elapsed: 88, extra: 2 },
        team: team(768, "ישראל"),
        player: { id: 8, name: "מנור סולומון" },
        assist: { id: 9, name: "אמיר" },
        type: "Goal",
        detail: "Normal Goal",
        comments: null,
      },
    ],
  },
  {
    fixture: {
      id: 900004,
      referee: null,
      timezone: "UTC",
      date: iso(26 * hour),
      timestamp: Math.floor((now + 26 * hour) / 1000),
      venue: { id: 4, name: "אצטדיון אחמד בן עלי", city: "אל ריאן" },
      status: { long: "Not Started", short: "NS", elapsed: null },
    },
    league: {
      id: 1,
      name: "גביע העולם",
      country: "World",
      logo: "https://media.api-sports.io/football/leagues/1.png",
      flag: null,
      season: 2026,
      round: "שלב הבתים - מחזור 3",
    },
    teams: { home: team(3, "ספרד"), away: team(9, "אנגליה") },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
    events: [],
  },
];

export const MOCK_LINEUPS = [
  {
    team: team(6, "ברזיל"),
    formation: "4-3-3",
    coach: { id: 1, name: "דוריבל ז'וניור", photo: null },
    startXI: [
      { player: { id: 100, name: "אליסון", number: 1, pos: "G", grid: "1:1" } },
      { player: { id: 101, name: "דניך", number: 2, pos: "D", grid: "2:1" } },
      { player: { id: 102, name: "מרקיניוס", number: 4, pos: "D", grid: "2:2" } },
      { player: { id: 103, name: "גבריאל", number: 3, pos: "D", grid: "2:3" } },
      { player: { id: 104, name: "וונדרסון", number: 6, pos: "D", grid: "2:4" } },
      { player: { id: 105, name: "ברונו גימראס", number: 5, pos: "M", grid: "3:1" } },
      { player: { id: 106, name: "פביניו", number: 8, pos: "M", grid: "3:2" } },
      { player: { id: 107, name: "לוקאס פאקטה", number: 10, pos: "M", grid: "3:3" } },
      { player: { id: 108, name: "ראפיניה", number: 11, pos: "F", grid: "4:1" } },
      { player: { id: 109, name: "אנדריק", number: 9, pos: "F", grid: "4:2" } },
      { player: { id: 110, name: "ויניסיוס", number: 7, pos: "F", grid: "4:3" } },
    ],
    substitutes: [
      { player: { id: 111, name: "בנטו", number: 12, pos: "G", grid: null } },
      { player: { id: 112, name: "רודריגו", number: 19, pos: "F", grid: null } },
    ],
  },
  {
    team: team(2, "ארגנטינה"),
    formation: "4-4-2",
    coach: { id: 2, name: "ליונל סקאלוני", photo: null },
    startXI: [
      { player: { id: 200, name: "מרטינס", number: 23, pos: "G", grid: "1:1" } },
      { player: { id: 201, name: "מולינה", number: 26, pos: "D", grid: "2:1" } },
      { player: { id: 202, name: "אוטמנדי", number: 19, pos: "D", grid: "2:2" } },
      { player: { id: 203, name: "רומרו", number: 13, pos: "D", grid: "2:3" } },
      { player: { id: 204, name: "טליאפיקו", number: 3, pos: "D", grid: "2:4" } },
      { player: { id: 205, name: "דה פול", number: 7, pos: "M", grid: "3:1" } },
      { player: { id: 206, name: "אנצו פרננדס", number: 24, pos: "M", grid: "3:2" } },
      { player: { id: 207, name: "מק אליסטר", number: 20, pos: "M", grid: "3:3" } },
      { player: { id: 208, name: "די מריה", number: 11, pos: "M", grid: "3:4" } },
      { player: { id: 209, name: "מסי", number: 10, pos: "F", grid: "4:1" } },
      { player: { id: 210, name: "אלוארס", number: 9, pos: "F", grid: "4:2" } },
    ],
    substitutes: [
      { player: { id: 211, name: "רולי", number: 12, pos: "G", grid: null } },
      { player: { id: 212, name: "דיבאלה", number: 21, pos: "F", grid: null } },
    ],
  },
];

export const MOCK_STATISTICS = [
  {
    team: team(6, "ברזיל"),
    statistics: [
      { type: "Ball Possession", value: "58%" },
      { type: "Total Shots", value: 12 },
      { type: "Shots on Goal", value: 5 },
      { type: "Corner Kicks", value: 6 },
      { type: "Fouls", value: 9 },
    ],
  },
  {
    team: team(2, "ארגנטינה"),
    statistics: [
      { type: "Ball Possession", value: "42%" },
      { type: "Total Shots", value: 8 },
      { type: "Shots on Goal", value: 3 },
      { type: "Corner Kicks", value: 3 },
      { type: "Fouls", value: 12 },
    ],
  },
];

/** Static group standings used when no API key is configured. */
export const MOCK_STANDINGS: ApiLeagueStandings[] = [
  {
    league: {
      id: 1,
      name: "גביע העולם",
      country: "World",
      logo: "https://media.api-sports.io/football/leagues/1.png",
      flag: null,
      season: 2026,
      standings: [
        [
          {
            rank: 1,
            team: team(6, "ברזיל"),
            points: 6,
            goalsDiff: 4,
            group: "בית A",
            form: "WW",
            all: { played: 2, win: 2, draw: 0, lose: 0, goals: { for: 5, against: 1 } },
          },
          {
            rank: 2,
            team: team(2, "ארגנטינה"),
            points: 3,
            goalsDiff: 0,
            group: "בית A",
            form: "WL",
            all: { played: 2, win: 1, draw: 0, lose: 1, goals: { for: 3, against: 3 } },
          },
          {
            rank: 3,
            team: team(768, "ישראל"),
            points: 1,
            goalsDiff: -1,
            group: "בית A",
            form: "DL",
            all: { played: 2, win: 0, draw: 1, lose: 1, goals: { for: 2, against: 3 } },
          },
          {
            rank: 4,
            team: team(27, "פורטוגל"),
            points: 1,
            goalsDiff: -3,
            group: "בית A",
            form: "LD",
            all: { played: 2, win: 0, draw: 1, lose: 1, goals: { for: 1, against: 4 } },
          },
        ],
        [
          {
            rank: 1,
            team: team(10, "צרפת"),
            points: 6,
            goalsDiff: 3,
            group: "בית B",
            form: "WW",
            all: { played: 2, win: 2, draw: 0, lose: 0, goals: { for: 4, against: 1 } },
          },
          {
            rank: 2,
            team: team(3, "ספרד"),
            points: 4,
            goalsDiff: 2,
            group: "בית B",
            form: "WD",
            all: { played: 2, win: 1, draw: 1, lose: 0, goals: { for: 3, against: 1 } },
          },
          {
            rank: 3,
            team: team(25, "גרמניה"),
            points: 1,
            goalsDiff: -2,
            group: "בית B",
            form: "DL",
            all: { played: 2, win: 0, draw: 1, lose: 1, goals: { for: 1, against: 3 } },
          },
          {
            rank: 4,
            team: team(9, "אנגליה"),
            points: 0,
            goalsDiff: -3,
            group: "בית B",
            form: "LL",
            all: { played: 2, win: 0, draw: 0, lose: 2, goals: { for: 1, against: 4 } },
          },
        ],
      ],
    },
  },
];
