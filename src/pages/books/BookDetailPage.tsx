import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { Container } from '@/components/layout/Container';
import { Avatar, Badge, Button, ButtonLink, Card, Checkbox, Field, Icon, Modal, Textarea, useToast } from '@/components/ui';
import { IdentityPrompt } from '@/components/shared/IdentityPrompt';
import { Loadable } from '@/components/shared/Loadable';
import { ReportDialog } from '@/components/shared/ReportDialog';
import { DetailSkeleton } from '@/components/shared/Skeletons';
import { BookCard } from '@/features/books/BookCard';
import { ListingStatusBadge } from '@/features/books/StatusBadge';
import { ListingGallery } from '@/features/books/ListingGallery';
import { useAction } from '@/hooks/useAction';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatINR, relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { SaleListing } from '@/types/domain';
import { CONDITION_LABEL } from '@/types/labels';

export default function BookDetailPage() {
  const { listingId = '' } = useParams();
  const listing = useAsync(() => services.books.get(listingId), [listingId]);
  useDocumentTitle(listing.status === 'success' ? listing.data.title : 'Book');

  return (
    <Container size="wide" className="pb-16">
      <div className="pt-6">
        <ButtonLink to={paths.books} variant="ghost" size="sm" leadingIcon="back">
          All books
        </ButtonLink>
      </div>
      <Loadable
        query={listing}
        skeleton={<DetailSkeleton />}
        notFound={{ title: 'This book isn’t available', description: 'It may have been sold or withdrawn by the seller.', backTo: paths.books, backLabel: 'Browse books' }}
      >
        {(book) => <BookDetail book={book} />}
      </Loadable>
    </Container>
  );
}

function BookDetail({ book }: { book: SaleListing }) {
  const { user } = useSession();
  const [reporting, setReporting] = useState(false);
  const mine = user?.id === book.owner.id;
  const percentOff = Math.round((1 - book.askingPrice / book.originalPrice) * 100);

  return (
    <>
      <div className="grid gap-8 py-6 md:grid-cols-[minmax(0,22rem)_1fr] lg:gap-14">
        <ListingGallery title={book.title} author={book.author} photos={book.photos} />

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <ListingStatusBadge status={book.status} />
            {book.isCurrentEdition ? <Badge tone="gold">Current edition</Badge> : <Badge tone="outline">Older edition</Badge>}
            <Badge tone="outline">Published {book.publicationYear}</Badge>
          </div>
          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight text-white">{book.title}</h1>
          <p className="mt-2 text-lg text-mist">{book.author}</p>

          <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-2">
            <p className="text-4xl font-semibold text-champagne tabular-nums">{formatINR(book.askingPrice)}</p>
            <p className="pb-1 text-mist">
              Printed price <span className="line-through tabular-nums">{formatINR(book.originalPrice)}</span> · {percentOff}% off
            </p>
          </div>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-success">
            <Icon name="verified" size="sm" />
            Within the fair-price limit of {formatINR(book.maxAllowedPrice)} ({book.pricingRuleLabel.toLowerCase()})
          </p>

          <ListingActions book={book} mine={mine} />

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 text-sm sm:grid-cols-3">
            <Detail label="Subject" value={book.subject} />
            <Detail label="Course" value={book.course.join(', ')} />
            <Detail label="Condition" value={CONDITION_LABEL[book.condition]} />
            <Detail label="Edition" value={book.editionLabel} />
            <Detail label="Year" value={String(book.publicationYear)} />
            <Detail label="Listed" value={relativeTime(book.createdAt)} />
          </dl>

          {book.description && (
            <section className="mt-8">
              <h2 className="font-medium text-white">From the seller</h2>
              <p className="mt-2 leading-relaxed whitespace-pre-line text-mist">{book.description}</p>
            </section>
          )}

          <Card className="mt-8 flex items-center gap-4">
            <Avatar name={book.owner.displayName} size="lg" />
            <div className="min-w-0 flex-1">
              <Link to={paths.profile(book.owner.displayName)} className="font-medium text-white hover:text-champagne">
                {book.owner.displayName}
              </Link>
              <p className="text-sm text-muted">
                {book.owner.course ? `${book.owner.course} student` : 'Member'}
                {book.city && (
                  <>
                    {' · '}
                    <Icon name="location" size="xs" className="inline" /> {book.city}
                  </>
                )}
              </p>
            </div>
            {book.interestCount > 0 && <span className="text-sm text-muted">{book.interestCount} interested</span>}
          </Card>

          <Card tone="gold" className="mt-4">
            <h2 className="inline-flex items-center gap-2 font-medium text-white">
              <Icon name="shield" size="sm" className="text-gold" />
              Buying safely
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-mist">
              <li>Kesh Squad doesn’t process payments. You and the seller agree on payment and delivery directly.</li>
              <li>Ask for photos of the index and any damaged pages before paying.</li>
              <li>Prefer meeting on campus or paying on delivery. Avoid paying strangers in advance.</li>
            </ul>
            <Link to={paths.rules} className="mt-3 inline-block text-sm text-gold hover:text-champagne hover:underline">
              Read the marketplace rules
            </Link>
          </Card>

          {!mine && (
            <button type="button" onClick={() => setReporting(true)} className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
              <Icon name="flag" size="sm" />
              Report this listing
            </button>
          )}
        </div>
      </div>

      <MoreInSubject book={book} />
      <ReportDialog open={reporting} onClose={() => setReporting(false)} targetType="listing" targetId={book.id} targetLabel="listing" />
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 text-white">{value}</dd>
    </div>
  );
}

