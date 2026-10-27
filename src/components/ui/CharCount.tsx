import { cn } from '@/lib/cn';

/** "120 / 500" counter that turns red past the limit. Announced politely only near the limit. */
export function CharCount({ value, max, className }: { value: string; max: number; className?: string }) {
  const n = value.trim().length;
  const near = n > max * 0.9;
  return (
    <span aria-live={near ? 'polite' : 'off'} className={cn('text-xs tabular-nums', n > max ? 'text-danger' : near ? 'text-champagne' : 'text-muted', className)}>
      {n.toLocaleString('en-IN')} / {max.toLocaleString('en-IN')}
    </span>
  );
}
