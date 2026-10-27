import { cn } from '@/lib/cn';
import type { ListingPhoto } from '@/types/domain';

/**
 * Listing cover. Shows the first photo when the seller added one; otherwise a
 * typographic cover with a gold spine band and the title set in the display face.
 */
export function BookCover({
  title,
  author,
  photo,
  tone = 'gold',
  size = 'md',
  className,
}: {
  title: string;
  author: string;
  photo?: ListingPhoto;
  tone?: 'gold' | 'champagne';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  if (photo) {
    return (
      <div className={cn('relative aspect-[3/4] overflow-hidden rounded-[var(--radius-field)] border border-line bg-charcoal', className)}>
        <img src={photo.src} alt={photo.alt} loading="lazy" className="size-full object-cover" />
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn('relative flex aspect-[3/4] overflow-hidden rounded-[var(--radius-field)] border border-line bg-gradient-to-br from-charcoal-high to-ink-raised', className)}
    >
      <span className={cn('shrink-0', size === 'sm' ? 'w-1.5' : 'w-2.5', tone === 'gold' ? 'bg-gold/70' : 'bg-champagne/60')} />
      <div className={cn('flex min-w-0 flex-1 flex-col justify-between', size === 'sm' ? 'p-2' : size === 'lg' ? 'p-6' : 'p-4')}>
        <p className={cn('font-display leading-tight text-white', size === 'sm' ? 'line-clamp-4 text-xs' : size === 'lg' ? 'line-clamp-6 text-2xl' : 'line-clamp-4 text-lg')}>{title}</p>
        <p className={cn('truncate text-mist', size === 'lg' ? 'text-sm' : 'text-xs')}>{author}</p>
      </div>
    </div>
  );
}
