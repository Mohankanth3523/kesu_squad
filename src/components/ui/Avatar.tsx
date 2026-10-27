import { cn } from '@/lib/cn';

/** Initial-based avatar; hue derived from the name so it stays stable. */
export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const initial = name.replace(/[^a-z0-9]/gi, '').charAt(0).toUpperCase() || '?';
  const dims = { sm: 'size-7 text-xs', md: 'size-9 text-sm', lg: 'size-14 text-xl' }[size];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full border hairline-gold bg-charcoal-high font-display font-semibold text-champagne',
        dims,
        className,
      )}
    >
      {initial}
    </span>
  );
}
