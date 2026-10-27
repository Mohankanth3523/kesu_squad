import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Badge, Button, ButtonLink, Card, CharCount, EmptyState, Field, Icon, Textarea } from '@/components/ui';
import { IdentityPrompt } from '@/components/shared/IdentityPrompt';
import { Loadable } from '@/components/shared/Loadable';
import { ListSkeleton } from '@/components/shared/Skeletons';
import { LIMITS } from '@/domain/constants';
import { validateAmaQuestion } from '@/domain/validation';
import { useAction } from '@/hooks/useAction';
import { useAsync } from '@/hooks/useAsync';
import { relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { AmaQuestion, AmaStatus } from '@/types/domain';
import { AMA_ANSWER_LABEL, AMA_STATUS_LABEL } from '@/types/labels';

const STATUS_TONE: Record<AmaStatus, 'info' | 'gold' | 'success' | 'outline'> = {
  submitted: 'info',
  selected: 'gold',
  answered: 'success',
  not_selected: 'outline',
};

/** Ask Me Anything (C2 §2): questions for the creator, answered in videos, Shorts or posts. */
export default function AmaPage() {
  const { user } = useSession();
  const answered = useAsync(() => services.ama.listAnswered());
  const mine = useAsync(() => services.ama.listMine(), [user?.id]);

  return (
    <Container className="pb-16">
      <PageHeader
        title="Ask me anything"
        description="Ask the creator behind Kesh Squad anything — college, content, books or life. Picked questions get answered in future videos, Shorts or posts."
        above={<ButtonLink to={paths.community} variant="ghost" size="sm" leadingIcon="back">Community</ButtonLink>}
      />
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="answered" className="min-w-0">
          <h2 id="answered" className="font-display text-[1.75rem] text-white">
            Answered questions
          </h2>
          <div className="mt-4">
            <Loadable
              query={answered}
              skeleton={<ListSkeleton rows={4} />}
              isEmpty={(d) => d.length === 0}
              empty={<EmptyState icon="ama" title="No answers yet" description="Answered questions will appear here." />}
            >
              {(list) => (
                <ol className="space-y-4">
                  {list.map((q) => (
                    <AnsweredItem key={q.id} q={q} />
                  ))}
                </ol>
              )}
            </Loadable>
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <AskForm />
          {user && (
            <section aria-labelledby="mine">
              <h2 id="mine" className="font-medium text-white">
                Your questions
              </h2>
              <div className="mt-3">
                <Loadable
                  query={mine}
                  skeleton={<ListSkeleton rows={2} compact />}
                  isEmpty={(d) => d.length === 0}
                  empty={<p className="text-sm text-muted">You haven’t asked anything yet.</p>}
                  compactError
                >
                  {(list) => (
                    <ul className="space-y-3">
                      {list.map((q) => (
                        <li key={q.id} className="rounded-[var(--radius-field)] border border-line p-3">
                          <p className="text-sm text-white">{q.body}</p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <Badge tone={STATUS_TONE[q.status]}>{AMA_STATUS_LABEL[q.status]}</Badge>
                            <span className="text-xs text-muted">{relativeTime(q.createdAt)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Loadable>
              </div>
            </section>
          )}
        </aside>
      </div>
    </Container>
  );
}

function AnsweredItem({ q }: { q: AmaQuestion }) {
  const link = q.answerVideoId ? paths.video(q.answerVideoId) : q.answerPostId ? paths.post(q.answerPostId) : undefined;
  return (
    <li>
      <Card>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Avatar name={q.asker.displayName} size="sm" />
          <span className="text-white">{q.asker.displayName}</span> asked · {relativeTime(q.createdAt)}
        </div>
        <p className="mt-3 font-display text-xl leading-snug text-white">“{q.body}”</p>
        <div className="mt-4 border-l-2 border-gold/60 pl-4">
          <p className="text-sm font-medium text-champagne">{q.answerType ? AMA_ANSWER_LABEL[q.answerType] : 'Answered'}</p>
          {q.answerText && <p className="mt-1 text-mist">{q.answerText}</p>}
          {link && (
            <Link to={link} className="mt-2 inline-flex items-center gap-1.5 text-sm text-gold hover:text-champagne hover:underline">
              <Icon name={q.answerVideoId ? 'play' : 'comment'} size="sm" />
              {q.answerVideoId ? 'Watch the answer' : 'Read the answer'}
            </Link>
          )}
        </div>
      </Card>
    </li>
  );
}

function AskForm() {
  const { user } = useSession();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string>();
  const [prompt, setPrompt] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = useAction(services.ama.submit, {
    errorTitle: 'Question not sent',
    onSuccess: () => {
      setBody('');
      setSent(true);
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return setPrompt(true);
    const problem = validateAmaQuestion(body);
    setError(problem);
    if (!problem) void submit.run(body);
  }

  return (
    <Card tone="gold">
      <h2 className="font-display text-2xl text-white">Ask a question</h2>
      {sent ? (
        <div className="mt-3" role="status">
          <p className="inline-flex items-center gap-2 text-success">
            <Icon name="success" size="sm" />
            Question sent
          </p>
          <p className="mt-1 text-sm text-mist">You’ll see its status under “Your questions”. Prototype: stored in this browser.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => setSent(false)}>
            Ask another
          </Button>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="mt-4 space-y-3">
          <Field label="Your question" hideLabel error={error ?? submit.fieldErrors.body} hint={<CharCount value={body} max={LIMITS.amaQuestion.max} />}>
            {(p) => <Textarea {...p} rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What do you wish you knew in first year?" />}
          </Field>
          <Button type="submit" className="w-full" loading={submit.pending}>
            Send question
          </Button>
          <p className="text-xs text-muted">Up to {LIMITS.amaPerDay} questions a day. Not every question can be answered.</p>
        </form>
      )}
      <IdentityPrompt open={prompt} onClose={() => setPrompt(false)} title="Ask a question" description="Log in, or continue as a guest, so you can follow your question’s status." />
    </Card>
  );
}
