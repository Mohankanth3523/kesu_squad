import { Link } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink, Card, Icon, type IconName } from '@/components/ui';
import { ListSkeleton } from '@/components/shared/Skeletons';
import { RequestStatusBadge } from '@/features/books/StatusBadge';
import { useAsync } from '@/hooks/useAsync';
import { formatINR, relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import { services } from '@/services';

export default function DashboardOverviewPage() {
  const { user } = useSession();
  const data = useAsync(async () => {
    const [listings, donations, incoming, mine, conversations, profile] = await Promise.all([
      services.books.listMine(),
      services.donations.listMine(),
      services.donations.listIncomingRequests(),
      services.donations.listMyRequests(),
      services.messaging.listConversations(),
      services.honour.getMemberProfile(user?.displayName ?? ''),
    ]);
    return { listings, donations, incoming, mine, conversations, profile };
  }, [user?.id]);

  return (
    <div>
      <PageHeader
        compact
        title={`Hello, ${user?.displayName ?? 'amigo'}`}
        description="Everything you’re selling, donating and talking about."
        actions={
          <>
            <ButtonLink to={paths.sell} leadingIcon="add">
              Sell a book
            </ButtonLink>
            <ButtonLink to={paths.newDonation} variant="secondary" leadingIcon="donate">
              Donate a book
            </ButtonLink>
          </>
        }
      />

      {data.status === 'loading' && <ListSkeleton rows={4} />}
      {data.status === 'error' && (
        <Card className="text-mist">
          Your dashboard didn’t load.{' '}
          <button type="button" className="text-gold underline" onClick={data.retry}>
            Try again
          </button>
        </Card>
      )}
      {data.status === 'success' &&
        (() => {
          const { listings, donations, incoming, mine, conversations, profile } = data.data;
          const active = listings.filter((l) => l.status === 'available' || l.status === 'reserved');
          const interested = active.reduce((n, l) => n + l.interestCount, 0);
          const waiting = incoming.filter((r) => r.status === 'pending');
          const toSend = incoming.filter((r) => r.status === 'accepted' && !r.donorConfirmedAt);
          const toConfirm = mine.filter((r) => r.status === 'accepted' && !r.recipientConfirmedAt);
          const unread = conversations.filter((c) => c.unreadCount > 0);

          return (
            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat icon="books" label="Books for sale" value={active.length} to={paths.dashboardListings} />
                <Stat icon="comment" label="Interested buyers" value={interested} to={paths.inbox} />
                <Stat icon="donate" label="Requests waiting" value={waiting.length} to={paths.dashboardDonations} highlight={waiting.length > 0} />
                <Stat icon="honour" label="Books donated" value={profile.booksDonated} to={paths.honourBoard} sub={profile.rank ? `Rank ${profile.rank}` : undefined} />
              </div>

              <section aria-labelledby="todo">
                <h2 id="todo" className="font-display text-2xl text-white">
                  Needs your attention
                </h2>
                {waiting.length + toSend.length + toConfirm.length + unread.length === 0 ? (
                  <p className="mt-3 text-mist">You’re all caught up.</p>
                ) : (
                  <ul className="mt-4 divide-y divide-line rounded-[var(--radius-surface)] border border-line">
                    {unread.map((c) => (
                      <Todo key={c.id} icon="inbox" to={paths.conversation(c.id)} title={`${c.unreadCount} unread from ${c.counterpart.displayName}`} sub={c.listing.title} />
                    ))}
                    {waiting.map((r) => (
                      <Todo key={r.id} icon="donate" to={paths.dashboardDonations} title={`${r.requester.displayName} requested “${r.listingTitle}”`} sub={relativeTime(r.createdAt)} />
                    ))}
                    {toSend.map((r) => (
                      <Todo key={r.id} icon="courier" to={paths.dashboardDonations} title={`Send “${r.listingTitle}” to ${r.requester.displayName}`} sub="Mark it as sent once it’s with the courier." />
                    ))}
                    {toConfirm.map((r) => (
                      <Todo key={r.id} icon="success" to={paths.dashboardActivity} title={`Has “${r.listingTitle}” arrived?`} sub={`Confirm it so ${r.donor.displayName}’s donation counts.`} />
                    ))}
                  </ul>
                )}
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <div className="flex items-baseline justify-between">
                    <h2 className="font-medium text-white">Your listings</h2>
                    <Link to={paths.dashboardListings} className="text-sm text-gold hover:underline">
                      Manage
                    </Link>
                  </div>
                  {listings.length === 0 ? (
                    <p className="mt-3 text-sm text-mist">No books listed yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-2.5 text-sm">
                      {listings.slice(0, 4).map((l) => (
                        <li key={l.id} className="flex justify-between gap-3">
                          <Link to={paths.book(l.id)} className="truncate text-white hover:text-champagne">
                            {l.title}
                          </Link>
                          <span className="shrink-0 text-muted tabular-nums">
                            {formatINR(l.askingPrice)} · {l.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
                <Card>
                  <div className="flex items-baseline justify-between">
                    <h2 className="font-medium text-white">Your donations</h2>
                    <Link to={paths.dashboardDonations} className="text-sm text-gold hover:underline">
                      Manage
                    </Link>
                  </div>
                  {donations.length === 0 ? (
                    <p className="mt-3 text-sm text-mist">No donations listed yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-2.5 text-sm">
                      {donations.slice(0, 4).map((d) => (
                        <li key={d.id} className="flex justify-between gap-3">
                          <Link to={paths.donation(d.id)} className="truncate text-white hover:text-champagne">
                            {d.title}
                          </Link>
                          <span className="shrink-0 text-muted">{d.requestCount} requests</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>

              {mine.length > 0 && (
                <section aria-labelledby="requested">
                  <h2 id="requested" className="font-medium text-white">
                    Books you requested
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {mine.slice(0, 3).map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-mist">{r.listingTitle}</span>
                        <RequestStatusBadge status={r.status} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          );
        })()}
    </div>
  );
}

function Stat({ icon, label, value, to, sub, highlight }: { icon: IconName; label: string; value: number; to: string; sub?: string; highlight?: boolean }) {
  return (
    <Link to={to} className={`rounded-[var(--radius-surface)] border p-5 transition-colors hover:border-gold/40 ${highlight ? 'border-gold/50 bg-gold/8' : 'border-line bg-charcoal'}`}>
      <p className="flex items-center gap-2 text-sm text-mist">
        <Icon name={icon} size="sm" className="text-gold" />
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-white tabular-nums">{value}</p>
      {sub && <p className="text-xs text-champagne">{sub}</p>}
    </Link>
  );
}

function Todo({ icon, to, title, sub }: { icon: IconName; to: string; title: string; sub: string }) {
  return (
    <li>
      <Link to={to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03]">
        <Icon name={icon} className="text-gold" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-white">{title}</p>
          <p className="truncate text-xs text-muted">{sub}</p>
        </div>
        <Icon name="next" size="sm" className="text-muted" />
      </Link>
    </li>
  );
}
