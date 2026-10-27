import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDuration } from '@/lib/format';

/**
 * Placeholder artwork for videos until real thumbnails arrive (OQ-11).
 * Deterministic per video: a warm-tinted field with concentric gold arcs.
 */
export function VideoThumb({ hue, duration, vertical, className }: { hue: number; duration: number; vertical?: boolean; className?: string }) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-[var(--radius-surface)] border border-line', vertical ? 'aspect-[9/16]' : 'aspect-video', className)}
      style={{ background: `radial-gradient(120% 90% at 20% 15%, hsl(${hue} 38% 18%) 0%, hsl(${hue} 30% 9%) 55%, #0b0b0b 100%)` }}
    >
      <svg aria-hidden="true" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full opacity-40">
        {[18, 30, 42, 54, 66].map((r) => (
          <circle key={r} cx="128" cy="78" r={r} fill="none" stroke="#D4AF37" strokeOpacity={0.5 - r / 200} strokeWidth="0.4" />
        ))}
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-12 place-items-center rounded-full border border-gold/60 bg-ink/50 text-gold backdrop-blur-sm transition-colors group-hover:bg-gold group-hover:text-ink">
          <Icon name="play" className="translate-x-px" />
        </span>
      </span>
      <span className="absolute right-2 bottom-2 rounded bg-ink/80 px-1.5 py-0.5 text-xs text-white tabular-nums">{formatDuration(duration)}</span>
    </div>
  );
}
