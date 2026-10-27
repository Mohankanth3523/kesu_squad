import { useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Button, ButtonLink, Checkbox, ConfirmDialog, EmptyState, Field, Icon, Input, Modal, useToast } from '@/components/ui';
import { Loadable } from '@/components/shared/Loadable';
import { ListSkeleton } from '@/components/shared/Skeletons';
import { validateCourierCharge } from '@/domain/validation';
import { BookCover } from '@/features/books/BookCover';
import { ListingStatusBadge, RequestStatusBadge } from '@/features/books/StatusBadge';
import { useAction } from '@/hooks/useAction';
import { useAsync } from '@/hooks/useAsync';
import { formatINR, relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { DonationListing, DonationRequest } from '@/types/domain';

/**
 * Donor dashboard (C1 §4): choose a requester, record the agreed courier terms,
 * mark the book sent. A donation completes once the recipient confirms it arrived.
 */
export default function MyDonationsPage() {
  const data = useAsync(async () => {
    const [listings, requests] = await Promise.all([services.donations.listMine(), services.donations.listIncomingRequests()]);
    return { listings, requests };
  });

  return (
    <div>
      <PageHeader compact title="My donations" description="Books you’re giving away and the students who asked for them." actions={<ButtonLink to={paths.newDonation} leadingIcon="donate">Donate a book</ButtonLink>} />
      <Loadable
        query={data}
        skeleton={<ListSkeleton rows={3} />}
        isEmpty={(d) => d.listings.length === 0}
        empty={<EmptyState icon="donate" title="You haven’t donated any books yet" description="Give a textbook a second life — completed donations earn a place on the Honour Board." action={<ButtonLink to={paths.newDonation} size="sm">Donate a book</ButtonLink>} />}
      >
        {({ listings, requests }) => (
          <ul className="space-y-5">
            {listings.map((l) => (
              <DonationBlock key={l.id} listing={l} requests={requests.filter((r) => r.listingId === l.id)} />
            ))}
          </ul>
        )}
      </Loadable>
    </div>
  );
}

function DonationBlock({ listing, requests }: { listing: DonationListing; requests: DonationRequest[] }) {
  const toast = useToast();
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const withdraw = useAction(services.donations.withdraw, {
    errorTitle: 'Not withdrawn',
    onSuccess: () => {
      setConfirmWithdraw(false);
      toast.success('Donation withdrawn', 'Open requests were closed.');
    },
  });
  const open = requests.filter((r) => r.status === 'pending' || r.status === 'accepted');
  const closed = requests.filter((r) => !open.includes(r));
  const editable = listing.status === 'available' || listing.status === 'reserved';

  return (
    <li className="rounded-[var(--radius-surface)] border border-line bg-charcoal">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 gap-4">
          <BookCover title={listing.title} author={listing.author} photo={listing.photos[0]} tone="champagne" size="sm" className="w-14 shrink-0" />
          <div className="min-w-0">
            <Link to={paths.donation(listing.id)} className="line-clamp-2 font-medium text-white hover:text-champagne">
              {listing.title}
            </Link>
            <p className="mt-1 text-sm text-muted">
              {listing.quantity > 1 ? `${listing.quantity} books · ` : ''}
              {listing.donorCoversShipping ? 'You cover the courier' : 'Recipient pays the courier'} · listed {relativeTime(listing.createdAt)}
            </p>
            <div className="mt-2">
              <ListingStatusBadge status={listing.status} />
            </div>
          </div>
        </div>
        {editable && (
          <div className="flex gap-2">
            <ButtonLink size="sm" variant="ghost" leadingIcon="edit" to={paths.editDonation(listing.id)}>
              Edit
            </ButtonLink>
            <Button size="sm" variant="ghost" onClick={() => setConfirmWithdraw(true)}>
              Withdraw
            </Button>
          </div>
        )}
      </div>

      <div className="border-t border-line px-4 py-3">
        {open.length === 0 && closed.length === 0 ? (
          <p className="py-2 text-sm text-muted">No requests yet. Students who need it will appear here.</p>
        ) : (
          <ul className="divide-y divide-line">
            {open.map((r) => (
              <RequestRow key={r.id} r={r} />
            ))}
            {closed.length > 0 && (
              <li className="py-2">
                <details>
                  <summary className="cursor-pointer text-sm text-muted hover:text-white">{closed.length} closed {closed.length === 1 ? 'request' : 'requests'}</summary>
                  <ul className="mt-2 divide-y divide-line">
                    {closed.map((r) => (
                      <RequestRow key={r.id} r={r} />
                    ))}
                  </ul>
                </details>
              </li>
            )}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmWithdraw}
        onClose={() => setConfirmWithdraw(false)}
        title="Withdraw this donation?"
        description="It leaves the Donate page and any open requests are closed."
        confirmLabel="Withdraw"
        tone="danger"
        pending={withdraw.pending}
        onConfirm={() => void withdraw.run(listing.id)}
      />
    </li>
  );
}

function RequestRow({ r }: { r: DonationRequest }) {
  const toast = useToast();
  const [accepting, setAccepting] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [charge, setCharge] = useState('');
  const [covers, setCovers] = useState(false);
  const [chargeError, setChargeError] = useState<string>();

  const done = (title: string, description?: string) => () => toast.success(title, description);
  const accept = useAction((id: string) => services.donations.accept(id, { courierCharge: covers ? undefined : Number(charge), donorCoversShipping: covers }), {
    errorTitle: 'Not accepted',
    onSuccess: () => {
      setAccepting(false);
      toast.success('Request accepted', 'Other waiting requests were closed. Arrange the courier in the chat.');
    },
  });
  const decline = useAction(services.donations.decline, { errorTitle: 'Not declined', onSuccess: () => { setConfirmDecline(false); done('Request declined')(); } });
  const cancel = useAction(services.donations.cancel, { errorTitle: 'Not cancelled', onSuccess: () => { setConfirmCancel(false); done('Donation cancelled', 'Cancelled donations don’t count on the Honour Board.')(); } });
  const markSent = useAction(services.donations.markSent, { errorTitle: 'Not updated', onSuccess: done('Marked as sent', 'It completes when the recipient confirms it arrived.') });
  const simulate = useAction(services.donations.simulateRecipientConfirmation, { errorTitle: 'Not updated', onSuccess: done('Donation completed', 'Your Honour Board count went up.') });

  return (
    <li className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-1 gap-3">
        <Avatar name={r.requester.displayName} size="sm" className="mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm">
            <span className="font-medium text-white">{r.requester.displayName}</span>
            <span className="text-muted"> · {relativeTime(r.createdAt)}{r.booksRequested > 1 ? ` · ${r.booksRequested} books` : ''}</span>
          </p>
          <p className="mt-1 text-sm text-mist">“{r.message}”</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <RequestStatusBadge status={r.status} />
            {r.status === 'accepted' && (
              <span className="text-muted">
                {r.donorCoversShipping ? 'You cover the courier' : `Courier ${formatINR(r.agreedCourierCharge ?? 0)}, paid by recipient`}
                {r.donorConfirmedAt ? ' · sent' : ''}
                {r.recipientConfirmedAt ? ' · received' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <ButtonLink size="sm" variant="ghost" leadingIcon="inbox" to={paths.conversation(r.conversationId)}>
          Chat
        </ButtonLink>
        {r.status === 'pending' && (
          <>
            <Button size="sm" onClick={() => setAccepting(true)}>
              Accept
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDecline(true)}>
              Decline
            </Button>
          </>
        )}
        {r.status === 'accepted' && !r.donorConfirmedAt && (
          <Button size="sm" leadingIcon="courier" loading={markSent.pending} onClick={() => void markSent.run(r.id)}>
            Mark as sent
          </Button>
        )}
        {r.status === 'accepted' && r.donorConfirmedAt && !r.recipientConfirmedAt && (
          <Button size="sm" variant="secondary" leadingIcon="sparkle" loading={simulate.pending} onClick={() => void simulate.run(r.id)} title="Prototype only">
            Simulate recipient confirming
          </Button>
        )}
        {r.status === 'accepted' && (
          <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(true)}>
            Cancel
          </Button>
        )}
      </div>

      <Modal
        open={accepting}
        onClose={() => setAccepting(false)}
        title={`Give it to ${r.requester.displayName}?`}
        description="Record the courier terms you agreed in the chat, so you both see the same thing."
        footer={
          <>
            <Button variant="ghost" onClick={() => setAccepting(false)}>
              Cancel
            </Button>
            <Button
              loading={accept.pending}
              onClick={() => {
                const err = validateCourierCharge(charge, covers);
                setChargeError(err);
                if (!err) void accept.run(r.id);
              }}
            >
              Accept request
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Agreed courier charge" hint="Paid by the recipient. Kesh Squad doesn’t collect it." error={chargeError ?? accept.fieldErrors.courierCharge}>
            {(p) => <Input {...p} prefix="₹" inputMode="numeric" disabled={covers} value={covers ? '' : charge} onChange={(e) => setCharge(e.target.value.replace(/\D/g, '').slice(0, 5))} className="max-w-40" />}
          </Field>
          <Checkbox
            label="I’ll cover the courier myself"
            description="Optional. Donors don’t have to."
            checked={covers}
            onChange={(e) => {
              setCovers(e.target.checked);
              setChargeError(undefined);
            }}
          />
          <p className="flex gap-2 text-sm text-mist">
            <Icon name="info" size="sm" className="mt-0.5 text-gold" />
            Other waiting requests for this book will be closed automatically.
          </p>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirmDecline}
        onClose={() => setConfirmDecline(false)}
        title="Decline this request?"
        description={`${r.requester.displayName} will see that the request was declined.`}
        confirmLabel="Decline"
        tone="danger"
        pending={decline.pending}
        onConfirm={() => void decline.run(r.id)}
      />
      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel this donation?"
        description="The book becomes available again. Cancelled donations don’t count on the Honour Board."
        confirmLabel="Cancel donation"
        tone="danger"
        pending={cancel.pending}
        onConfirm={() => void cancel.run(r.id)}
      />
    </li>
  );
}
