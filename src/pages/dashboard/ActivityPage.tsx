import { useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Button, ButtonLink, ConfirmDialog, EmptyState, useToast } from '@/components/ui';
import { Loadable } from '@/components/shared/Loadable';
import { ListSkeleton } from '@/components/shared/Skeletons';
import { ListingStatusBadge, RequestStatusBadge } from '@/features/books/StatusBadge';
import { useAction } from '@/hooks/useAction';
import { useAsync } from '@/hooks/useAsync';
import { formatINR, relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { DonationRequest } from '@/types/domain';

/** The viewer as buyer and recipient: books they asked about and donations they requested. */
export default function ActivityPage() {
  const data = useAsync(async () => {
    const [conversations, requests] = await Promise.all([services.messaging.listConversations(), services.donations.listMyRequests()]);
    return { buying: conversations.filter((c) => c.kind === 'sale' && c.viewerRole === 'initiator'), requests };
  });

  return (
    <div>
      <PageHeader compact title="My requests" description="Books you’ve asked about and donations you’ve requested." />
      <Loadable query={data} skeleton={<ListSkeleton rows={4} />}>
        {({ buying, requests }) => (
          <div className="space-y-10">
            <section aria-labelledby="donation-requests">
              <h2 id="donation-requests" className="font-display text-2xl text-white">
                Donations you requested
              </h2>
              {requests.length === 0 ? (
                <EmptyState compact icon="donate" title="No requests yet" description="Free books from other students are on the Donate page." action={<ButtonLink to={paths.donate} size="sm">Browse donations</ButtonLink>} className="mt-4" />
              ) : (
                <ul className="mt-4 divide-y divide-line rounded-[var(--radius-surface)] border border-line">
                  {requests.map((r) => (
                    <MyRequestRow key={r.id} r={r} />
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="buying">
              <h2 id="buying" className="font-display text-2xl text-white">
                Books you’re interested in
              </h2>
              {buying.length === 0 ? (
                <EmptyState compact icon="books" title="You haven’t contacted a seller yet" action={<ButtonLink to={paths.books} size="sm">Browse books</ButtonLink>} className="mt-4" />
              ) : (
                <ul className="mt-4 divide-y divide-line rounded-[var(--radius-surface)] border border-line">
                  {buying.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                      <Avatar name={c.counterpart.displayName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <Link to={paths.book(c.listing.id)} className="block truncate text-white hover:text-champagne">
                          {c.listing.title}
                        </Link>
                        <p className="text-xs text-muted">
                          {c.listing.askingPrice !== undefined && formatINR(c.listing.askingPrice)} · seller {c.counterpart.displayName} · {relativeTime(c.lastMessageAt)}
                        </p>
                      </div>
                      <ListingStatusBadge status={c.listing.status} />
                      <ButtonLink size="sm" variant="ghost" leadingIcon="inbox" to={paths.conversation(c.id)}>
                        Chat{c.unreadCount ? ` (${c.unreadCount})` : ''}
                      </ButtonLink>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </Loadable>
    </div>
  );
}

function MyRequestRow({ r }: { r: DonationRequest }) {
  const toast = useToast();
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const withdraw = useAction(services.donations.withdrawRequest, {
    errorTitle: 'Not withdrawn',
    onSuccess: () => {
      setConfirmWithdraw(false);
      toast.success('Request withdrawn');
    },
  });
  const confirm = useAction(services.donations.confirmReceived, {
    errorTitle: 'Not confirmed',
    onSuccess: (res) =>
      toast.success(res.status === 'completed' ? 'Donation completed' : 'Thanks for confirming', res.status === 'completed' ? `${r.donor.displayName}’s Honour Board count went up.` : 'It completes once the donor marks it as sent.'),
  });

  return (
    <li className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <Link to={paths.donation(r.listingId)} className="block truncate text-white hover:text-champagne">
          {r.listingTitle}
        </Link>
        <p className="text-xs text-muted">
          From {r.donor.displayName} · requested {relativeTime(r.createdAt)}
          {r.status === 'accepted' && (r.donorCoversShipping ? ' · donor covers the courier' : ` · courier ${formatINR(r.agreedCourierCharge ?? 0)}, paid by you`)}
          {r.status === 'accepted' && (r.donorConfirmedAt ? ' · donor has sent it' : ' · waiting for the donor to send it')}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <RequestStatusBadge status={r.status} />
        <ButtonLink size="sm" variant="ghost" leadingIcon="inbox" to={paths.conversation(r.conversationId)}>
          Chat
        </ButtonLink>
        {r.status === 'pending' && (
          <Button size="sm" variant="ghost" onClick={() => setConfirmWithdraw(true)}>
            Withdraw
          </Button>
        )}
        {r.status === 'accepted' && !r.recipientConfirmedAt && (
          <Button size="sm" leadingIcon="success" loading={confirm.pending} onClick={() => void confirm.run(r.id)}>
            It arrived
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={confirmWithdraw}
        onClose={() => setConfirmWithdraw(false)}
        title="Withdraw your request?"
        description="The donor will see that you no longer need it."
        confirmLabel="Withdraw request"
        tone="danger"
        pending={withdraw.pending}
        onConfirm={() => void withdraw.run(r.id)}
      />
    </li>
  );
}
