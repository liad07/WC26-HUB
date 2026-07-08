export type TvKind = "match" | "pre" | "post" | "studio";

export interface TvProgram {
  start: string;
  end: string | null;
  startTs: number;
  endTs: number | null;
  title: string;
  subtitle: string | null;
  isMatch: boolean;
  teams: string[] | null;
  kind: TvKind;
}

export interface TvSchedule {
  channel: string;
  date: string;
  source: "api" | "mock";
  programs: TvProgram[];
}
