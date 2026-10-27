import { useState } from 'react';
import { useSession } from '@/app/providers/session-context';
import { Avatar, Button, ConfirmDialog, Icon, useToast } from '@/components/ui';
import { RichText } from '@/components/shared/RichText';
import { ReportDialog } from '@/components/shared/ReportDialog';
import { LIMITS } from '@/domain/constants';
import { useAction } from '@/hooks/useAction';
import { cn } from '@/lib/cn';
import { relativeTime } from '@/lib/format';
import { services } from '@/services';
import type { CommentNode } from '@/types/domain';
import { CommentComposer } from './CommentComposer';
import { UpvoteButton } from './UpvoteButton';

/** Threaded comments. Deeper than five levels, replies continue at the fifth level so phones stay readable. */
export function CommentThread({ comments, postId, onNeedLogin }: { comments: CommentNode[]; postId: string; onNeedLogin: () => void }) {
  return (
    <ul className="space-y-1">
      {comments.map((c) => (
        <CommentItem key={c.id} node={c} depth={0} postId={postId} onNeedLogin={onNeedLogin} />
      ))}
    </ul>
  );
}

function CommentItem({ node, depth, postId, onNeedLogin }: { node: CommentNode; depth: number; postId: string; onNeedLogin: () => void }) {
  const { user } = useSession();
  const toast = useToast();
  const [replying, setReplying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reporting, setReporting] = useState(false);
  const removed = node.status !== 'published';
  const mine = !removed && user?.id === node.author.id;
  const del = useAction(services.community.deleteComment, {
    errorTitle: 'Comment not deleted',
    onSuccess: () => {
      setConfirmDelete(false);
      toast.success('Comment deleted');
    },
  });
  const nested = depth < LIMITS.maxCommentDepth - 1;
  const replyCount = countReplies(node);

  return (
    <li className={cn(depth > 0 && 'border-l border-line pl-3 sm:pl-5')}>
      <article className="py-3" aria-label={removed ? 'Deleted comment' : `Comment by ${node.author.displayName}`}>
        <header className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
          {!removed && <Avatar name={node.author.displayName} size="sm" />}
          <span className={removed ? 'text-muted italic' : 'font-medium text-white'}>{removed ? 'Deleted comment' : node.author.displayName}</span>
          <span className="text-muted">{relativeTime(node.createdAt)}</span>
          {node.editedAt && <span className="text-muted">(edited)</span>}
          {node.replies.length > 0 && (
            <button type="button" onClick={() => setCollapsed((v) => !v)} className="ml-auto text-xs text-muted hover:text-white" aria-expanded={!collapsed}>
              {collapsed ? `Show ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : 'Hide replies'}
            </button>
          )}
        </header>
        {removed ? (
          <p className="mt-1.5 text-sm text-muted italic">[deleted]</p>
        ) : (
          <>
            <RichText text={node.body} className="mt-1.5 text-[0.9375rem] leading-relaxed text-mist" />
            <div className="mt-1.5 -ml-2.5 flex flex-wrap items-center gap-1 text-sm">
              <UpvoteButton target="comment" id={node.id} score={node.score} voted={node.viewerHasUpvoted} authorId={node.author.id} layout="inline" />
              <Button
                size="sm"
                variant="ghost"
                leadingIcon="comment"
                className="h-8 px-2.5"
                onClick={() => (user && !user.isGuest ? setReplying((v) => !v) : onNeedLogin())}
                aria-expanded={replying}
              >
                Reply
              </Button>
              {mine ? (
                <Button size="sm" variant="ghost" leadingIcon="delete" className="h-8 px-2.5" onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
              ) : (
                <Button size="sm" variant="ghost" leadingIcon="flag" className="h-8 px-2.5" onClick={() => setReporting(true)}>
                  Report
                </Button>
              )}
            </div>
          </>
        )}
        {replying && (
          <div className="mt-2">
            <CommentComposer postId={postId} parentId={node.id} autoFocus placeholder={`Reply to ${node.author.displayName}`} submitLabel="Reply" onDone={() => setReplying(false)} />
          </div>
        )}
      </article>

      {!collapsed && node.replies.length > 0 && (
        <ul>
          {node.replies.map((r) =>
            nested ? (
              <CommentItem key={r.id} node={r} depth={depth + 1} postId={postId} onNeedLogin={onNeedLogin} />
            ) : (
              // At max depth, flatten further replies to this level.
              <FlatReplies key={r.id} node={r} postId={postId} onNeedLogin={onNeedLogin} />
            ),
          )}
        </ul>
      )}
      {collapsed && <p className="pb-2 text-xs text-muted"><Icon name="comment" size="xs" className="mr-1 inline" />{replyCount} hidden</p>}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this comment?"
        description={node.replies.length ? 'Replies stay visible; your comment will show as deleted.' : 'This can’t be undone.'}
        confirmLabel="Delete comment"
        tone="danger"
        pending={del.pending}
        onConfirm={() => void del.run(node.id)}
      />
      <ReportDialog open={reporting} onClose={() => setReporting(false)} targetType="comment" targetId={node.id} targetLabel="comment" />
    </li>
  );
}

function FlatReplies({ node, postId, onNeedLogin }: { node: CommentNode; postId: string; onNeedLogin: () => void }) {
  const flat: CommentNode[] = [];
  const walk = (n: CommentNode) => {
    flat.push({ ...n, replies: [] });
    n.replies.forEach(walk);
  };
  walk(node);
  return (
    <>
      {flat.map((n) => (
        <CommentItem key={n.id} node={n} depth={LIMITS.maxCommentDepth} postId={postId} onNeedLogin={onNeedLogin} />
      ))}
    </>
  );
}

function countReplies(n: CommentNode): number {
  return n.replies.reduce((sum, r) => sum + 1 + countReplies(r), 0);
}
