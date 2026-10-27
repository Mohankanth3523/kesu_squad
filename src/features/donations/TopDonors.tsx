import { Link } from 'react-router';
import { Avatar, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { paths } from '@/lib/routes';
import type { DonorStanding } from '@/types/domain';

const RANK_STYLE = ['text-champagne', 'text-gold', 'text-gold-deep'] as const;

/** Top donors list; the top three are highlighted in gold (C1 §5). */
export function TopDonors({ standings }: { standings: DonorStanding[] }) {
  return (
    <ol className="divide-y divide-line">
      {standings.map((s, i) => (
        <li key={s.donor.id} className="flex items-center gap-4 py-3.5">
          <span className={cn('w-7 text-center font-display text-2xl tabular-nums', RANK_STYLE[i] ?? 'text-mist')}>{s.rank}</span>
          <Avatar name={s.donor.displayName} />
          <Link to={paths.profile(s.donor.displayName)} className="min-w-0 flex-1 truncate text-white hover:text-champagne">
            {s.donor.displayName}
          </Link>
          <span className="inline-flex items-center gap-1.5 text-sm text-mist tabular-nums">
            {s.rank === 1 && <Icon name="crown" size="sm" className="text-champagne" label="Top donor" />}
            {s.booksDonated} books
          </span>
        </li>
      ))}
    </ol>
  );
}
