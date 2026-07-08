import Link from "next/link";
import type { MatchStatus } from "@/types/match";
import { TeamCrest } from "@/components/TeamCrest";

export { TeamCrest };

/** Pulsing red badge shown for live matches. */
export function LiveBadge({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-pitch-live/15 px-2.5 py-0.5 text-xs font-black text-pitch-live ring-1 ring-pitch-live/30">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pitch-live opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-pitch-live" />
      </span>
      {label}
    </span>
  );
}

const STATUS_STYLE: Record<MatchStatus, string> = {
  LIVE: "bg-pitch-live/15 text-pitch-live",
  HALF_TIME: "bg-amber-500/15 text-amber-400",
  NOT_STARTED: "bg-pitch-border text-gray-300",
  FINISHED: "bg-pitch-border text-gray-400",
  POSTPONED: "bg-pitch-border text-gray-500",
  UNKNOWN: "bg-pitch-border text-gray-500",
};

export function StatusPill({ status, label }: { status: MatchStatus; label: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}>
      {label}
    </span>
  );
}

/** Page-level heading block with eyebrow, gradient-capable title and subtitle. */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
  live = false,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  live?: boolean;
}) {
  return (
    <header className="bracket-hero relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8">
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="flex items-center gap-2.5 text-2xl font-black text-white sm:text-3xl">
        {live && (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pitch-live opacity-70" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-pitch-live" />
          </span>
        )}
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-sm text-gray-400">{subtitle}</p>}
    </header>
  );
}

/** Consistent section heading with optional live dot and trailing link. */
export function SectionHeader({
  title,
  live = false,
  linkHref,
  linkLabel,
}: {
  title: string;
  live?: boolean;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-black text-white">
        {live && <span className="h-2.5 w-2.5 animate-pulse-live rounded-full bg-pitch-live" />}
        {title}
      </h2>
      {linkHref && (
        <Link href={linkHref} className="text-sm font-bold text-pitch-accent transition hover:brightness-110">
          {linkLabel ?? "הצג הכל"} ←
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-2xl border-dashed px-6 py-14 text-center">
      <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-3xl">🗓️</span>
      <p className="font-bold text-gray-100">{title}</p>
      {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, retryHref }: { message: string; retryHref?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-pitch-live/30 bg-pitch-live/5 px-6 py-14 text-center">
      <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-pitch-live/10 text-3xl">⚠️</span>
      <p className="font-black text-pitch-live">אופס, משהו השתבש</p>
      <p className="mt-1 text-sm text-gray-400">{message}</p>
      {retryHref && (
        <Link href={retryHref} className="btn-primary mt-4">
          נסה שוב
        </Link>
      )}
    </div>
  );
}
