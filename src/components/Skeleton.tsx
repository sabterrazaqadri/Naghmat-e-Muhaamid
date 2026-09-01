/**
 * Shape-matched loading placeholder. The point is that it occupies the same
 * box the real content will, so nothing jumps when results arrive — a bare
 * spinner tells the reader nothing about what is coming.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[color-mix(in_oklab,var(--foreground)_12%,transparent)] ${className}`}
    />
  );
}

/** One placeholder row shaped like a command-palette result. */
export function SkeletonResultRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <Skeleton className="size-9 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-[55%]" />
        <Skeleton className="h-3 w-[32%]" />
      </div>
    </div>
  );
}
