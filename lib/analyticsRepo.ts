import "server-only";
import { getSql } from "@/lib/db";

export type ShabbatEventType =
  | "blocked_stream"
  | "blocked_chat"
  | "banner_shown"
  | "overlay_shown"
  | "page_view_during_shabbat";

export interface PingPayload {
  path: string;
  sessionId: string;
  isWatch?: boolean;
  isShabbat?: boolean;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  ip: string;
  userAgent: string;
  referrer?: string | null;
}

export interface LiveViewer {
  id: string;
  sessionId: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  ip: string;
  userAgent: string;
  startedAt: string;
  lastHeartbeat: string;
}

export interface PageViewRow {
  id: string;
  path: string;
  userId: string | null;
  sessionId: string;
  ip: string;
  userAgent: string;
  createdAt: string;
}

export interface ShabbatEventRow {
  id: string;
  eventType: ShabbatEventType;
  sessionId: string | null;
  userId: string | null;
  ip: string;
  userAgent: string;
  path: string | null;
  createdAt: string;
}

export interface VisitDayPoint {
  date: string;
  visits: number;
}

export interface TopPagePoint {
  path: string;
  visits: number;
}

export interface HourlyPoint {
  hour: number;
  visits: number;
}

export interface ShabbatDayPoint {
  date: string;
  count: number;
}

export interface DeviceBreakdown {
  device: string;
  count: number;
}

export interface BrowserBreakdown {
  browser: string;
  count: number;
}

export interface DashboardStats {
  visitsToday: number;
  visitsWeek: number;
  visitsAll: number;
  shabbatToday: number;
  shabbatAll: number;
  shabbatByType: Record<string, number>;
  shabbatEffectiveness: number;
  visitsOverTime: VisitDayPoint[];
  topPages: TopPagePoint[];
  hourlyTraffic: HourlyPoint[];
  shabbatOverTime: ShabbatDayPoint[];
  deviceBreakdown: DeviceBreakdown[];
  browserBreakdown: BrowserBreakdown[];
  recentPageViews: PageViewRow[];
  recentShabbatEvents: ShabbatEventRow[];
}

/** Postgres analytics store — admin-only raw IP access for site owner ops. */
class AnalyticsRepository {
  private schemaReady = false;

