import "server-only";
import { gunzipSync } from "node:zlib";
import type { TvKind, TvProgram, TvSchedule } from "@/types/tv";
import { ISRAEL_TZ, dateKeyOffset, israelWallClockToUtc, toIsraelDateKey } from "@/lib/date";
import { detectMatchTeams } from "@/lib/teams";

const EPG_URL = "https://epgshare01.online/epgshare01/epg_ripper_IL1.xml.gz";
const KAN11_ID = "כאן.11.il";
const HOUR = 3_600_000;
const RERUN_RE = /\(\s*(?:ש\s*["'.]?\s*ח|שח|חז\s*['.]?|חוזר|שידור\s*חוזר)\s*\)/g;

interface RawProgram {
  startUtc: Date;
  endUtc: Date | null;
  title: string;
  subtitle: string | null;
}

interface MockEntry {
  h: number;
  m: number;
  nextDay?: boolean;
  title: string;
  subtitle: string;
}

/** Illustrative World Cup evening lineup used only if the live EPG feed is unreachable. */
const MOCK_PROGRAMS: MockEntry[] = [
  { h: 17, m: 55, title: "ישיר! מונדיאל 2026", subtitle: "אולפן מקדים" },
  { h: 19, m: 0, title: "ישיר! מונדיאל 2026", subtitle: "ארגנטינה/מצרים" },
  { h: 21, m: 15, title: "ישיר! מונדיאל 2026", subtitle: "אולפן מסכם" },
  { h: 22, m: 30, title: "ישיר! מונדיאל 2026", subtitle: "אולפן מקדים" },
  { h: 23, m: 0, title: "ישיר! מונדיאל 2026", subtitle: "שווייץ/קולומביה" },
  { h: 1, m: 0, nextDay: true, title: "ישיר! מונדיאל 2026", subtitle: "אולפן מסכם" },
];

/**
 * Builds a World Cup broadcast schedule from the public Kan 11 XMLTV feed:
 * keeps only Mundial programmes (matches + pre/post studios), preserving real
 * timestamps so late-night broadcasts spanning midnight are handled correctly.
 */
class KanScheduleService {
  private readonly channel = "מונדיאל 2026";

  async getSchedule(): Promise<TvSchedule> {
    const now = new Date();
    const date = toIsraelDateKey(now);
    const live = await this.tryFetchLive();
    if (live && live.length > 0) {
      const mundial = live.filter((p) => this.isMundial(p.title, p.subtitle));
      const windowed = this.selectWindow(mundial, now);
      const programs = this.withEndTimes(windowed.map((p) => this.build(p.startUtc, p.endUtc, p.title, p.subtitle)));
      return { channel: this.channel, date, source: "api", programs };
    }
    return { channel: this.channel, date, source: "mock", programs: this.buildMock(now) };
  }

  /** True for World Cup programmes: match broadcasts or Mundial studios. */
  private isMundial(title: string, subtitle: string | null): boolean {
    const text = `${title} ${subtitle ?? ""}`.toLowerCase();
    if (/מונדיאל|גביע העולם|world ?cup|fifa/.test(text)) return true;
    return detectMatchTeams(title, subtitle) !== null;
  }

  /** Keeps programmes within a rolling window around now (recent + next 24h), across midnight. */
  private selectWindow(programs: RawProgram[], now: Date): RawProgram[] {
    const t = now.getTime();
    const from = t - 6 * HOUR;
    const to = t + 24 * HOUR;
    return programs.filter((p) => {
      const s = p.startUtc.getTime();
      const e = p.endUtc ? p.endUtc.getTime() : s + 2 * HOUR;
      return (s >= from && s <= to) || (s <= t && e > t);
    });
  }

  /** Builds a TvProgram with real timestamps, match detection and kind classification. */
  private build(startUtc: Date, endUtc: Date | null, rawTitle: string, rawSubtitle: string | null): TvProgram {
    const title = this.expandRerun(rawTitle);
    const subtitle = rawSubtitle ? this.expandRerun(rawSubtitle) : null;
    const teams = detectMatchTeams(this.stripRerun(rawTitle), rawSubtitle ? this.stripRerun(rawSubtitle) : null);
    return {
      start: this.hhmm(startUtc),
      end: endUtc ? this.hhmm(endUtc) : null,
      startTs: startUtc.getTime(),
      endTs: endUtc ? endUtc.getTime() : null,
      title,
      subtitle,
      isMatch: teams !== null,
      teams,
      kind: this.classify(title, subtitle, teams !== null),
    };
  }

  /** Expands the Hebrew rerun abbreviation "(ש.ח)" and variants to "(שידור חוזר)". */
  private expandRerun(text: string): string {
    return text.replace(RERUN_RE, " (שידור חוזר)").replace(/\s+/g, " ").trim();
  }

  /** Removes any rerun marker so team-name detection stays clean. */
  private stripRerun(text: string): string {
    return text.replace(RERUN_RE, "").replace(/\s+/g, " ").trim();
  }

  /** Classifies a programme as match, pre-game studio, post-game studio or generic studio. */
  private classify(title: string, subtitle: string | null, isMatch: boolean): TvKind {
    if (isMatch) return "match";
    const text = `${title} ${subtitle ?? ""}`;
    if (/מקדים|לקראת|טרום|לפני המשחק/.test(text)) return "pre";
    if (/מסכם|סיכום|אחרי המשחק|ניתוח/.test(text)) return "post";
    return "studio";
  }

  private buildMock(now: Date): TvProgram[] {
    const today = toIsraelDateKey(now);
    const tomorrow = dateKeyOffset(1, today);
    const raw = MOCK_PROGRAMS.map((p) => {
      const ts = israelWallClockToUtc(p.nextDay ? tomorrow : today, p.h, p.m);
      return { startUtc: new Date(ts), endUtc: null, title: p.title, subtitle: p.subtitle } as RawProgram;
    }).sort((a, b) => a.startUtc.getTime() - b.startUtc.getTime());
    return this.withEndTimes(raw.map((p) => this.build(p.startUtc, p.endUtc, p.title, p.subtitle)));
  }

  /** Fetches, unzips and parses the Kan 11 programmes; null on any failure. */
  private async tryFetchLive(): Promise<RawProgram[] | null> {
    try {
      const res = await fetch(EPG_URL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        },
        next: { revalidate: 3600 },
      });
      if (!res.ok) return null;
      const xml = gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf8");
      return this.parseChannel(xml, KAN11_ID);
    } catch {
      return null;
    }
  }

  /** Extracts programmes for one channel id from XMLTV markup. */
  private parseChannel(xml: string, channelId: string): RawProgram[] {
    const escaped = channelId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(
      `<programme start="([^"]+)"(?:\\s+stop="([^"]+)")? channel="${escaped}">([\\s\\S]*?)</programme>`,
      "g"
    );
    const programs: RawProgram[] = [];
    for (const m of xml.matchAll(re)) {
      const startUtc = this.parseXmltvDate(m[1]);
      if (!startUtc) continue;
      programs.push({
        startUtc,
        endUtc: m[2] ? this.parseXmltvDate(m[2]) : null,
        title: this.decode(m[3].match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]) || "תוכנית",
        subtitle:
          this.decode(m[3].match(/<sub-title[^>]*>([\s\S]*?)<\/sub-title>/)?.[1]) ||
          this.decode(m[3].match(/<category[^>]*>([\s\S]*?)<\/category>/)?.[1]) ||
          null,
      });
    }
    return programs.sort((a, b) => a.startUtc.getTime() - b.startUtc.getTime());
  }

  /** Parses "YYYYMMDDHHMMSS +ZZZZ" into a real UTC Date. */
  private parseXmltvDate(value: string): Date | null {
    const m = value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?\s*([+-]\d{4})?$/);
    if (!m) return null;
    const [, y, mo, d, h, mi, s, tz] = m;
    let ms = Date.UTC(+y, +mo - 1, +d, +h, +mi, s ? +s : 0);
    if (tz) {
      const sign = tz[0] === "-" ? -1 : 1;
      const offsetMin = sign * (+tz.slice(1, 3) * 60 + +tz.slice(3, 5));
      ms -= offsetMin * 60_000;
    }
    return new Date(ms);
  }

  private hhmm(date: Date): string {
    return new Intl.DateTimeFormat("he-IL", {
      timeZone: ISRAEL_TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  /** Fills missing end times/timestamps from the next program's start. */
  private withEndTimes(programs: TvProgram[]): TvProgram[] {
    return programs.map((p, i) => ({
      ...p,
      end: p.end ?? programs[i + 1]?.start ?? null,
      endTs: p.endTs ?? programs[i + 1]?.startTs ?? null,
    }));
  }

  private decode(value?: string | null): string {
    if (!value) return "";
    return value
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export const kanSchedule = new KanScheduleService();
