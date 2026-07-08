interface SkeletonProps {
  className?: string;
}

function Bar({ className = "" }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden rounded bg-pitch-border/60 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-l from-transparent via-white/10 to-transparent" />
    </div>
  );
}

/** Placeholder card matching MatchCard dimensions. */
export function MatchCardSkeleton() {
  return (
    <div className="rounded-2xl border border-pitch-border bg-pitch-card p-4">
      <Bar className="mb-4 h-3 w-24" />
      <div className="flex items-center justify-between">
        <div className="flex flex-1 flex-col items-center gap-2">
          <Bar className="h-10 w-10 rounded-full" />
          <Bar className="h-3 w-16" />
        </div>
        <Bar className="h-8 w-14" />
        <div className="flex flex-1 flex-col items-center gap-2">
          <Bar className="h-10 w-10 rounded-full" />
          <Bar className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

/** Grid of match skeletons. */
export function MatchListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Bar key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}
