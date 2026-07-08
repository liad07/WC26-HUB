import { buildHighlightsUrl } from "@/lib/scheduleTimeline";

interface HighlightsLinkProps {
  home: string;
  away: string;
  className?: string;
}

/** External YouTube search link for finished-match highlights. */
export function HighlightsLink({ home, away, className = "btn-ghost" }: HighlightsLinkProps) {
  return (
    <a
      href={buildHighlightsUrl(home, away)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <span aria-hidden>▶</span>
      תקציר
    </a>
  );
}
