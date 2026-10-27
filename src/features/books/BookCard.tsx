import { Link } from 'react-router';
import { Badge, Icon } from '@/components/ui';
import { formatINR } from '@/lib/format';
import { paths } from '@/lib/routes';
import type { SaleListing } from '@/types/domain';
import { CONDITION_LABEL } from '@/types/labels';
import { BookCover } from './BookCover';

export function BookCard({ book }: { book: SaleListing }) {
  return (
    <article className="group relative flex flex-col">
      <div className="relative">
        <BookCover title={book.title} author={book.author} photo={book.photos[0]} className="transition-colors group-hover:border-gold/45" />
        {book.status === 'reserved' && (
          <Badge tone="gold" className="absolute top-2 right-2 bg-ink/85">
            Reserved
          </Badge>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {book.isCurrentEdition ? <Badge tone="gold">Current edition</Badge> : <Badge tone="outline">Older edition</Badge>}
        <Badge tone="outline">{book.publicationYear}</Badge>
      </div>
      <h3 className="mt-2 line-clamp-2 text-[0.9375rem] leading-snug font-medium text-white group-hover:text-champagne">
        <Link to={paths.book(book.id)} className="after:absolute after:inset-0">
          {book.title}
        </Link>
      </h3>
      <p className="mt-0.5 truncate text-sm text-muted">
        {book.subject} · {CONDITION_LABEL[book.condition]}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-lg font-semibold text-champagne tabular-nums">{formatINR(book.askingPrice)}</span>
        <span className="text-sm text-muted line-through tabular-nums">
          <span className="sr-only">Printed price </span>
          {formatINR(book.originalPrice)}
        </span>
      </div>
      {book.city && (
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
          <Icon name="location" size="xs" />
          {book.city}
        </p>
      )}
    </article>
  );
}
