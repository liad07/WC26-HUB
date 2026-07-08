import type { ReactNode } from "react";
import { PageHeader } from "@/components/common";

export const metadata = { title: "אודות · World Cup Hub" };

interface Era {
  tag: string;
  year: string;
  title: string;
  role: string;
  body: string;
  github?: string;
  live?: string;
}

const ERAS: Era[] = [
  {
    tag: "2019",
    year: "01",
    title: "Crack Apps",
    role: "הסטודיו · היוצרים",
    body: "הפורטל האישי שבו הכול התחיל — אפליקציות, משחקים, מדריכים, הורדות ופרויקטים אישיים. הבית שממנו צמח כל השאר.",
    github: "https://github.com/liad07/crack-apps.github.io",
  },
  {
    tag: "פרויקט הגמר",
    year: "02",
    title: "StreamNet",
    role: "פלטפורמת הסטרימינג",
    body: "החלק הגדול ביותר בתוך Crack Apps, שהתמקד אך ורק בשידורים חיים והפך לפרויקט הגמר של התיכון. ערוצים, צ׳אט ערוצים, קהילה, פרופילי משתמשים ופאנל ניהול — פלטפורמה שלמה עם זהות משלה.",
    github: "https://github.com/liad07/StreamNet",
  },
  {
    tag: "2026",
    year: "03",
    title: "World Cup Hub",
    role: "החוויה הנוכחית",
    body: "הדור הבא של StreamNet — האבולוציה שלו לאחר שנים לפלטפורמת ספורט פרימיום. שידורים חיים, תוצאות בזמן אמת, טבלאות, בראקט וצ׳אט אוהדים, סביב מונדיאל 2026.",
    github: "https://github.com/liad07/WC26-HUB",
    live: "https://mundial-now.vercel.app",
  },
];

function EraLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-white underline decoration-pitch-accent/50 underline-offset-4 transition hover:text-pitch-accent hover:decoration-pitch-accent"
    >
      {children}
    </a>
  );
}

function EraLinks({ github, live }: { github?: string; live?: string }) {
  if (!github && !live) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
      {github ? (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pitch-accent transition hover:text-white"
        >
          View on GitHub →
        </a>
      ) : null}
      {live ? (
        <a
          href={live}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 transition hover:text-white"
        >
          Live app →
        </a>
      ) : null}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Crack Apps · StreamNet · World Cup Hub"
        title="הסיפור מאחורי הפלטפורמה"
        subtitle="המשך ישיר של StreamNet — מפלטפורמת השידורים החיים שגדלה כפרויקט גמר, עכשיו בדור חדש."
      />

      <ol className="relative space-y-4">
        {ERAS.map((era, i) => (
          <li key={era.title} className="card card-hover relative p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="brand-text shrink-0 text-4xl font-black tabular-nums sm:text-5xl">{era.year}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-white">
                    {era.github ? <EraLink href={era.github}>{era.title}</EraLink> : era.title}
                  </h2>
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-bold text-pitch-accent ring-1 ring-white/10">
                    {era.tag}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-400">{era.role}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{era.body}</p>
                <EraLinks github={era.github} live={era.live} />
              </div>
            </div>
            {i < ERAS.length - 1 && (
              <span className="pointer-events-none absolute bottom-0 right-9 hidden h-4 w-px translate-y-full bg-white/10 sm:block" />
            )}
          </li>
        ))}
      </ol>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-l from-pitch-brand2/20 via-pitch-brand/12 to-transparent p-6 text-center sm:p-8">
        <p className="text-lg font-black text-white">"Streaming Everything You Need"</p>
        <p className="mt-1 text-sm text-gray-400">
          המשימה המקורית של StreamNet — להביא שידורים חיים ישירות אל הדפדפן. היום, בגרסת StreamNet 2.0.
        </p>
        <p className="mt-4 text-xs text-gray-500">
          נבנה באהבה ❤️ ע״י <EraLink href="https://github.com/liad07/crack-apps.github.io">Crack Apps</EraLink> · מבוסס על{" "}
          <EraLink href="https://github.com/liad07/StreamNet">StreamNet</EraLink>
        </p>
      </section>
    </div>
  );
}
