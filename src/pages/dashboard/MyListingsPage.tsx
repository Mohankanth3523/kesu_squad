import { useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, ButtonLink, ConfirmDialog, EmptyState, Icon, Segmented, useToast } from '@/components/ui';
import { Loadable } from '@/components/shared/Loadable';
import { ListSkeleton } from '@/components/shared/Skeletons';
import { BookCover } from '@/features/books/BookCover';
import { ListingStatusBadge } from '@/features/books/StatusBadge';
import { useAction } from '@/hooks/useAction';
import { useAsync } from '@/hooks/useAsync';
import { formatINR, relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { SaleListing } from '@/types/domain';

type Tab = 'active' | 'sold' | 'withdrawn';
type NextStatus = 'available' | 'reserved' | 'sold' | 'withdrawn';

const CONFIRM: Partial<Record<NextStatus, { title: string; body: string; label: string; tone: 'primary' | 'danger' }>> = {
  sold: { title: 'Mark as sold?', body: 'The listing leaves the marketplace and other interested buyers see that it’s sold. This can’t be undone.', label: 'Mark as sold', tone: 'primary' },
  withdrawn: { title: 'Withdraw this listing?', body: 'It leaves the marketplace. You can relist it later.', label: 'Withdraw', tone: 'danger' },
};

/** Seller dashboard: update availability (C1 §6), edit and withdraw listings. */
export default function MyListingsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('active');
  const [confirm, setConfirm] = useState<{ listing: SaleListing; status: NextStatus } | null>(null);
  const listings = useAsync(() => services.books.listMine());
  const setStatus = useAction((id: string, status: NextStatus) => services.books.setStatus(id, status), {
    errorTitle: 'Status not changed',
    onSuccess: (l) => {
      setConfirm(null);
      toast.success(`Marked as ${l.status}`, l.status === 'sold' ? 'Interested buyers can see it’s sold.' : undefined);
    },
  });

  const all = listings.status === 'success' ? listings.data : [];
  const counts = {
    active: all.filter((l) => l.status === 'available' || l.status === 'reserved').length,
    sold: all.filter((l) => l.status === 'sold').length,
    withdrawn: all.filter((l) => l.status === 'withdrawn').length,
  };
  const change = (listing: SaleListing, status: NextStatus) => (CONFIRM[status] ? setConfirm({ listing, status }) : void setStatus.run(listing.id, status));

  return (
    <div>
      <PageHeader compact title="My listings" description="Books you’re selling. Keep availability up to date so buyers know what’s still free." actions={<ButtonLink to={paths.sell} leadingIcon="add">Sell a book</ButtonLink>} />
      <Segmented
        label="Listing status"
        value={tab}
        onChange={setTab}
        className="mb-6"
        options={[
          { value: 'active', label: 'Active', count: counts.active },
          { value: 'sold', label: 'Sold', count: counts.sold },
          { value: 'withdrawn', label: 'Withdrawn', count: counts.withdrawn },
        ]}
      />
      <Loadable
        query={listings}
        skeleton={<ListSkeleton rows={3} />}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState icon="books" title="You haven’t listed any books" description="Sell textbooks you no longer need to a junior." action={<ButtonLink to={paths.sell} size="sm">Sell a book</ButtonLink>} />}
      >
        {(list) => {
          const shown = list.filter((l) => (tab === 'active' ? l.status === 'available' || l.status === 'reserved' : l.status === tab));
          if (!shown.length) return <p className="py-8 text-center text-mist">Nothing {tab} right now.</p>;
          return (
            <ul className="space-y-3">
              {shown.map((l) => (
                <li key={l.id} className="flex flex-col gap-4 rounded-[var(--radius-surface)] border border-line bg-charcoal p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <BookCover title={l.title} author={l.author} photo={l.photos[0]} size="sm" className="w-14 shrink-0" />
                    <div className="min-w-0">
                      <Link to={paths.book(l.id)} className="line-clamp-2 font-medium text-white hover:text-champagne">
                        {l.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted">
                        <span className="text-champagne tabular-nums">{formatINR(l.askingPrice)}</span> · updated {relativeTime(l.updatedAt)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <ListingStatusBadge status={l.status} />
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <Icon name="comment" size="xs" />
                          {l.interestCount} interested
                        </span>
                      </div>
                    </div>
                  </div>
                  <fieldset disabled={setStatus.pending} aria-busy={setStatus.pending || undefined} className="flex flex-wrap gap-2 disabled:opacity-60 sm:justify-end">
                    <legend className="sr-only">Actions for {l.title}</legend>
                    {l.status === 'available' && (
                      <Button size="sm" variant="secondary" onClick={() => change(l, 'reserved')}>
                        Mark reserved
                      </Button>
                    )}
                    {l.status === 'reserved' && (
                      <Button size="sm" variant="secondary" onClick={() => change(l, 'available')}>
                        Mark available
                      </Button>
                    )}
                    {(l.status === 'available' || l.status === 'reserved') && (
                      <>
                        <Button size="sm" onClick={() => change(l, 'sold')}>
                          Mark sold
                        </Button>
                        <ButtonLink size="sm" variant="ghost" leadingIcon="edit" to={paths.editListing(l.id)}>
                          Edit
                        </ButtonLink>
                        <Button size="sm" variant="ghost" onClick={() => change(l, 'withdrawn')}>
                          Withdraw
                        </Button>
                      </>
                    )}
                    {l.status === 'withdrawn' && (
                      <Button size="sm" variant="secondary" onClick={() => change(l, 'available')}>
                        Relist
                      </Button>
                    )}
                  </fieldset>
                </li>
              ))}
            </ul>
          );
        }}
      </Loadable>
      {confirm && CONFIRM[confirm.status] && (
        <ConfirmDialog
          open
          onClose={() => setConfirm(null)}
          title={CONFIRM[confirm.status]!.title}
          description={`“${confirm.listing.title}”. ${CONFIRM[confirm.status]!.body}`}
          confirmLabel={CONFIRM[confirm.status]!.label}
          tone={CONFIRM[confirm.status]!.tone}
          pending={setStatus.pending}
          onConfirm={() => void setStatus.run(confirm.listing.id, confirm.status)}
        />
      )}
    </div>
  );
}
