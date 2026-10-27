import { useEffect, useState } from 'react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, ButtonLink, Card, Checkbox, EmptyState, Field, Icon, SearchField, Segmented, Select } from '@/components/ui';
import { FilterGroup, FilterPanel } from '@/components/shared/FilterPanel';
import { Loadable } from '@/components/shared/Loadable';
import { GridSkeleton } from '@/components/shared/Skeletons';
import { ALL_SUBJECTS, COURSES, SUBJECTS } from '@/domain/constants';
import { DonationCard } from '@/features/donations/DonationCard';
import { useAsync } from '@/hooks/useAsync';
import { useDebounced } from '@/hooks/useDebounced';
import { useQueryParams } from '@/hooks/useQueryParams';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { BookCondition, Course } from '@/types/domain';
import { CONDITION_LABEL } from '@/types/labels';

const CONDITIONS: BookCondition[] = ['like_new', 'good', 'fair', 'heavily_used'];

/** Free book donations (C1 §4). Visitors can browse without logging in. */
export default function DonatePage() {
  const { get, getAll, set } = useQueryParams();
  const [q, setQ] = useState(get('q'));
  const debouncedQ = useDebounced(q);
  useEffect(() => set({ q: debouncedQ }), [debouncedQ, set]);

  const course = get('course') as Course | '';
  const subject = get('subject');
  const conditions = getAll('condition') as BookCondition[];
  const covered = get('covered') === '1';
  const sort = (get('sort') || 'newest') as 'newest' | 'oldest';

  const results = useAsync(
    () => services.donations.search({ q: debouncedQ, course: course || undefined, subject: subject || undefined, conditions, donorCoversShipping: covered, sort }),
    [debouncedQ, course, subject, conditions.join(','), covered, sort],
  );
  const activeCount = [course, subject, conditions.length ? 'c' : '', covered ? 'y' : ''].filter(Boolean).length;
  const clear = () => set({ course: '', subject: '', condition: '', covered: '' });

  return (
    <Container size="wide">
      <PageHeader
        title="Free books from the squad"
        description="Students giving their textbooks a second life. The book is free — you pay only the courier charge you agree with the donor."
        actions={<ButtonLink to={paths.newDonation} leadingIcon="donate">Donate a book</ButtonLink>}
      />

      <Card tone="gold" className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: 'search' as const, title: 'Find a book', body: 'Browse freely. No account needed to look.' },
          { icon: 'comment' as const, title: 'Request it', body: 'Send the donor a short note and chat privately.' },
          { icon: 'courier' as const, title: 'Pay only the courier', body: 'Agree the courier charge together. Donors may cover it.' },
        ].map((s) => (
          <div key={s.title} className="flex gap-3">
            <Icon name={s.icon} className="mt-0.5 text-gold" />
            <div>
              <p className="font-medium text-white">{s.title}</p>
              <p className="text-sm text-mist">{s.body}</p>
            </div>
          </div>
        ))}
      </Card>

      <div className="grid gap-8 pb-12 lg:grid-cols-[15rem_1fr]">
        <FilterPanel activeCount={activeCount} onClear={clear}>
          <FilterGroup title="Course">
            <Segmented
              label="Course"
              size="sm"
              value={course || 'all'}
              onChange={(v) => set({ course: v === 'all' ? '' : v, subject: '' })}
              options={[{ value: 'all', label: 'All' }, ...COURSES.map((c) => ({ value: c, label: c }))]}
            />
          </FilterGroup>
          <Field label="Subject">
            {(p) => (
              <Select {...p} value={subject} onChange={(e) => set({ subject: e.target.value })}>
                <option value="">All subjects</option>
                {(course ? SUBJECTS[course] : ALL_SUBJECTS).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            )}
          </Field>
          <FilterGroup title="Condition">
            {CONDITIONS.map((c) => (
              <Checkbox
                key={c}
                label={CONDITION_LABEL[c]}
                checked={conditions.includes(c)}
                onChange={(e) => set({ condition: e.target.checked ? [...conditions, c] : conditions.filter((x) => x !== c) })}
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Courier">
            <Checkbox label="Donor covers the courier" checked={covered} onChange={(e) => set({ covered: e.target.checked ? '1' : '' })} />
          </FilterGroup>
        </FilterPanel>

        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <SearchField label="Search donations" placeholder="Search by book, author or subject" value={q} onValueChange={setQ} className="flex-1" />
            <Field label="Sort" hideLabel className="sm:w-44">
              {(p) => (
                <Select {...p} value={sort} onChange={(e) => set({ sort: e.target.value === 'newest' ? '' : e.target.value })}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </Select>
              )}
            </Field>
          </div>
          <Loadable
            query={results}
            skeleton={<GridSkeleton count={6} aspect="aspect-[5/2]" cols="md:grid-cols-2" />}
            isEmpty={(d) => d.length === 0}
            empty={
              <EmptyState
                icon="donate"
                title={debouncedQ || activeCount ? 'No donations match' : 'No donated books right now'}
                description={debouncedQ || activeCount ? 'Try fewer filters or a different search.' : 'Check back soon, or donate one yourself.'}
                action={
                  debouncedQ || activeCount ? (
                    <Button size="sm" variant="secondary" onClick={() => { setQ(''); clear(); }}>
                      Clear search and filters
                    </Button>
                  ) : (
                    <ButtonLink to={paths.newDonation} size="sm">Donate a book</ButtonLink>
                  )
                }
              />
            }
          >
            {(list) => (
              <>
                <p className="mb-4 text-sm text-muted" aria-live="polite">
                  {list.length} {list.length === 1 ? 'donation' : 'donations'}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {list.map((d) => (
                    <DonationCard key={d.id} donation={d} />
                  ))}
                </div>
              </>
            )}
          </Loadable>
        </div>
      </div>
    </Container>
  );
}
