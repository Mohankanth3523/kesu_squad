import { Link } from 'react-router';
import { Badge, Icon } from '@/components/ui';
import { relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import type { DonationListing } from '@/types/domain';
import { CONDITION_LABEL } from '@/types/labels';
import { BookCover } from '../books/BookCover';

export function DonationCard({ donation }: { donation: DonationListing }) {
  return (
    <article className="group relative flex gap-4 rounded-[var(--radius-surface)] border border-line bg-charcoal p-4 transition-colors hover:border-gold/40">
      <BookCover title={donation.title} author={donation.author} photo={donation.photos[0]} tone="champagne" size="sm" className="w-24 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="success" icon="free">
            Free
          </Badge>
          {donation.quantity > 1 && <Badge tone="outline">{donation.quantity} books</Badge>}
          {donation.status === 'reserved' && <Badge tone="gold">Promised</Badge>}
        </div>
        <h3 className="mt-2 line-clamp-2 text-[0.9375rem] leading-snug font-medium text-white group-hover:text-champagne">
          <Link to={paths.donation(donation.id)} className="after:absolute after:inset-0">
            {donation.title}
          </Link>
        </h3>
        <p className="mt-0.5 truncate text-sm text-muted">
          {donation.subject} · {CONDITION_LABEL[donation.condition]}
        </p>
        <p className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs text-mist">
          <Icon name="courier" size="xs" className="text-gold" />
          {donation.donorCoversShipping ? 'Donor covers the courier' : 'You pay only the agreed courier charge'}
        </p>
        <p className="mt-1 truncate text-xs text-muted">
          {donation.owner.displayName}
          {donation.city ? ` · ${donation.city}` : ''} · {relativeTime(donation.createdAt)}
        </p>
      </div>
    </article>
  );
}
