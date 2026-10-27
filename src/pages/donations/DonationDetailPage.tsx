import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { Container } from '@/components/layout/Container';
import { Avatar, Badge, Button, ButtonLink, Card, CharCount, Checkbox, Field, Icon, Input, Modal, Textarea, useToast } from '@/components/ui';
import { IdentityPrompt } from '@/components/shared/IdentityPrompt';
import { Loadable } from '@/components/shared/Loadable';
import { ReportDialog } from '@/components/shared/ReportDialog';
import { DetailSkeleton } from '@/components/shared/Skeletons';
import { LIMITS } from '@/domain/constants';
import { ListingGallery } from '@/features/books/ListingGallery';
import { ListingStatusBadge, RequestStatusBadge } from '@/features/books/StatusBadge';
import { useAction } from '@/hooks/useAction';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { DonationListing } from '@/types/domain';
import { CONDITION_LABEL } from '@/types/labels';

export default function DonationDetailPage() {
  const { listingId = '' } = useParams();
  const listing = useAsync(() => services.donations.get(listingId), [listingId]);
  useDocumentTitle(listing.status === 'success' ? listing.data.title : 'Donated book');

  return (
    <Container size="wide" className="pb-16">
      <div className="pt-6">
        <ButtonLink to={paths.donate} variant="ghost" size="sm" leadingIcon="back">
          All donations
        </ButtonLink>
      </div>
      <Loadable
        query={listing}
        skeleton={<DetailSkeleton />}
        notFound={{ title: 'This donation isn’t available', description: 'It may have been given away or withdrawn.', backTo: paths.donate, backLabel: 'Browse donations' }}
      >
        {(d) => <DonationDetail d={d} />}
      </Loadable>
    </Container>
  );
}

function DonationDetail({ d }: { d: DonationListing }) {
  const { user } = useSession();
  const [reporting, setReporting] = useState(false);
  const mine = user?.id === d.owner.id;
  return (
    <div className="grid gap-8 py-6 md:grid-cols-[minmax(0,22rem)_1fr] lg:gap-14">
      <ListingGallery title={d.title} author={d.author} photos={d.photos} tone="champagne" />
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <Badge tone="success" icon="free">
            Free
          </Badge>
          <ListingStatusBadge status={d.status} />
          {d.quantity > 1 && <Badge tone="outline">{d.quantity} books</Badge>}
          <Badge tone="outline">Published {d.publicationYear}</Badge>
        </div>
        <h1 className="mt-4 font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight text-white">{d.title}</h1>
        <p className="mt-2 text-lg text-mist">{d.author}</p>

        <Card tone="gold" className="mt-6 flex gap-3">
          <Icon name="courier" className="mt-0.5 text-gold" />
          <div>
            <p className="font-medium text-white">The book is free.</p>
            <p className="text-sm text-mist">
              {d.donorCoversShipping
                ? `${d.owner.displayName} has offered to cover the courier too.`
                : 'You pay only the courier charge you agree with the donor. Example: if the courier costs ₹100, you pay ₹100 and get the book free.'}
            </p>
          </div>
        </Card>

        <RequestActions d={d} mine={mine} />

        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 text-sm sm:grid-cols-3">
          {[
            ['Subject', d.subject],
            ['Course', d.course.join(', ')],
            ['Condition', CONDITION_LABEL[d.condition]],
            ['Edition', d.editionLabel],
            ['City', d.city ?? 'Not given'],
            ['Listed', relativeTime(d.createdAt)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-muted">{k}</dt>
              <dd className="mt-0.5 text-white">{v}</dd>
            </div>
          ))}
        </dl>

        {d.description && (
          <section className="mt-8">
            <h2 className="font-medium text-white">From the donor</h2>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-mist">{d.description}</p>
          </section>
        )}

        <Card className="mt-8 flex items-center gap-4">
          <Avatar name={d.owner.displayName} size="lg" />
          <div className="min-w-0 flex-1">
            <Link to={paths.profile(d.owner.displayName)} className="font-medium text-white hover:text-champagne">
              {d.owner.displayName}
            </Link>
            <p className="text-sm text-muted">{d.owner.course ? `${d.owner.course} student` : 'Member'}</p>
          </div>
          {d.requestCount > 0 && <span className="text-sm text-muted">{d.requestCount} open {d.requestCount === 1 ? 'request' : 'requests'}</span>}
        </Card>

        {!mine && (
          <button type="button" onClick={() => setReporting(true)} className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
            <Icon name="flag" size="sm" />
            Report this listing
          </button>
        )}
        <ReportDialog open={reporting} onClose={() => setReporting(false)} targetType="listing" targetId={d.id} targetLabel="listing" />
      </div>
    </div>
  );
}

