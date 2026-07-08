"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Icon } from "@/components/Icon";
import { truncateUserAgent } from "@/lib/userAgent";
import type { DashboardStats, LiveViewer } from "@/lib/analyticsRepo";

interface StatsResponse {
  stats: DashboardStats;
  users: {
    clerkTotal: number;
    clerkNewWeek: number;
    usersSeenDb: number;
    recentSignups: Array<{ id: string; email: string | null; name: string | null; createdAt: number }>;
  };
}

const CHART_COLORS = ["#6366f1", "#22d3ee", "#a855f7", "#f59e0b", "#10b981", "#f43f5e"];

const SHABBAT_LABELS: Record<string, string> = {
  blocked_stream: "חסימת שידור",
  blocked_chat: "חסימת צ׳אט",
  banner_shown: "באנר לפני שבת",
  overlay_shown: "מסך שבת",
  page_view_during_shabbat: "צפיות בשבת",
};

function AnimatedValue({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const steps = 24;
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      setDisplay(Math.round(start + (diff * step) / steps));
      if (step >= steps) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [value]);
  return <>{display.toLocaleString("he-IL")}</>;
}

function KpiCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: number;
  sub?: string;
  accent: string;
  icon: "live" | "user" | "calendar" | "info";
}) {
  return (
    <div className="card glass group relative overflow-hidden p-5 shadow-card transition hover:border-pitch-brand/40">
      <div className={`pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl ${accent}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">
            <AnimatedValue value={value} />
          </p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient shadow-glow">
          <Icon name={icon} size={20} className="text-white" />
        </span>
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(startIso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(startIso).getTime()) / 60_000));
  if (mins < 60) return `${mins} דק׳`;
  return `${Math.floor(mins / 60)}ש׳ ${mins % 60}ד׳`;
}

/** Premium RTL ops dashboard with live polling. */
export function AdminDashboard() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [live, setLive] = useState<LiveViewer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [statsRes, liveRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/live"),
        ]);
        if (!statsRes.ok || !liveRes.ok) throw new Error("forbidden_or_failed");
        const statsJson = (await statsRes.json()) as StatsResponse;
        const liveJson = (await liveRes.json()) as { viewers: LiveViewer[] };
        if (!active) return;
        setData(statsJson);
        setLive(liveJson.viewers);
        setError(null);
      } catch {
        if (active) setError("לא ניתן לטעון נתונים");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const statsId = setInterval(load, 10_000);
    return () => {
      active = false;
      clearInterval(statsId);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-28 animate-pulse bg-white/5" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card glass p-8 text-center">
        <p className="text-lg font-bold text-pitch-live">{error ?? "שגיאה"}</p>
      </div>
    );
  }

  const { stats, users } = data;
  const visitsChart = stats.visitsOverTime.map((d) => ({
    ...d,
    label: d.date.slice(5),
  }));

  return (
    <div className="space-y-6 pb-10">
      <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-pitch-card/60 p-6 shadow-card">
        <div className="pointer-events-none absolute inset-0 bg-brand-radial opacity-60" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">StreamNet Ops Center</p>
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              לוח בקרה <span className="brand-text">אנליטיקס</span>
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              נתונים בזמן אמת · עדכון אוטומטי כל 10 שניות · גישה מוגבלת לבעלים בלבד
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-pitch-live/30 bg-pitch-live/10 px-3 py-2 text-sm font-bold text-pitch-live">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pitch-live opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-pitch-live" />
            </span>
            {live.length} צופים חיים עכשיו
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="ביקורים היום"
          value={stats.visitsToday}
          sub={`7 ימים: ${stats.visitsWeek.toLocaleString("he-IL")} · סה״כ: ${stats.visitsAll.toLocaleString("he-IL")}`}
          accent="bg-pitch-brand"
          icon="calendar"
        />
        <KpiCard
          label="משתמשים רשומים"
          value={users.clerkTotal}
          sub={`חדשים השבוע: ${users.clerkNewWeek} · פעילים באתר: ${users.usersSeenDb}`}
          accent="bg-cyan-400"
          icon="user"
        />
        <KpiCard
          label="צופים בלייב (/watch)"
          value={live.length}
          sub="נוכחות בזמן אמת"
          accent="bg-pitch-live"
          icon="live"
        />
        <KpiCard
          label="חסימות שבת"
          value={stats.shabbatToday}
          sub={`סה״כ: ${stats.shabbatAll} · יעילות: ${stats.shabbatEffectiveness}%`}
          accent="bg-pitch-gold"
          icon="info"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="ביקורים — 7 ימים אחרונים">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={visitsChart}>
              <defs>
                <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} width={36} />
              <Tooltip
                contentStyle={{ background: "#0f1424", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                labelStyle={{ color: "#9ca3af" }}
              />
              <Area type="monotone" dataKey="visits" stroke="#818cf8" fill="url(#visitsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="דפים מובילים">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.topPages} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" stroke="#6b7280" fontSize={11} />
              <YAxis type="category" dataKey="path" stroke="#9ca3af" fontSize={10} width={88} />
              <Tooltip
                contentStyle={{ background: "#0f1424", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
              />
              <Bar dataKey="visits" radius={[0, 6, 6, 0]}>
                {stats.topPages.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="תנועה לפי שעה (24ש׳)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.hourlyTraffic}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="hour" stroke="#6b7280" fontSize={11} tickFormatter={(h) => `${h}:00`} />
              <YAxis stroke="#6b7280" fontSize={11} width={36} />
              <Tooltip
                contentStyle={{ background: "#0f1424", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                labelFormatter={(h) => `שעה ${h}:00`}
              />
              <Bar dataKey="visits" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="אירועי שבת — 7 ימים">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.shabbatOverTime.map((d) => ({ ...d, label: d.date.slice(5) }))}>
              <defs>
                <linearGradient id="shabbatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} width={36} />
              <Tooltip
                contentStyle={{ background: "#0f1424", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
              />
              <Area type="monotone" dataKey="count" stroke="#fbbf24" fill="url(#shabbatGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="מכשירים" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.deviceBreakdown} dataKey="count" nameKey="device" innerRadius={50} outerRadius={78} paddingAngle={3}>
                {stats.deviceBreakdown.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f1424", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-gray-400">
            {stats.deviceBreakdown.map((d, i) => (
              <span key={d.device} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {d.device} ({d.count})
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="דפדפנים" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.browserBreakdown}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="browser" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} width={36} />
              <Tooltip contentStyle={{ background: "#0f1424", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="card glass overflow-hidden shadow-card">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-black text-white">צופים חיים ב־/watch</h2>
            <p className="text-xs text-gray-500">IP, User-Agent ופרטי משתמש · רענון אוטומטי</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/5 text-right text-xs text-gray-500">
                  <th className="px-4 py-3 font-bold">משתמש</th>
                  <th className="px-4 py-3 font-bold">IP</th>
                  <th className="px-4 py-3 font-bold">דפדפן</th>
                  <th className="px-4 py-3 font-bold">מאז</th>
                  <th className="px-4 py-3 font-bold">נראה לאחרונה</th>
                </tr>
              </thead>
              <tbody>
                {live.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      אין צופים פעילים כרגע
                    </td>
                  </tr>
                ) : (
                  live.map((v) => (
                    <tr key={v.id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        <p className="font-bold text-white">{v.userName || v.userEmail || "אנונימי"}</p>
                        {v.userEmail && <p className="text-xs text-gray-500">{v.userEmail}</p>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-pitch-accent">{v.ip}</td>
                      <td className="px-4 py-3 text-xs text-gray-400" title={v.userAgent}>
                        {truncateUserAgent(v.userAgent, 36)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDuration(v.startedAt)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatTime(v.lastHeartbeat)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card glass overflow-hidden shadow-card">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-black text-white">שבת — פירוט חסימות</h2>
            <p className="text-xs text-gray-500">יעילות: {stats.shabbatEffectiveness}% מול צפיות בשבת</p>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-2">
            {Object.entries(stats.shabbatByType).map(([type, count]) => (
              <div key={type} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-xs text-gray-500">{SHABBAT_LABELS[type] ?? type}</p>
                <p className="text-xl font-black text-pitch-gold">{count.toLocaleString("he-IL")}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ActivityFeed
          title="ביקורים אחרונים"
          items={stats.recentPageViews.map((v) => ({
            id: v.id,
            primary: v.path,
            secondary: `${v.ip} · ${truncateUserAgent(v.userAgent, 32)}`,
            time: formatTime(v.createdAt),
          }))}
        />
        <ActivityFeed
          title="אירועי שבת אחרונים"
          items={stats.recentShabbatEvents.map((e) => ({
            id: e.id,
            primary: SHABBAT_LABELS[e.eventType] ?? e.eventType,
            secondary: `${e.ip} · ${e.path ?? "—"}`,
            time: formatTime(e.createdAt),
          }))}
        />
      </div>

      {users.recentSignups.length > 0 && (
        <section className="card glass p-5 shadow-card">
          <h2 className="text-lg font-black text-white">הרשמות אחרונות (Clerk)</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {users.recentSignups.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="font-bold text-white">{u.name ?? "משתמש חדש"}</p>
                  <p className="text-xs text-gray-500">{u.email ?? u.id}</p>
                </div>
                <p className="text-xs text-gray-500">{formatTime(new Date(u.createdAt).toISOString())}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`card glass p-5 shadow-card ${className}`}>
      <h2 className="mb-4 text-sm font-black text-white">{title}</h2>
      {children}
    </div>
  );
}

function ActivityFeed({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; primary: string; secondary: string; time: string }>;
}) {
  return (
    <section className="card glass overflow-hidden shadow-card">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-black text-white">{title}</h2>
      </div>
      <ul className="max-h-80 divide-y divide-white/5 overflow-y-auto">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3 transition hover:bg-white/[0.03]">
            <div className="min-w-0">
              <p className="truncate font-bold text-gray-200">{item.primary}</p>
              <p className="truncate text-xs text-gray-500">{item.secondary}</p>
            </div>
            <time className="shrink-0 text-xs text-gray-500">{item.time}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}
