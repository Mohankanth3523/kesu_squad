import { useParams } from 'react-router';
import { Container } from '@/components/layout/Container';
import { Avatar, Badge, ButtonLink, Card, EmptyState } from '@/components/ui';
import { Loadable } from '@/components/shared/Loadable';
import { DetailSkeleton } from '@/components/shared/Skeletons';
import { BookCard } from '@/features/books/BookCard';
import { DonationCard } from '@/features/donations/DonationCard';
import { BadgeRow } from '@/features/donations/Badges';
import { PostRow } from '@/features/community/PostRow';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { paths } from '@/lib/routes';
import { services } from '@/services';

/** Public profile: display name, badges and donation stats only — no personal details (C1 §5, §6). */
export default function ProfilePage() {
  const { displayName = '' } = useParams();
  useDocumentTitle(displayName);
  const profile = useAsync(() => services.honour.getMemberProfile(displayName), [displayName]);
  const posts = useAsync(
    () => (profile.status === 'success' ? services.community.listPosts({ authorId: profile.data.profile.id, sort: 'recent', limit: 5 }) : Promise.resolve({ items: [], total: 0 })),
    [profile.status === 'success' ? profile.data.profile.id : ''],
  );

  return (
    <Container className="pb-16">
      <Loadable query={profile} skeleton={<DetailSkeleton />} notFound={{ title: 'Member not found', description: 'There’s no member with that display name.', backTo: paths.community, backLabel: 'Community' }}>
        {(m) => {
          const sale = m.activeListings.filter((l) => l.type === 'sale');
          const donations = m.activeListings.filter((l) => l.type === 'donation');
          return (
            <>
              <header className="flex flex-col gap-6 pt-10 pb-8 sm:flex-row sm:items-center">
                <Avatar name={m.profile.displayName} size="lg" className="size-20 text-3xl" />
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-display-sm text-white">{m.profile.displayName}</h1>
                  <p className="mt-1 text-mist">
                    {m.profile.course ? `${m.profile.course} · ` : ''}Member since {new Date(m.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                  <BadgeRow badges={m.badges} className="mt-3" />
                </div>
                <Card tone="gold" className="text-center sm:w-48">
                  <p className="text-4xl font-semibold text-champagne tabular-nums">{m.booksDonated}</p>
                  <p className="text-sm text-mist">books donated</p>
                  {m.rank && <Badge tone="gold" className="mt-2">Honour Board rank {m.rank}</Badge>}
                </Card>
              </header>

              {sale.length > 0 && (
                <section className="border-t border-line py-8">
                  <h2 className="font-display text-2xl text-white">Books for sale</h2>
                  <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
                    {sale.map((l) => (l.type === 'sale' ? <BookCard key={l.id} book={l} /> : null))}
                  </div>
                </section>
              )}
              {donations.length > 0 && (
                <section className="border-t border-line py-8">
                  <h2 className="font-display text-2xl text-white">Giving away</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {donations.map((l) => (l.type === 'donation' ? <DonationCard key={l.id} donation={l} /> : null))}
                  </div>
                </section>
              )}
              <section className="border-t border-line py-8">
                <h2 className="font-display text-2xl text-white">Recent discussions</h2>
                {posts.status === 'success' && posts.data.items.length > 0 ? (
                  <ul className="mt-2">
                    {posts.data.items.map((p) => (
                      <PostRow key={p.id} post={p} />
                    ))}
                  </ul>
                ) : posts.status === 'success' ? (
                  <EmptyState compact icon="community" title="No discussions yet" className="mt-4" action={<ButtonLink to={paths.community} size="sm" variant="secondary">Visit the community</ButtonLink>} />
                ) : null}
              </section>
            </>
          );
        }}
      </Loadable>
    </Container>
  );
}
