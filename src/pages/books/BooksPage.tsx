import { useEffect, useState } from 'react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, ButtonLink, Checkbox, EmptyState, Field, Input, SearchField, Segmented, Select } from '@/components/ui';
import { FilterGroup, FilterPanel } from '@/components/shared/FilterPanel';
import { Loadable } from '@/components/shared/Loadable';
import { GridSkeleton } from '@/components/shared/Skeletons';
import { ALL_SUBJECTS, COURSES, SUBJECTS } from '@/domain/constants';
import { BookCard } from '@/features/books/BookCard';
import { useAsync } from '@/hooks/useAsync';
import { useDebounced } from '@/hooks/useDebounced';
import { useQueryParams } from '@/hooks/useQueryParams';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { BookSort, EditionFilter } from '@/services/interfaces';
import type { BookCondition, Course } from '@/types/domain';
import { CONDITION_LABEL } from '@/types/labels';

const CONDITIONS: BookCondition[] = ['like_new', 'good', 'fair', 'heavily_used'];
const SORTS: Array<{ value: BookSort; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

/** Second-hand marketplace (C1 §3): browse without logging in; search by name, author, subject, edition or course. */
export default function BooksPage() {
  const { get, getAll, set } = useQueryParams();
  const [q, setQ] = useState(get('q'));
  const debouncedQ = useDebounced(q);
  useEffect(() => set({ q: debouncedQ }), [debouncedQ, set]);

  const course = get('course') as Course | '';
  const subject = get('subject');
  const conditions = getAll('condition') as BookCondition[];
  const edition = (get('edition') || 'any') as EditionFilter;
  const minPrice = get('min');
  const maxPrice = get('max');
  const sort = (get('sort') || 'newest') as BookSort;

  const results = useAsync(
    () =>
      services.books.search({
        q: debouncedQ,
        course: course || undefined,
        subject: subject || undefined,
        conditions,
        edition,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort,
      }),
    [debouncedQ, course, subject, conditions.join(','), edition, minPrice, maxPrice, sort],
  );

  const activeCount = [course, subject, conditions.length ? 'c' : '', edition !== 'any' ? 'e' : '', minPrice, maxPrice].filter(Boolean).length;
  const clearFilters = () => set({ course: '', subject: '', condition: '', edition: '', min: '', max: '' });
  const subjects = course ? SUBJECTS[course] : ALL_SUBJECTS;

  const filters = (
    <>
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
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        )}
      </Field>
      <FilterGroup title="Edition">
        <Segmented
          label="Edition"
          size="sm"
          value={edition}
          onChange={(v) => set({ edition: v === 'any' ? '' : v })}
          options={[
            { value: 'any', label: 'Any' },
            { value: 'current', label: 'Current' },
            { value: 'older', label: 'Older' },
          ]}
        />
      </FilterGroup>
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
      <FilterGroup title="Price">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min price" hideLabel>
            {(p) => <Input {...p} prefix="₹" inputMode="numeric" placeholder="Min" value={minPrice} onChange={(e) => set({ min: e.target.value.replace(/\D/g, '') })} />}
          </Field>
          <Field label="Max price" hideLabel>
            {(p) => <Input {...p} prefix="₹" inputMode="numeric" placeholder="Max" value={maxPrice} onChange={(e) => set({ max: e.target.value.replace(/\D/g, '') })} />}
          </Field>
        </div>
      </FilterGroup>
    </>
  );

  return (
    <Container size="wide">
      <PageHeader
        title="Second-hand books"
        description="Used MBBS and BDS textbooks from other students, priced within fair limits. Browse freely — no account needed."
        actions={
          <>
            <ButtonLink to={paths.rules} variant="ghost" leadingIcon="info">
              How pricing works
            </ButtonLink>
            <ButtonLink to={paths.sell} leadingIcon="add">
              Sell a book
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-8 pb-12 lg:grid-cols-[15rem_1fr]">
        <FilterPanel activeCount={activeCount} onClear={clearFilters}>
          {filters}
        </FilterPanel>

        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchField
              label="Search books"
              placeholder="Search by book, author, subject or course"
              value={q}
              onValueChange={setQ}
              className="flex-1"
            />
            <Field label="Sort" hideLabel className="sm:w-52">
              {(p) => (
                <Select {...p} value={sort} onChange={(e) => set({ sort: e.target.value === 'newest' ? '' : e.target.value })}>
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <Loadable
            query={results}
            skeleton={<GridSkeleton count={8} cols="grid-cols-2 md:grid-cols-3 xl:grid-cols-4" />}
            isEmpty={(d) => d.length === 0}
            empty={
              <EmptyState
                icon="books"
                title={debouncedQ || activeCount ? 'No books match' : 'No books listed yet'}
                description={debouncedQ || activeCount ? 'Try fewer filters or a different search.' : 'Have textbooks you no longer need? List them for a junior.'}
                action={
                  debouncedQ || activeCount ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setQ('');
                        clearFilters();
                      }}
                    >
                      Clear search and filters
                    </Button>
                  ) : (
                    <ButtonLink to={paths.sell} size="sm">
                      Sell a book
                    </ButtonLink>
                  )
                }
              />
            }
          >
            {(books) => (
              <>
                <p className="mb-4 text-sm text-muted" aria-live="polite">
                  {books.length} {books.length === 1 ? 'book' : 'books'}
                </p>
                <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 xl:grid-cols-4">
                  {books.map((b) => (
                    <BookCard key={b.id} book={b} />
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
