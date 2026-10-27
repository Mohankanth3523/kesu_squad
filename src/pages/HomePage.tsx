import { Link } from 'react-router';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ButtonLink, Card, EmptyState, ErrorState, Icon, LoadingRegion, Skeleton } from '@/components/ui';
import { Loadable as SharedLoadable } from '@/components/shared/Loadable';
import { GridSkeleton, ListSkeleton } from '@/components/shared/Skeletons';
import { BookCard } from '@/features/books/BookCard';
import { PostRow } from '@/features/community/PostRow';
import { VideoCard } from '@/features/content/VideoCard';
import { DonationCard } from '@/features/donations/DonationCard';
import { TopDonors } from '@/features/donations/TopDonors';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { paths } from '@/lib/routes';
import { services } from '@/services';

/**
 * Home (C1 §8): each section loads on its own, so one failure never blanks the page.
 * Try `?mockError=books.listRecent` or `?mockEmpty=all` to see the other states.
 */
export default function HomePage() {
  useDocumentTitle('Home');
  const latest = useAsync(() => services.content.listVideos({ limit: 11 }));
  const trending = useAsync(() => services.community.listPosts({ sort: 'trending', limit: 5 }));
  const books = useAsync(() => services.books.listRecent({ limit: 4 }));
  const donations = useAsync(() => services.donations.listAvailable({ limit: 3 }));
  const donors = useAsync(() => services.honour.listStandings({ limit: 3 }));

  const longForm = latest.data?.filter((v) => v.platform === 'youtube_video') ?? [];
  const featured = longForm[0];
  const vertical = latest.data?.filter((v) => v.platform !== 'youtube_video').slice(0, 6) ?? [];

  return (
    <>
      {/* Welcome banner */}
      <div className="border-b border-line">
        <Container size="wide" className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-20">
          <div>
            <h1 className="font-display text-[clamp(2.75rem,7vw,4.75rem)] leading-[1.02] text-white">Welcome, Amigos!</h1>
            <p className="mt-4 font-display text-2xl text-gold italic">Watch. Talk. Connect.</p>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-mist">
              Videos from the creator, conversations with the squad, and second-hand MBBS and BDS books — in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to={paths.community} size="lg">
                Explore the community
              </ButtonLink>
              <ButtonLink to={paths.books} size="lg" variant="secondary" leadingIcon="books">
                Browse books
              </ButtonLink>
            </div>
          </div>

          <div>
            {latest.status === 'loading' && (
              <LoadingRegion label="Loading latest video">
                <Skeleton className="aspect-video w-full rounded-[var(--radius-surface)]" />
                <Skeleton className="mt-3 h-6 w-3/4" />
              </LoadingRegion>
            )}
            {latest.status === 'error' && <ErrorState error={latest.error} onRetry={latest.retry} compact />}
            {latest.status === 'success' &&
              (featured ? (
                <VideoCard video={featured} size="lg" />
              ) : (
                <EmptyState icon="videos" title="New videos coming soon" description="The latest video will appear here." compact />
              ))}
          </div>
        </Container>
      </div>

      <Container size="wide">
        {/* Latest videos and reels */}
        <Section id="latest" title="Latest videos and reels" link={{ to: paths.videos, label: 'All videos' }}>
          <SharedLoadable
            query={latest}
            skeleton={<GridSkeleton count={3} aspect="aspect-video" cols="sm:grid-cols-2 lg:grid-cols-3" />}
            isEmpty={(d) => d.length === 0}
            empty={<EmptyState icon="videos" title="No videos yet" description="Fresh YouTube videos, Shorts and Reels will show up here." />}
          >
            {() => (
              <div className="space-y-10">
                {longForm.length > 1 && (
                  <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                    {longForm.slice(1, 4).map((v, i) => (
                      <div key={v.id} className={i === 2 ? 'hidden lg:block' : undefined}>
                        <VideoCard video={v} />
                      </div>
                    ))}
                  </div>
                )}
                {vertical.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-sm font-medium text-mist">Shorts and Reels</h3>
                    <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
                      {vertical.map((v) => (
                        <div key={v.id} className="w-36 shrink-0 snap-start sm:w-auto">
                          <VideoCard video={v} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </SharedLoadable>
        </Section>

        {/* Trending discussions + Ask Me Anything */}
        <div className="grid gap-x-12 border-t border-line lg:grid-cols-[1.6fr_1fr]">
          <Section id="trending" title="Trending in the community" link={{ to: paths.community, label: 'All discussions' }}>
            <SharedLoadable
              query={trending}
              skeleton={<ListSkeleton />}
              isEmpty={(d) => d.items.length === 0}
              empty={
                <EmptyState
                  icon="community"
                  title="No discussions yet"
                  description="Start the first conversation."
                  action={<ButtonLink to={paths.newPost} size="sm">Start a discussion</ButtonLink>}
                />
              }
            >
              {({ items }) => (
                <ul>
                  {items.map((p) => (
                    <PostRow key={p.id} post={p} />
                  ))}
                </ul>
              )}
            </SharedLoadable>
          </Section>

          <div className="flex flex-col gap-6 pb-10 lg:py-14">
            <Card tone="gold" className="relative overflow-hidden">
              <Icon name="ama" size="xl" className="text-gold" />
              <h2 className="mt-4 font-display text-[1.75rem] leading-tight text-white">Ask me anything</h2>
              <p className="mt-2 text-mist">Send a question to the creator. Picked questions get answered in future videos, Shorts or posts.</p>
              <ButtonLink to={paths.ama} className="mt-6">
                Ask a question
              </ButtonLink>
            </Card>

            <Card>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl text-white">Top donors</h2>
                <Link to={paths.honourBoard} className="text-sm text-gold hover:text-champagne hover:underline">
                  Honour Board
                </Link>
              </div>
              <p className="mt-1 text-sm text-muted">Recognising those who give knowledge a second life.</p>
              <div className="mt-3">
                <SharedLoadable
                  query={donors}
                  skeleton={<ListSkeleton rows={3} compact />}
                  isEmpty={(d) => d.length === 0}
                  empty={<p className="py-4 text-sm text-mist">No completed donations yet. The first donor’s name goes here.</p>}
                  compactError
                >
                  {(standings) => <TopDonors standings={standings} />}
                </SharedLoadable>
              </div>
            </Card>
          </div>
        </div>

        {/* Recently listed books */}
        <Section
          id="books"
          title="Recently listed books"
          description="Second-hand MBBS and BDS textbooks, priced within Kesh Squad’s fair-price limits."
          link={{ to: paths.books, label: 'All books' }}
          className="border-t border-line"
        >
          <SharedLoadable
            query={books}
            skeleton={<GridSkeleton count={4} aspect="aspect-[3/4]" cols="grid-cols-2 md:grid-cols-4" />}
            isEmpty={(d) => d.length === 0}
            empty={
              <EmptyState
                icon="books"
                title="No books listed yet"
                description="Have textbooks you no longer need? List them for a junior."
                action={<ButtonLink to={paths.sell} size="sm">Sell a book</ButtonLink>}
              />
            }
          >
            {(list) => (
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
                {list.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>
            )}
          </SharedLoadable>
        </Section>

        {/* Donated books */}
        <Section
          id="donations"
          title="Free books from the squad"
          description="Donated books are free. You pay only the courier charge you agree with the donor."
          link={{ to: paths.donate, label: 'All donations' }}
          className="border-t border-line"
        >
          <SharedLoadable
            query={donations}
            skeleton={<GridSkeleton count={3} aspect="aspect-[5/2]" cols="md:grid-cols-3" />}
            isEmpty={(d) => d.length === 0}
            empty={
              <EmptyState
                icon="donate"
                title="No donated books right now"
                description="Check back soon, or donate one yourself."
                action={<ButtonLink to={paths.newDonation} size="sm">Donate a book</ButtonLink>}
              />
            }
          >
            {(list) => (
              <div className="grid gap-4 md:grid-cols-3">
                {list.map((d) => (
                  <DonationCard key={d.id} donation={d} />
                ))}
              </div>
            )}
          </SharedLoadable>
        </Section>
      </Container>

      {/* Closing call to action */}
      <div className="border-t border-line">
        <Container className="flex flex-col items-center py-16 text-center sm:py-20">
          <p className="max-w-xl font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-white">
            There’s a seat for you in the squad.
          </p>
          <p className="mt-3 max-w-md text-mist">Share an experience, ask a random question, or just read along.</p>
          <ButtonLink to={paths.community} size="lg" className="mt-8">
            Explore the full community
          </ButtonLink>
        </Container>
      </div>
    </>
  );
}
