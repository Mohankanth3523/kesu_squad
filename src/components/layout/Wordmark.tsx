import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { paths } from '@/lib/routes';

/** Typographic wordmark until a logo is supplied (OQ-46). */
export function Wordmark({ className, to = paths.home }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn('group inline-flex items-baseline gap-[0.35em] font-display leading-none tracking-[0.14em] text-gold', className)}
      aria-label="Kesh Squad home"
    >
      <span className="font-semibold">KESH</span>
      <span className="font-normal text-white transition-colors group-hover:text-champagne">SQUAD</span>
    </Link>
  );
}
