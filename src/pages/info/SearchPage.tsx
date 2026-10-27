import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState, ErrorState, SearchField } from '@/components/ui';
import { ListSkeleton } from '@/components/shared/Skeletons';
import { BookCard } from '@/features/books/BookCard';
import { PostRow } from '@/features/community/PostRow';
import { VideoCard } from '@/features/content/VideoCard';
import { DonationCard } from '@/features/donations/DonationCard';
import { useAsync } from '@/hooks/useAsync';
import { useDebounced } from '@/hooks/useDebounced';
import { useQueryParams } from '@/hooks/useQueryParams';
import { paths } from '@/lib/routes';
import { services } from '@/services';

/** Global search (C1 §8): books, donations, discussions and videos, grouped. */
export default function SearchPage() {
  const { get, set } = useQueryParams();
  const [q, setQ] = useState(get('q'));
  const debounced = useDebounced(q.trim(), 300);
  useEffect(() => set({ q: debounced }), [debounced, set]);
  const results = useAsync(() => services.search.searchAll(debounced), [debounced], { enabled: debounced.length >= 2 });

  const total = results.status === 'success' ? results.data.books.length + results.data.donations.length + results.data.posts.length + results.data.videos.length : 0;

  return (
    <Container className="pb-16">
      <PageHeader title="Search" description="Find books, donations, discussions and videos." />
      <SearchField label="Search Kesh Squad" placeholder="Try “pharmacology”, “Chaurasia” or “viva”" value={q} onValueChange={setQ} autoFocus className="max-w-2xl" />

      <div className="mt-8" aria-live="polite">
        {debounced.length < 2 ? (
          <p className="text-mist">Type at least two letters to search.</p>
        ) : results.status === 'loading' ? (
          <ListSkeleton rows={4} />
        ) : results.status === 'error' ? (
          <ErrorState error={results.error} onRetry={results.retry} />
        ) : total === 0 ? (
          <EmptyState icon="search" title={`Nothing found for “${debounced}”`} description="Check the spelling, or try a book title, author or subject." />
        ) : (
          <div className="space-y-12">
            <p className="text-sm text-muted">
              {total} {total === 1 ? 'result' : 'results'} for “{debounced}”
            </p>
            {results.data.books.length > 0 && (
              <Group title="Books for sale" count={results.data.books.length} more={{ to: `${paths.books}?q=${encodeURIComponent(debounced)}`, label: 'See all in Books' }}>
                <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
                  {results.data.books.slice(0, 8).map((b) => (
                    <BookCard key={b.id} book={b} />
                  ))}
                </div>
              </Group>
            )}
            {results.data.donations.length > 0 && (
              <Group title="Donated books" count={results.data.donations.length} more={{ to: `${paths.donate}?q=${encodeURIComponent(debounced)}`, label: 'See all donations' }}>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.data.donations.slice(0, 4).map((d) => (
                    <DonationCard key={d.id} donation={d} />
                  ))}
                </div>
              </Group>
            )}
            {results.data.posts.length > 0 && (
              <Group title="Discussions" count={results.data.posts.length} more={{ to: `${paths.community}?q=${encodeURIComponent(debounced)}`, label: 'See all discussions' }}>
                <ul>
                  {results.data.posts.slice(0, 5).map((p) => (
                    <PostRow key={p.id} post={p} />
                  ))}
                </ul>
              </Group>
            )}
            {results.data.videos.length > 0 && (
              <Group title="Videos" count={results.data.videos.length}>
                <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
                  {results.data.videos.slice(0, 8).map((v) => (
                    <VideoCard key={v.id} video={v} />
                  ))}
                </div>
              </Group>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}

function Group({ title, count, more, children }: { title: string; count: number; more?: { to: string; label: string }; children: ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl text-white">
          {title} <span className="text-base text-muted">({count})</span>
        </h2>
        {more && (
          <Link to={more.to} className="text-sm text-gold hover:text-champagne hover:underline">
            {more.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
