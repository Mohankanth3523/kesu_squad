import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, ButtonLink, CharCount, EmptyState, Field, Input, Segmented, Textarea, useToast } from '@/components/ui';
import { DetailSkeleton } from '@/components/shared/Skeletons';
import { LIMITS } from '@/domain/constants';
import { hasErrors, validatePost, type PostInput } from '@/domain/validation';
import { useAsync } from '@/hooks/useAsync';
import { paths } from '@/lib/routes';
import { safeStorage } from '@/lib/storage';
import { services } from '@/services';
import { POST_CATEGORIES, type PostCategory } from '@/types/domain';
import { ServiceError, toUserMessage } from '@/types/service';

const DRAFT_KEY = 'ks.postDraft';

/** Create or edit a discussion. New-post drafts are kept in this browser if posting fails. */
export default function PostEditorPage() {
  const { postId } = useParams();
  const editing = Boolean(postId);
  const existing = useAsync(() => services.community.getPost(postId ?? ''), [postId], { live: false, enabled: editing });
  const { user } = useSession();

  return (
    <Container size="narrow" className="pb-16">
      <PageHeader
        title={editing ? 'Edit discussion' : 'Start a discussion'}
        description="Ask a question, share an experience or start a debate."
        above={<ButtonLink to={paths.community} variant="ghost" size="sm" leadingIcon="back">Community</ButtonLink>}
      />
      {!editing ? (
        <PostForm />
      ) : existing.status === 'loading' ? (
        <DetailSkeleton />
      ) : existing.status === 'error' || existing.data.author.id !== user?.id || existing.data.status !== 'published' ? (
        <EmptyState icon="lock" title="You can’t edit this discussion" description="Only the author can edit a discussion, and deleted ones can’t be edited." action={<ButtonLink to={paths.community} size="sm">Back to community</ButtonLink>} />
      ) : (
        <PostForm initial={{ title: existing.data.title, body: existing.data.body, category: existing.data.category }} postId={existing.data.id} />
      )}
    </Container>
  );
}

function PostForm({ initial, postId }: { initial?: PostInput; postId?: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const videoId = params.get('video') ?? undefined;
  const [form, setForm] = useState<PostInput>(() => {
    if (initial) return initial;
    try {
      const draft = safeStorage.get(DRAFT_KEY);
      if (draft) return JSON.parse(draft) as PostInput;
    } catch {
      /* ignore broken draft */
    }
    return { title: '', body: '', category: videoId ? 'Videos' : '' };
  });
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!postId) safeStorage.set(DRAFT_KEY, JSON.stringify(form));
  }, [form, postId]);

  const errors = validatePost(form);
  const err = (k: keyof PostInput) => serverErrors[k] || (touched ? errors[k] : undefined);
  const update = (patch: Partial<PostInput>) => {
    setForm((f) => ({ ...f, ...patch }));
    setServerErrors({});
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors(errors)) return;
    setPending(true);
    try {
      const input = { title: form.title, body: form.body, category: form.category as PostCategory };
      const saved = postId ? await services.community.updatePost(postId, input) : await services.community.createPost({ ...input, videoId });
      if (!postId) safeStorage.remove(DRAFT_KEY);
      toast.success(postId ? 'Changes saved' : 'Discussion posted', postId ? undefined : 'Prototype: visible in this browser only.');
      navigate(paths.post(saved.id));
    } catch (error) {
      if (error instanceof ServiceError && error.fieldErrors) setServerErrors(error.fieldErrors);
      else toast.error(postId ? 'Changes not saved' : 'Discussion not posted', `${toUserMessage(error)} Your draft is kept.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-white">
          Category<span className="ml-1 text-gold" aria-hidden="true">*</span>
        </span>
        <Segmented label="Category" value={form.category} onChange={(c) => update({ category: c })} options={POST_CATEGORIES.map((c) => ({ value: c, label: c }))} />
        {err('category') && (
          <p className="text-sm text-danger" role="alert">
            {err('category')}
          </p>
        )}
      </div>
      <Field label="Title" required error={err('title')} hint={<CharCount value={form.title} max={LIMITS.postTitle.max} />}>
        {(p) => <Input {...p} value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="What’s on your mind?" />}
      </Field>
      <Field label="Post" required error={err('body')} hint={<span className="flex justify-between gap-3"><span>Links become clickable. No phone numbers or addresses, please.</span><CharCount value={form.body} max={LIMITS.postBody.max} /></span>}>
        {(p) => <Textarea {...p} rows={9} value={form.body} onChange={(e) => update({ body: e.target.value })} />}
      </Field>
      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={() => navigate(-1)} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" size="lg" loading={pending}>
          {postId ? 'Save changes' : 'Post discussion'}
        </Button>
      </div>
    </form>
  );
}
