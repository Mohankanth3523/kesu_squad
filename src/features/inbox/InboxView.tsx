import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import {
  Avatar,
  ButtonLink,
  CharCount,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  LoadingRegion,
  Segmented,
  Skeleton,
  useToast,
} from '@/components/ui';
import { ReportDialog } from '@/components/shared/ReportDialog';
import { LIMITS } from '@/domain/constants';
import { validateMessage } from '@/domain/validation';
import { ListingStatusBadge } from '@/features/books/StatusBadge';
import { useAction } from '@/hooks/useAction';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';
import { formatINR, relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { ConversationSummary, Message } from '@/types/domain';
import { ServiceError } from '@/types/service';

type Filter = 'all' | 'buying' | 'selling' | 'donations';

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'buying', label: 'Buying' },
  { value: 'selling', label: 'Selling' },
  { value: 'donations', label: 'Donations' },
];

function matchesFilter(c: ConversationSummary, f: Filter) {
  if (f === 'all') return true;
  if (f === 'donations') return c.kind === 'donation';
  return c.kind === 'sale' && (f === 'buying' ? c.viewerRole === 'initiator' : c.viewerRole === 'owner');
}

/**
 * Private inbox (C1 §3, §6; C2 §2). Two panes on desktop; list → thread on phones.
 * Prototype: sample conversations are seeded; what you write is kept in this browser
 * and is never delivered to anyone.
 */
