import { LoadingRegion, Skeleton } from '@/components/ui';

export function GridSkeleton({ count, aspect = 'aspect-[3/4]', cols = 'grid-cols-2 md:grid-cols-4' }: { count: number; aspect?: string; cols?: string }) {
  return (
    <LoadingRegion className={`grid gap-5 ${cols}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-2.5">
          <Skeleton className={`${aspect} w-full rounded-[var(--radius-surface)]`} />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
      ))}
    </LoadingRegion>
  );
}

export function ListSkeleton({ rows = 4, compact }: { rows?: number; compact?: boolean }) {
  return (
    <LoadingRegion className="space-y-5">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className={compact ? 'size-9 rounded-full' : 'h-12 w-10'} />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            {!compact && <Skeleton className="h-3.5 w-1/2" />}
          </div>
        </div>
      ))}
    </LoadingRegion>
  );
}

export function DetailSkeleton() {
  return (
    <LoadingRegion label="Loading" className="grid gap-8 py-8 md:grid-cols-[minmax(0,20rem)_1fr]">
      <Skeleton className="aspect-[3/4] w-full rounded-[var(--radius-surface)]" />
      <div className="space-y-4">
        <Skeleton className="h-9 w-4/5" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-48 rounded-full" />
      </div>
    </LoadingRegion>
  );
}