function RequestActions({ d, mine }: { d: DonationListing; mine: boolean }) {
  const { user } = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [books, setBooks] = useState('1');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ message?: string; agreed?: string; books?: string }>({});
  const existing = useAsync(() => services.donations.getMyRequestFor(d.id), [d.id, user?.id]);
  const request = useAction(services.donations.request, {
    errorTitle: 'Request not sent',
    onSuccess: (r) => {
      setOpen(false);
      toast.success('Request sent', 'Chat with the donor in your inbox. (Prototype: kept in this browser, not delivered.)');
      navigate(paths.conversation(r.conversationId));
    },
  });

  if (mine) {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ButtonLink to={paths.dashboardDonations} leadingIcon="dashboard">
          Manage requests
        </ButtonLink>
        <ButtonLink to={paths.editDonation(d.id)} variant="secondary" leadingIcon="edit">
          Edit
        </ButtonLink>
        <span className="text-sm text-muted">This is your donation.</span>
      </div>
    );
  }

  const mineReq = existing.status === 'success' ? existing.data : null;
  if (mineReq && (mineReq.status === 'pending' || mineReq.status === 'accepted' || mineReq.status === 'completed')) {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <RequestStatusBadge status={mineReq.status} />
        <ButtonLink to={paths.conversation(mineReq.conversationId)} leadingIcon="inbox">
          Open conversation
        </ButtonLink>
        <ButtonLink to={paths.dashboardActivity} variant="ghost">
          My requests
        </ButtonLink>
      </div>
    );
  }

  if (d.status !== 'available') {
    return <p className="mt-6 rounded-[var(--radius-field)] border border-line p-4 text-mist">This book has been promised to another student.</p>;
  }

  function submit() {
    const next: typeof errors = {};
    const len = message.trim().length;
    if (len < LIMITS.donationRequestMessage.min) next.message = `Tell the donor a little about why you need it (at least ${LIMITS.donationRequestMessage.min} characters).`;
    if (len > LIMITS.donationRequestMessage.max) next.message = `Keep it under ${LIMITS.donationRequestMessage.max} characters.`;
    const n = Number(books);
    if (!Number.isInteger(n) || n < 1 || n > d.quantity) next.books = `Choose between 1 and ${d.quantity}.`;
    if (!agreed) next.agreed = 'Please confirm you understand the donation rules.';
    setErrors(next);
    if (Object.keys(next).length) return;
    void request.run({ listingId: d.id, message, booksRequested: n });
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" leadingIcon="donate" onClick={() => (user ? setOpen(true) : setPrompt(true))}>
          Request this book
        </Button>
        <span className="text-sm text-muted">The donor chooses who receives it.</span>
      </div>
      <IdentityPrompt open={prompt} onClose={() => setPrompt(false)} title="Request this book" description="Log in, or continue as a guest, to send the donor a private request." onReady={() => setOpen(true)} />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Request this book"
        description={d.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={request.pending} onClick={submit}>
              Send request
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field
            label="Note to the donor"
            required
            error={errors.message ?? request.fieldErrors.message}
            hint={<span className="flex justify-between gap-3"><span>Your year, college city, and how you’ll use it.</span><CharCount value={message} max={LIMITS.donationRequestMessage.max} /></span>}
          >
            {(p) => <Textarea {...p} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="I’m in second year MBBS in Pune and would use this for my pharmacology prep." />}
          </Field>
          {d.quantity > 1 && (
            <Field label="How many books?" hint={`Up to ${d.quantity}.`} error={errors.books ?? request.fieldErrors.booksRequested}>
              {(p) => <Input {...p} inputMode="numeric" value={books} onChange={(e) => setBooks(e.target.value.replace(/\D/g, '').slice(0, 2))} className="max-w-24" />}
            </Field>
          )}
          <div>
            <Checkbox
              label="I understand the donation rules"
              description="The book is free. I’ll pay only the courier charge we agree on, unless the donor offers to cover it."
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            {errors.agreed && (
              <p className="mt-2 text-sm text-danger" role="alert">
                {errors.agreed}
              </p>
            )}
          </div>
          <p className="rounded-[var(--radius-field)] bg-gold/8 px-3 py-2 text-xs text-champagne">Prototype: the request is stored in your browser. The donor won’t receive it.</p>
        </div>
      </Modal>
    </div>
  );
}