export function InboxView({ selectedId }: { selectedId?: string }) {
  useDocumentTitle('Inbox');
  const { user } = useSession();
  const [filter, setFilter] = useState<Filter>('all');
  const list = useAsync(() => services.messaging.listConversations(), [user?.id]);

  const visible = list.status === 'success' ? list.data.filter((c) => matchesFilter(c, filter)) : [];

  return (
    <div className="mx-auto w-full max-w-7xl px-0 sm:px-6 lg:px-8">
      <div className="grid h-[calc(100dvh-4rem-1.75rem-4rem)] overflow-hidden border-line sm:my-6 sm:h-[calc(100dvh-4rem-1.75rem-7rem)] sm:rounded-[var(--radius-surface)] sm:border lg:h-[calc(100dvh-4rem-1.75rem-3rem)] lg:grid-cols-[22rem_1fr]">
        {/* Conversation list */}
        <section aria-label="Conversations" className={cn('flex min-h-0 flex-col border-line lg:border-r', selectedId && 'hidden lg:flex')}>
          <header className="space-y-3 border-b border-line px-4 py-4">
            <div className="flex items-baseline justify-between">
              <h1 className="font-display text-3xl text-white">Inbox</h1>
              {list.status === 'success' && <span className="text-sm text-muted">{list.data.length} conversations</span>}
            </div>
            <Segmented label="Show conversations" size="sm" value={filter} onChange={setFilter} options={FILTERS} />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {list.status === 'loading' && (
              <LoadingRegion label="Loading conversations" className="space-y-1 p-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex gap-3 p-2">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </LoadingRegion>
            )}
            {list.status === 'error' && <ErrorState error={list.error} onRetry={list.retry} compact className="m-4" />}
            {list.status === 'success' &&
              (visible.length === 0 ? (
                <EmptyState
                  compact
                  icon="inbox"
                  className="m-4"
                  title={list.data.length === 0 ? 'No conversations yet' : 'Nothing here'}
                  description={list.data.length === 0 ? 'When you message a seller or request a donated book, the conversation appears here.' : 'Try another filter.'}
                  action={list.data.length === 0 ? <ButtonLink to={paths.books} size="sm">Browse books</ButtonLink> : undefined}
                />
              ) : (
                <ul>
                  {visible.map((c) => (
                    <ConversationRow key={c.id} c={c} active={c.id === selectedId} />
                  ))}
                </ul>
              ))}
          </div>
        </section>

        {/* Thread */}
        <section aria-label="Messages" className={cn('min-h-0 flex-col', selectedId ? 'flex' : 'hidden lg:flex')}>
          {selectedId ? (
            <Thread key={selectedId} id={selectedId} />
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div className="max-w-sm">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-gold/10 text-gold">
                  <Icon name="lock" size="lg" />
                </span>
                <p className="mt-4 font-display text-2xl text-white">Private conversations</p>
                <p className="mt-2 text-sm text-mist">Choose a conversation. Only you and the other person can read it, and phone numbers are never shown publicly.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ConversationRow({ c, active }: { c: ConversationSummary; active: boolean }) {
  const role = c.kind === 'donation' ? (c.viewerRole === 'owner' ? 'Your donation' : 'Requested') : c.viewerRole === 'owner' ? 'Selling' : 'Buying';
  return (
    <li>
      <Link
        to={paths.conversation(c.id)}
        aria-current={active ? 'page' : undefined}
        className={cn('flex gap-3 border-b border-line/60 px-4 py-3.5 transition-colors', active ? 'bg-gold/8' : 'hover:bg-white/[0.03]')}
      >
        <Avatar name={c.counterpart.displayName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className={cn('truncate text-sm', c.unreadCount ? 'font-semibold text-white' : 'text-white')}>{c.counterpart.displayName}</p>
            <time className="shrink-0 text-xs text-muted" dateTime={c.lastMessageAt}>
              {relativeTime(c.lastMessageAt)}
            </time>
          </div>
          <p className="truncate text-xs text-champagne/80">
            {role} · {c.listing.title}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <p className={cn('min-w-0 flex-1 truncate text-sm', c.unreadCount ? 'text-white' : 'text-muted')}>{c.lastMessagePreview || 'No messages yet'}</p>
            {c.unreadCount > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-gold px-1.5 text-2xs font-semibold text-ink" aria-label={`${c.unreadCount} unread`}>
                {c.unreadCount}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

function Thread({ id }: { id: string }) {
  const navigate = useNavigate();
  const { user } = useSession();
  const toast = useToast();
  const conv = useAsync(() => services.messaging.getConversation(id), [id]);
  const messages = useAsync(() => services.messaging.listMessages(id), [id]);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [reporting, setReporting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark as read once loaded (only when there is something unread, to avoid needless writes).
  const unread = conv.status === 'success' ? conv.data.unreadCount : 0;
  useEffect(() => {
    if (unread > 0) void services.messaging.markRead(id).catch(() => undefined);
  }, [id, unread]);

  const count = messages.status === 'success' ? messages.data.length : 0;
  useEffect(() => {
    // Wait a frame so the new messages are laid out before scrolling to the newest.
    const frame = requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
    return () => cancelAnimationFrame(frame);
  }, [count]);

  const block = useAction((blocked: boolean) => services.messaging.setBlocked(id, blocked), {
    onSuccess: () => setConfirmBlock(false),
  });

  if (conv.status === 'error') {
    const missing = conv.error instanceof ServiceError && conv.error.code === 'not_found';
    return (
      <div className="grid flex-1 place-items-center p-6">
        <ErrorState
          title={missing ? 'Conversation not found' : 'This conversation didn’t load'}
          description={missing ? 'It may not exist, or it belongs to other people. Private conversations are only visible to the two people in them.' : undefined}
          error={conv.error}
          onRetry={missing ? undefined : conv.retry}
          action={missing ? <ButtonLink to={paths.inbox} variant="secondary" size="sm">Back to inbox</ButtonLink> : undefined}
        />
      </div>
    );
  }
  if (conv.status === 'loading') {
    return (
      <LoadingRegion label="Loading conversation" className="space-y-4 p-5">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="ml-auto h-10 w-1/2" />
      </LoadingRegion>
    );
  }

  const c = conv.data;
  const listingHref = c.listing.type === 'sale' ? paths.book(c.listing.id) : paths.donation(c.listing.id);
  const closed = c.listing.status === 'withdrawn';

  return (
    <>
      <header className="flex items-center gap-3 border-b border-line px-3 py-3 sm:px-4">
        <IconButton icon="back" label="Back to conversations" className="lg:hidden" onClick={() => navigate(paths.inbox)} />
        <Avatar name={c.counterpart.displayName} />
        <div className="min-w-0 flex-1">
          <Link to={paths.profile(c.counterpart.displayName)} className="block truncate font-medium text-white hover:text-champagne">
            {c.counterpart.displayName}
          </Link>
          <p className="truncate text-xs text-muted">{c.viewerRole === 'owner' ? (c.kind === 'donation' ? 'Requested your donation' : 'Interested in your book') : c.kind === 'donation' ? 'Donor' : 'Seller'}</p>
        </div>
        <IconButton icon="flag" label="Report this conversation" onClick={() => setReporting(true)} />
        <IconButton icon={c.blockedByViewer ? 'show' : 'hide'} label={c.blockedByViewer ? 'Unblock this person' : 'Block this person'} onClick={() => (c.blockedByViewer ? void block.run(false) : setConfirmBlock(true))} />
      </header>

      <Link to={listingHref} className="flex items-center gap-3 border-b border-line bg-ink-raised px-4 py-3 hover:bg-white/[0.03]">
        <Icon name={c.kind === 'donation' ? 'donate' : 'books'} className="text-gold" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-white">{c.listing.title}</p>
          <p className="text-xs text-muted">{c.listing.type === 'sale' && c.listing.askingPrice !== undefined ? formatINR(c.listing.askingPrice) : 'Free · recipient pays the agreed courier charge'}</p>
        </div>
        <ListingStatusBadge status={c.listing.status} />
      </Link>

      <p className="flex items-center gap-2 border-b border-gold/15 bg-gold/6 px-4 py-2 text-xs text-champagne">
        <Icon name="info" size="xs" />
        Prototype: messages you write stay in this browser. Nobody else receives them.
      </p>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5" aria-live="polite" aria-relevant="additions">
        {messages.status === 'loading' && <Skeleton className="h-10 w-1/2" />}
        {messages.status === 'error' && <ErrorState error={messages.error} onRetry={messages.retry} compact />}
        {messages.status === 'success' && <MessageList messages={messages.data} viewerId={user?.id ?? ''} />}
      </div>

      {c.blockedByViewer ? (
        <div className="border-t border-line p-4 text-center text-sm text-mist">
          You blocked {c.counterpart.displayName}. Unblock them to send messages.
        </div>
      ) : closed ? (
        <div className="border-t border-line p-4 text-center text-sm text-mist">This listing was withdrawn, so the conversation is closed.</div>
      ) : (
        <Composer conversationId={id} onSent={() => toast.info('Saved in this browser', 'Prototype messages aren’t delivered to anyone.')} />
      )}

      <ConfirmDialog
        open={confirmBlock}
        onClose={() => setConfirmBlock(false)}
        title={`Block ${c.counterpart.displayName}?`}
        description="Neither of you will be able to send messages in this conversation. You can unblock later."
        confirmLabel="Block"
        tone="danger"
        pending={block.pending}
        onConfirm={() => void block.run(true)}
      />
      <ReportDialog open={reporting} onClose={() => setReporting(false)} targetType="conversation" targetId={id} targetLabel="conversation" />
    </>
  );
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
}

function MessageList({ messages, viewerId }: { messages: Message[]; viewerId: string }) {
  const groups = useMemo(() => {
    const out: Array<{ day: string; items: Message[] }> = [];
    for (const m of messages) {
      const day = dayLabel(m.createdAt);
      const last = out.at(-1);
      if (last?.day === day) last.items.push(m);
      else out.push({ day, items: [m] });
    }
    return out;
  }, [messages]);

  if (!messages.length) return <p className="py-8 text-center text-sm text-muted">No messages yet. Say hello.</p>;

  return (
    <ol className="space-y-5">
      {groups.map((g) => (
        <li key={g.day}>
          <p className="mb-3 text-center text-xs text-muted">{g.day}</p>
          <ol className="space-y-2">
            {g.items.map((m) =>
              m.kind === 'system' ? (
                <li key={m.id} className="mx-auto flex max-w-md items-start justify-center gap-2 px-4 py-1 text-center text-xs text-mist">
                  <Icon name="info" size="xs" className="mt-0.5 text-gold" />
                  {m.body}
                </li>
              ) : (
                <li key={m.id} className={cn('flex', m.senderId === viewerId ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[70%]',
                      m.senderId === viewerId ? 'rounded-br-md border border-gold/25 bg-gold/12 text-white' : 'rounded-bl-md bg-charcoal-high text-white',
                    )}
                  >
                    <p className="text-[0.9375rem] leading-relaxed break-words whitespace-pre-wrap">{m.body}</p>
                    <p className={cn('mt-1 text-right text-2xs', m.senderId === viewerId ? 'text-champagne/70' : 'text-muted')}>
                      {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                      {m.localOnly && m.senderId === viewerId && ' · saved here, not delivered'}
                    </p>
                  </div>
                </li>
              ),
            )}
          </ol>
        </li>
      ))}
    </ol>
  );
}

function Composer({ conversationId, onSent }: { conversationId: string; onSent: () => void }) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string>();
  const [toastShown, setToastShown] = useState(false);
  const send = useAction((text: string) => services.messaging.sendMessage(conversationId, text), {
    errorTitle: 'Message not saved',
    onSuccess: () => {
      setBody('');
      if (!toastShown) {
        setToastShown(true);
        onSent();
      }
    },
  });

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const problem = validateMessage(body);
    setError(problem);
    if (!problem && !send.pending) void send.run(body);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={submit} className="border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
      <div className="flex items-end gap-2">
        <label htmlFor={`composer-${conversationId}`} className="sr-only">
          Write a message
        </label>
        <textarea
          id={`composer-${conversationId}`}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (error) setError(undefined);
          }}
          onKeyDown={onKeyDown}
          rows={Math.min(5, Math.max(1, body.split('\n').length))}
          placeholder="Write a message"
          aria-invalid={error ? true : undefined}
          className="max-h-40 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-ink-raised px-4 py-2.5 text-white placeholder:text-muted focus:border-gold focus:ring-2 focus:ring-gold/25 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={send.pending}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-ink transition-colors hover:bg-champagne disabled:opacity-50"
        >
          <Icon name={send.pending ? 'loading' : 'send'} />
        </button>
      </div>
      <div className="mt-1.5 flex justify-between px-1 text-xs">
        {error ? (
          <span className="text-danger" role="alert">
            {error}
          </span>
        ) : (
          <span className="hidden text-muted sm:inline">Enter to send · Shift + Enter for a new line</span>
        )}
        {body.length > LIMITS.message.max * 0.8 && <CharCount value={body} max={LIMITS.message.max} />}
      </div>
    </form>
  );
}