  private async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS page_views (
        id BIGSERIAL PRIMARY KEY,
        path TEXT NOT NULL,
        user_id TEXT,
        session_id TEXT NOT NULL,
        ip TEXT NOT NULL,
        user_agent TEXT NOT NULL,
        referrer TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        user_id TEXT,
        first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
        ip TEXT NOT NULL,
        user_agent TEXT NOT NULL,
        country TEXT,
        city TEXT
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS live_presence (
        id BIGSERIAL PRIMARY KEY,
        session_id TEXT NOT NULL UNIQUE,
        user_id TEXT,
        user_email TEXT,
        user_name TEXT,
        ip TEXT NOT NULL,
        user_agent TEXT NOT NULL,
        page TEXT NOT NULL DEFAULT '/watch',
        started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS shabbat_events (
        id BIGSERIAL PRIMARY KEY,
        event_type TEXT NOT NULL,
        session_id TEXT,
        user_id TEXT,
        ip TEXT NOT NULL,
        user_agent TEXT NOT NULL,
        path TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS users_seen (
        user_id TEXT PRIMARY KEY,
        email TEXT,
        name TEXT,
        avatar TEXT,
        first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shabbat_created ON shabbat_events (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_live_heartbeat ON live_presence (last_heartbeat DESC)`;
    this.schemaReady = true;
  }

  async recordPing(payload: PingPayload): Promise<void> {
    await this.ensureSchema();
    const sql = getSql();
    const path = payload.path.slice(0, 256);
    const sessionId = payload.sessionId.slice(0, 64);

    await sql`
      INSERT INTO page_views (path, user_id, session_id, ip, user_agent, referrer)
      VALUES (${path}, ${payload.userId ?? null}, ${sessionId}, ${payload.ip}, ${payload.userAgent}, ${payload.referrer ?? null})
    `;

    await sql`
      INSERT INTO sessions (session_id, user_id, ip, user_agent, first_seen, last_seen)
      VALUES (${sessionId}, ${payload.userId ?? null}, ${payload.ip}, ${payload.userAgent}, now(), now())
      ON CONFLICT (session_id) DO UPDATE SET
        last_seen = now(),
        user_id = COALESCE(EXCLUDED.user_id, sessions.user_id),
        ip = EXCLUDED.ip,
        user_agent = EXCLUDED.user_agent
    `;

    if (payload.userId) {
      await sql`
        INSERT INTO users_seen (user_id, email, name, first_seen, last_seen)
        VALUES (${payload.userId}, ${payload.userEmail ?? null}, ${payload.userName ?? null}, now(), now())
        ON CONFLICT (user_id) DO UPDATE SET
          last_seen = now(),
          email = COALESCE(EXCLUDED.email, users_seen.email),
          name = COALESCE(EXCLUDED.name, users_seen.name)
      `;
    }

    if (payload.isWatch) {
      await sql`
        INSERT INTO live_presence (session_id, user_id, user_email, user_name, ip, user_agent, page, started_at, last_heartbeat)
        VALUES (${sessionId}, ${payload.userId ?? null}, ${payload.userEmail ?? null}, ${payload.userName ?? null}, ${payload.ip}, ${payload.userAgent}, ${path}, now(), now())
        ON CONFLICT (session_id) DO UPDATE SET
          last_heartbeat = now(),
          user_id = COALESCE(EXCLUDED.user_id, live_presence.user_id),
          user_email = COALESCE(EXCLUDED.user_email, live_presence.user_email),
          user_name = COALESCE(EXCLUDED.user_name, live_presence.user_name),
          ip = EXCLUDED.ip,
          user_agent = EXCLUDED.user_agent
      `;
    }

    if (payload.isShabbat) {
      await this.recordShabbatEvent({
        eventType: "page_view_during_shabbat",
        sessionId,
        userId: payload.userId ?? null,
        ip: payload.ip,
        userAgent: payload.userAgent,
        path,
      });
    }
  }

  async recordShabbatEvent(event: {
    eventType: ShabbatEventType;
    sessionId?: string | null;
    userId?: string | null;
    ip: string;
    userAgent: string;
    path?: string | null;
  }): Promise<void> {
    await this.ensureSchema();
    const sql = getSql();
    await sql`
      INSERT INTO shabbat_events (event_type, session_id, user_id, ip, user_agent, path)
      VALUES (${event.eventType}, ${event.sessionId ?? null}, ${event.userId ?? null}, ${event.ip}, ${event.userAgent}, ${event.path?.slice(0, 256) ?? null})
    `;
  }

  async listLiveViewers(staleSeconds = 45): Promise<LiveViewer[]> {
    await this.ensureSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT id, session_id, user_id, user_email, user_name, ip, user_agent, started_at, last_heartbeat
      FROM live_presence
      WHERE last_heartbeat > now() - (${staleSeconds} || ' seconds')::interval
      ORDER BY last_heartbeat DESC
    `) as Array<{
      id: string;
      session_id: string;
      user_id: string | null;
      user_email: string | null;
      user_name: string | null;
      ip: string;
      user_agent: string;
      started_at: string;
      last_heartbeat: string;
    }>;

    return rows.map((r) => ({
      id: String(r.id),
      sessionId: r.session_id,
      userId: r.user_id,
      userEmail: r.user_email,
      userName: r.user_name,
      ip: r.ip,
      userAgent: r.user_agent,
      startedAt: r.started_at,
      lastHeartbeat: r.last_heartbeat,
    }));
  }

  async countUsersSeen(): Promise<number> {
    await this.ensureSchema();
    const sql = getSql();
    const rows = (await sql`SELECT COUNT(*)::int AS count FROM users_seen`) as { count: number }[];
    return rows[0]?.count ?? 0;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    await this.ensureSchema();
    const sql = getSql();

    const [visitsTodayRow] = (await sql`
      SELECT COUNT(*)::int AS count FROM page_views WHERE created_at >= date_trunc('day', now())
    `) as { count: number }[];

    const [visitsWeekRow] = (await sql`
      SELECT COUNT(*)::int AS count FROM page_views WHERE created_at >= now() - interval '7 days'
    `) as { count: number }[];

    const [visitsAllRow] = (await sql`
      SELECT COUNT(*)::int AS count FROM page_views
    `) as { count: number }[];

    const [shabbatTodayRow] = (await sql`
      SELECT COUNT(*)::int AS count FROM shabbat_events
      WHERE created_at >= date_trunc('day', now())
        AND event_type IN ('blocked_stream', 'blocked_chat', 'overlay_shown')
    `) as { count: number }[];

    const [shabbatAllRow] = (await sql`
      SELECT COUNT(*)::int AS count FROM shabbat_events
      WHERE event_type IN ('blocked_stream', 'blocked_chat', 'overlay_shown')
    `) as { count: number }[];

    const shabbatByTypeRows = (await sql`
      SELECT event_type, COUNT(*)::int AS count
      FROM shabbat_events
      GROUP BY event_type
      ORDER BY count DESC
    `) as { event_type: string; count: number }[];

    const [watchDuringShabbatRow] = (await sql`
      SELECT COUNT(*)::int AS count FROM shabbat_events WHERE event_type = 'page_view_during_shabbat'
    `) as { count: number }[];

    const shabbatBlocks = shabbatByTypeRows
      .filter((r) => ["blocked_stream", "blocked_chat", "overlay_shown"].includes(r.event_type))
      .reduce((sum, r) => sum + r.count, 0);

    const watchDuringShabbat = watchDuringShabbatRow?.count ?? 0;
    const shabbatEffectiveness =
      watchDuringShabbat > 0 ? Math.round((shabbatBlocks / watchDuringShabbat) * 100) : 0;

    const visitsOverTime = (await sql`
      SELECT to_char(d::date, 'YYYY-MM-DD') AS date, COALESCE(v.c, 0)::int AS visits
      FROM generate_series(now() - interval '6 days', now(), '1 day') AS d
      LEFT JOIN (
        SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS c
        FROM page_views
        WHERE created_at >= now() - interval '7 days'
        GROUP BY 1
      ) v ON v.day = d::date
      ORDER BY d
    `) as VisitDayPoint[];

    const topPages = (await sql`
      SELECT path, COUNT(*)::int AS visits
      FROM page_views
      WHERE created_at >= now() - interval '7 days'
      GROUP BY path
      ORDER BY visits DESC
      LIMIT 8
    `) as TopPagePoint[];

    const hourlyTraffic = (await sql`
      SELECT EXTRACT(HOUR FROM created_at)::int AS hour, COUNT(*)::int AS visits
      FROM page_views
      WHERE created_at >= now() - interval '24 hours'
      GROUP BY 1
      ORDER BY 1
    `) as HourlyPoint[];

    const shabbatOverTime = (await sql`
      SELECT to_char(d::date, 'YYYY-MM-DD') AS date, COALESCE(s.c, 0)::int AS count
      FROM generate_series(now() - interval '6 days', now(), '1 day') AS d
      LEFT JOIN (
        SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS c
        FROM shabbat_events
        WHERE created_at >= now() - interval '7 days'
          AND event_type IN ('blocked_stream', 'blocked_chat', 'overlay_shown')
        GROUP BY 1
      ) s ON s.day = d::date
      ORDER BY d
    `) as ShabbatDayPoint[];

    const deviceBreakdown = (await sql`
      SELECT
        CASE
          WHEN user_agent ILIKE '%mobile%' OR user_agent ILIKE '%android%' OR user_agent ILIKE '%iphone%' THEN 'mobile'
          WHEN user_agent ILIKE '%ipad%' OR user_agent ILIKE '%tablet%' THEN 'tablet'
          ELSE 'desktop'
        END AS device,
        COUNT(*)::int AS count
      FROM page_views
      WHERE created_at >= now() - interval '7 days'
      GROUP BY 1
      ORDER BY count DESC
    `) as DeviceBreakdown[];

    const browserBreakdown = (await sql`
      SELECT
        CASE
          WHEN user_agent ILIKE '%edg/%' THEN 'Edge'
          WHEN user_agent ILIKE '%chrome/%' AND user_agent NOT ILIKE '%edg/%' THEN 'Chrome'
          WHEN user_agent ILIKE '%firefox/%' THEN 'Firefox'
          WHEN user_agent ILIKE '%safari/%' AND user_agent NOT ILIKE '%chrome/%' THEN 'Safari'
          ELSE 'אחר'
        END AS browser,
        COUNT(*)::int AS count
      FROM page_views
      WHERE created_at >= now() - interval '7 days'
      GROUP BY 1
      ORDER BY count DESC
    `) as BrowserBreakdown[];

    const recentPageViews = (await sql`
      SELECT id, path, user_id, session_id, ip, user_agent, created_at
      FROM page_views
      ORDER BY created_at DESC
      LIMIT 20
    `) as Array<{
      id: string;
      path: string;
      user_id: string | null;
      session_id: string;
      ip: string;
      user_agent: string;
      created_at: string;
    }>;

    const recentShabbatEvents = (await sql`
      SELECT id, event_type, session_id, user_id, ip, user_agent, path, created_at
      FROM shabbat_events
      ORDER BY created_at DESC
      LIMIT 15
    `) as Array<{
      id: string;
      event_type: string;
      session_id: string | null;
      user_id: string | null;
      ip: string;
      user_agent: string;
      path: string | null;
      created_at: string;
    }>;

    const shabbatByType: Record<string, number> = {};
    for (const row of shabbatByTypeRows) shabbatByType[row.event_type] = row.count;

    return {
      visitsToday: visitsTodayRow?.count ?? 0,
      visitsWeek: visitsWeekRow?.count ?? 0,
      visitsAll: visitsAllRow?.count ?? 0,
      shabbatToday: shabbatTodayRow?.count ?? 0,
      shabbatAll: shabbatAllRow?.count ?? 0,
      shabbatByType,
      shabbatEffectiveness,
      visitsOverTime,
      topPages,
      hourlyTraffic,
      shabbatOverTime,
      deviceBreakdown,
      browserBreakdown,
      recentPageViews: recentPageViews.map((r) => ({
        id: String(r.id),
        path: r.path,
        userId: r.user_id,
        sessionId: r.session_id,
        ip: r.ip,
        userAgent: r.user_agent,
        createdAt: r.created_at,
      })),
      recentShabbatEvents: recentShabbatEvents.map((r) => ({
        id: String(r.id),
        eventType: r.event_type as ShabbatEventType,
        sessionId: r.session_id,
        userId: r.user_id,
        ip: r.ip,
        userAgent: r.user_agent,
        path: r.path,
        createdAt: r.created_at,
      })),
    };
  }
}

export const analyticsRepo = new AnalyticsRepository();