function ListingActions({ book, mine }: { book: SaleListing; mine: boolean }) {
  const { user } = useSession();
  const navigate = useNavigate();
  const toast = useToast();
  const [prompt, setPrompt] = useState(false);
  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState(`Hi! Is “${book.title}” still available?`);
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState<string>();
  const existing = useAsync(() => services.messaging.findConversationForListing(book.id), [book.id, user?.id]);
  const start = useAction((text: string) => services.messaging.startSaleConversation(book.id, text), {
    errorTitle: 'Couldn’t open the conversation',
    onSuccess: (c) => {
      toast.success('Conversation opened', 'Prototype: your message is kept in this browser and isn’t delivered.');
      navigate(paths.conversation(c.id));
    },
  });

  if (mine) {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ButtonLink to={paths.editListing(book.id)} leadingIcon="edit">
          Edit listing
        </ButtonLink>
        <ButtonLink to={paths.dashboardListings} variant="secondary">
          Manage availability
        </ButtonLink>
        <span className="text-sm text-muted">This is your listing.</span>
      </div>
    );
  }

  const conversation = existing.status === 'success' ? existing.data : null;
  if (conversation) {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ButtonLink to={paths.conversation(conversation.id)} leadingIcon="inbox" size="lg">
          Open your conversation
        </ButtonLink>
        <span className="text-sm text-muted">You’ve already contacted the seller.</span>
      </div>
    );
  }

  if (book.status !== 'available' && book.status !== 'reserved') {
    return <p className="mt-6 rounded-[var(--radius-field)] border border-line p-4 text-mist">This book is no longer available.</p>;
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" leadingIcon="comment" onClick={() => (user ? setComposing(true) : setPrompt(true))}>
          I’m interested
        </Button>
        <span className="text-sm text-muted">{book.status === 'reserved' ? 'Reserved for another buyer — you can still ask.' : 'Opens a private chat with the seller.'}</span>
      </div>

      <IdentityPrompt
        open={prompt}
        onClose={() => setPrompt(false)}
        title="Message the seller"
        description="No account needed to ask about a book. Log in, or continue as a guest."
        onReady={() => setComposing(true)}
      />

      <Modal
        open={composing}
        onClose={() => setComposing(false)}
        title="Message the seller"
        description={`About “${book.title}” · ${formatINR(book.askingPrice)}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setComposing(false)}>
              Cancel
            </Button>
            <Button
              loading={start.pending}
              onClick={() => {
                if (!agreed) return setAgreeError('Please confirm you’ve read the marketplace rules.');
                setAgreeError(undefined);
                void start.run(message);
              }}
            >
              Send and open chat
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Your message" error={start.fieldErrors.body}>
            {(p) => <Textarea {...p} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />}
          </Field>
          <div>
            <Checkbox
              label="I’ve read the marketplace rules"
              description={
                <>
                  Payment and delivery are arranged directly with the seller; Kesh Squad doesn’t process payments.{' '}
                  <Link to={paths.rules} target="_blank" className="text-gold underline">
                    Read the rules
                  </Link>
                </>
              }
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setAgreeError(undefined);
              }}
            />
            {agreeError && (
              <p className="mt-2 text-sm text-danger" role="alert">
                {agreeError}
              </p>
            )}
          </div>
          <p className="rounded-[var(--radius-field)] bg-gold/8 px-3 py-2 text-xs text-champagne">
            Prototype: this opens a sample conversation stored in your browser. The seller won’t receive it.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function MoreInSubject({ book }: { book: SaleListing }) {
  const more = useAsync(() => services.books.search({ subject: book.subject }), [book.subject]);
  const others = more.status === 'success' ? more.data.filter((b) => b.id !== book.id).slice(0, 4) : [];
  if (!others.length) return null;
  return (
    <section className="border-t border-line pt-10">
      <h2 className="font-display text-[1.75rem] text-white">More {book.subject} books</h2>
      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
        {others.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </section>
  );
}
