import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, ButtonLink, Card, EmptyState, Icon, SearchField, Segmented } from '@/components/ui';
import { Loadable } from '@/components/shared/Loadable';
import { ListSkeleton } from '@/components/shared/Skeletons';
import { PostRow } from '@/features/community/PostRow';
import { useAsync } from '@/hooks/useAsync';
import { useDebounced } from '@/hooks/useDebounced';
import { useQueryParams } from '@/hooks/useQueryParams';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import { POST_CATEGORIES, type PostCategory, type PostSort } from '@/types/domain';
import { SORT_LABEL } from '@/types/labels';

const PAGE = 8;

/** Reddit-style discussions (C2 §2). Anyone can read; members post, comment and upvote. */
export default function CommunityPage() {
  const { get, set } = useQueryParams();
  const sort = (get('sort') || 'popular') as PostSort;
  const category = get('category') as PostCategory | '';
  const [q, setQ] = useState(get('q'));
  const debouncedQ = useDebounced(q);
  useEffect(() => set({ q: debouncedQ }), [debouncedQ, set]);
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [sort, category, debouncedQ]);

  const posts = useAsync(() => services.community.listPosts({ sort, category: category || undefined, q: debouncedQ, limit }), [sort, category, debouncedQ, limit]);
  const firstLoad = posts.status === 'loading' && limit === PAGE;

  return (
    <Container className="pb-16">
      <PageHeader
        title="Community"
        description="Talk about videos, college life, experiences and anything else. You post under a display name — personal details stay private."
        actions={<ButtonLink to={paths.newPost} leadingIcon="add">Start a discussion</ButtonLink>}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0">
          <div className="flex flex-col gap-4">
            <Segmented
              label="Sort discussions"
              value={sort}
              onChange={(v) => set({ sort: v === 'popular' ? '' : v })}
              options={(['popular', 'recent', 'trending'] as PostSort[]).map((s) => ({ value: s, label: SORT_LABEL[s], icon: s === 'popular' ? 'upvote' : s === 'recent' ? 'activity' : 'sparkle' }))}
            />
            <Segmented
              label="Category"
              size="sm"
              value={category || 'all'}
              onChange={(v) => set({ category: v === 'all' ? '' : v })}
              options={[{ value: 'all', label: 'All topics' }, ...POST_CATEGORIES.map((c) => ({ value: c, label: c }))]}
            />
            <SearchField label="Search discussions" placeholder="Search discussions" value={q} onValueChange={setQ} />
          </div>

          <div className="mt-4">
            {firstLoad ? (
              <ListSkeleton rows={5} />
            ) : (
              <Loadable
                query={posts}
                skeleton={<ListSkeleton rows={5} />}
                isEmpty={(d) => d.items.length === 0}
                empty={
                  <EmptyState
                    icon="community"
                    title={debouncedQ || category ? 'No discussions match' : 'No discussions yet'}
                    description={debouncedQ || category ? 'Try another topic or search.' : 'Start the first conversation.'}
                    action={<ButtonLink to={paths.newPost} size="sm">Start a discussion</ButtonLink>}
                    className="mt-4"
                  />
                }
              >
                {({ items, total }) => (
                  <>
                    <ul>
                      {items.map((p) => (
                        <PostRow key={p.id} post={p} />
                      ))}
                    </ul>
                    {items.length < total && (
                      <div className="mt-6 text-center">
                        <Button variant="secondary" onClick={() => setLimit((n) => n + PAGE)}>
                          Load more ({total - items.length} left)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </Loadable>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card tone="gold">
            <Icon name="ama" size="lg" className="text-gold" />
            <h2 className="mt-3 font-display text-2xl text-white">Ask me anything</h2>
            <p className="mt-1 text-sm text-mist">Questions for the creator. Picked ones get answered in videos, Shorts or posts.</p>
            <ButtonLink to={paths.ama} size="sm" className="mt-4">
              Ask a question
            </ButtonLink>
          </Card>
          <Card>
            <h2 className="font-medium text-white">Squad guidelines</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-mist">
              <li>Be kind. Disagree with ideas, not people.</li>
              <li>No spam or self-promotion.</li>
              <li>Keep phone numbers and addresses out of public posts.</li>
            </ul>
            <Link to={paths.guidelines} className="mt-3 inline-block text-sm text-gold hover:text-champagne hover:underline">
              Read the guidelines
            </Link>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
