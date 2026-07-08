import Link from "next/link";
import { matchProvider } from "@/lib/matchProvider";
import { toIsraelDateKey } from "@/lib/date";
import { isLiveStatus } from "@/lib/format";
import { MatchCard } from "@/components/MatchCard";
import { FeaturedMatch } from "@/components/FeaturedMatch";
import { LiveScores } from "@/components/LiveScores";
import { Countdown } from "@/components/Countdown";
import { EmptyState, SectionHeader } from "@/components/common";
import { Icon, type IconName } from "@/components/Icon";
import type { Match } from "@/types/match";

export const dynamic = "force-dynamic";

const FEATURES: { href: string; label: string; desc: string; icon: IconName }[] = [
  { href: "/watch", label: "שידור חי", desc: "צפייה ישירה באיכות HD", icon: "tv" },
  { href: "/live", label: "תוצאות לייב", desc: "גולים ואירועים בזמן אמת", icon: "live" },
  { href: "/tournament?tab=knockout", label: "בראקט הנוקאאוט", desc: "הדרך אל הגמר", icon: "bracket" },
  { href: "/chat", label: "צ׳אט קהילה", desc: "אלפי אוהדים בזמן אמת", icon: "chat" },
];

const WORLD_CUP_FINAL = "2026-07-19T22:00:00+03:00";

/** Picks the most relevant match: a live one, else the next upcoming. */
function pickFeatured(matches: Match[]): Match | null {
  const live = matches.find((m) => isLiveStatus(m.status));
  if (live) return live;
  const upcoming = matches
    .filter((m) => m.status === "NOT_STARTED")
    .sort((a, b) => a.timestamp - b.timestamp);
  return upcoming[0] ?? matches[0] ?? null;
}

export default async function HomePage() {
  let today: Match[] = [];
  try {
    today = (await matchProvider.getFixturesByDate(toIsraelDateKey())).data;
  } catch {
    today = [];
  }
  const featured = pickFeatured(today);

  return (
    <div className="space-y-8">
      <Hero />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <Link key={f.href} href={f.href} className="card card-hover group flex items-start gap-3 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow transition group-hover:scale-105">
              <Icon name={f.icon} size={20} />
            </span>
            <span>
              <span className="block font-black text-white">{f.label}</span>
              <span className="block text-xs text-gray-500">{f.desc}</span>
            </span>
          </Link>
        ))}
      </section>

      {featured && (
        <section>
          <SectionHeader title="המשחק המרכזי" />
          <FeaturedMatch match={featured} />
        </section>
      )}

      <section>
        <SectionHeader title="משחקים חיים" live />
        <LiveScores />
      </section>

      <section>
        <SectionHeader title="משחקים היום" linkHref="/schedule" linkLabel="לכל המשחקים" />
        {today.length === 0 ? (
          <EmptyState title="אין משחקים היום" hint="בדקו את לוח השידורים לימים הקרובים" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {today
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
          </div>
        )}
      </section>

      <CountdownBar />
    </div>
  );
}

/** Full-bleed cinematic hero with stadium backdrop and primary CTAs. */
function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 shadow-card">
      <div className="absolute inset-0 bg-[url('/images/hero-stadium.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-l from-pitch-bg via-pitch-bg/80 to-pitch-bg/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-pitch-bg/90 via-transparent to-transparent" />

      <div className="relative max-w-xl p-6 sm:p-10">
        <p className="eyebrow mb-3">ברוכים הבאים ל־</p>
        <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
          מונדיאל <span className="brand-text">עכשיו</span>
        </h1>
        <p className="mt-3 max-w-md text-sm text-gray-300 sm:text-base">
          כל המונדיאל במקום אחד — שידורים חיים, תוצאות בזמן אמת, טבלאות, בראקט הנוקאאוט וצ׳אט אוהדים חוצה גבולות.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/watch" className="btn-primary">
            <Icon name="play" size={16} />
            צפו עכשיו
          </Link>
          <Link href="/schedule" className="btn-ghost">
            גלה משחקים
          </Link>
        </div>
      </div>
    </section>
  );
}

/** World Cup countdown strip mirroring the reference dashboard footer bar. */
function CountdownBar() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-l from-pitch-brand2/25 via-pitch-brand/15 to-transparent p-5 sm:p-6">
      <div className="pointer-events-none absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-pitch-brand/30 blur-3xl" />
      <div className="relative flex flex-col items-center justify-between gap-5 sm:flex-row">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-3xl ring-1 ring-white/10">🏆</span>
          <div>
            <p className="text-lg font-black text-white">FIFA World Cup 2026</p>
            <p className="text-sm text-gray-400">11 ביוני – 19 ביולי 2026</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          <Countdown target={WORLD_CUP_FINAL} />
          <Link href="/schedule" className="btn-ghost whitespace-nowrap">
            <Icon name="calendar" size={16} />
            לוח מלא
          </Link>
        </div>
      </div>
    </section>
  );
}
