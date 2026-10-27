import { useState, type FormEvent } from 'react';
import { Button, CharCount, Textarea } from '@/components/ui';
import { LIMITS } from '@/domain/constants';
import { validateComment } from '@/domain/validation';
import { useAction } from '@/hooks/useAction';
import { services } from '@/services';

export function CommentComposer({
  postId,
  parentId,
  autoFocus,
  onDone,
  placeholder = 'Add to the discussion',
  submitLabel = 'Comment',
}: {
  postId: string;
  parentId: string | null;
  autoFocus?: boolean;
  onDone?: () => void;
  placeholder?: string;
  submitLabel?: string;
}) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string>();
  const add = useAction(services.community.addComment, {
    errorTitle: 'Comment not posted',
    onSuccess: () => {
      setBody('');
      onDone?.();
    },
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    const problem = validateComment(body);
    setError(problem);
    if (!problem) void add.run({ postId, parentId, body });
  }

  const fieldError = error ?? add.fieldErrors.body;
  return (
    <form onSubmit={submit} noValidate className="space-y-2">
      <label className="sr-only" htmlFor={`compose-${parentId ?? postId}`}>
        {parentId ? 'Write a reply' : 'Write a comment'}
      </label>
      <Textarea
        id={`compose-${parentId ?? postId}`}
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (error) setError(undefined);
        }}
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
        aria-invalid={fieldError ? true : undefined}
        aria-describedby={fieldError ? `compose-${parentId ?? postId}-err` : undefined}
      />
      <div className="flex items-center justify-between gap-3">
        {fieldError ? (
          <p id={`compose-${parentId ?? postId}-err`} className="text-sm text-danger" role="alert">
            {fieldError}
          </p>
        ) : (
          <CharCount value={body} max={LIMITS.comment.max} />
        )}
        <div className="flex gap-2">
          {onDone && parentId && (
            <Button size="sm" variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" loading={add.pending}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
