import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { Container } from '@/components/layout/Container';
import { Avatar, Badge, Button, ButtonLink, ConfirmDialog, EmptyState, ErrorState, useToast } from '@/components/ui';
import { IdentityPrompt } from '@/components/shared/IdentityPrompt';
import { Loadable } from '@/components/shared/Loadable';
import { ReportDialog } from '@/components/shared/ReportDialog';
import { RichText } from '@/components/shared/RichText';
import { DetailSkeleton, ListSkeleton } from '@/components/shared/Skeletons';
import { CommentComposer } from '@/features/community/CommentComposer';
import { CommentThread } from '@/features/community/CommentThread';
import { UpvoteButton } from '@/features/community/UpvoteButton';
import { useAction } from '@/hooks/useAction';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import { services } from '@/services';
import type { Post } from '@/types/domain';

export default function PostDetailPage() {
  const { postId = '' } = useParams();
  const post = useAsync(() => services.community.getPost(postId), [postId]);
  useDocumentTitle(post.status === 'success' ? post.data.title : 'Discussion');

  return (
    <Container size="narrow" className="pb-16">
      <div className="pt-6">
        <ButtonLink to={paths.community} variant="ghost" size="sm" leadingIcon="back">
          Community
        </ButtonLink>
      </div>
      <Loadable
        query={post}
        skeleton={<DetailSkeleton />}
        notFound={{ title: 'Discussion not found', description: 'It may have been removed.', backTo: paths.community, backLabel: 'Back to community' }}
      >
        {(p) =>
          p.status !== 'published' ? (
            <EmptyState icon="community" title="This discussion was deleted" description="The author removed it." action={<ButtonLink to={paths.community} size="sm">Back to community</ButtonLink>} className="my-10" />
          ) : (
            <PostView post={p} />
          )
        }
      </Loadable>
    </Container>
  );
}

function PostView({ post }: { post: Post }) {
  const { user } = useSession();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const comments = useAsync(() => services.community.listComments(post.id), [post.id]);
  const mine = user?.id === post.author.id;
  const canComment = Boolean(user && !user.isGuest);
  const del = useAction(services.community.deletePost, {
    errorTitle: 'Discussion not deleted',
    onSuccess: () => {
      toast.success('Discussion deleted');
      navigate(paths.community);
    },
  });

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: post.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
    } catch {
      /* user cancelled share */
    }
  }

  return (
    <>
      <article className="pt-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
          <Badge tone="outline">{post.category}</Badge>
          <Link to={paths.profile(post.author.displayName)} className="inline-flex items-center gap-2 text-white hover:text-champagne">
            <Avatar name={post.author.displayName} size="sm" />
            {post.author.displayName}
          </Link>
          <span>{relativeTime(post.createdAt)}</span>
          {post.editedAt && <span>(edited)</span>}
        </div>
        <h1 className="mt-4 font-display text-[clamp(1.875rem,4vw,2.5rem)] leading-tight text-white">{post.title}</h1>
        {post.videoId && (
          <Link to={paths.video(post.videoId)} className="mt-3 inline-flex items-center gap-1.5 text-sm text-gold hover:text-champagne hover:underline">
            Discussing a video — watch it
          </Link>
        )}
        <RichText text={post.body} className="mt-5 text-[1.0625rem] leading-relaxed text-mist" />

        <div className="mt-6 flex flex-wrap items-center gap-2 border-y border-line py-3">
          <UpvoteButton target="post" id={post.id} score={post.score} voted={post.viewerHasUpvoted} authorId={post.author.id} layout="inline" />
          <span className="px-2 text-sm text-muted">{post.commentCount} comments</span>
          <span className="flex-1" />
          <Button variant="ghost" size="sm" leadingIcon="external" onClick={share}>
            Share
          </Button>
          {mine ? (
            <>
              <ButtonLink to={paths.editPost(post.id)} variant="ghost" size="sm" leadingIcon="edit">
                Edit
              </ButtonLink>
              <Button variant="ghost" size="sm" leadingIcon="delete" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" leadingIcon="flag" onClick={() => setReporting(true)}>
              Report
            </Button>
          )}
        </div>
      </article>

      <section aria-labelledby="comments-heading" className="mt-8">
        <h2 id="comments-heading" className="font-display text-2xl text-white">
          Comments
        </h2>
        <div className="mt-4">
          {canComment ? (
            <CommentComposer postId={post.id} parentId={null} />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-field)] border border-line p-4">
              <p className="text-sm text-mist">{user?.isGuest ? 'Guests can read discussions. Create an account to comment.' : 'Log in to join the discussion.'}</p>
              <Button size="sm" onClick={() => setNeedLogin(true)}>
                {user?.isGuest ? 'Create an account' : 'Log in to comment'}
              </Button>
            </div>
          )}
        </div>
        <div className="mt-6">
          {comments.status === 'loading' && <ListSkeleton rows={3} compact />}
          {comments.status === 'error' && <ErrorState error={comments.error} onRetry={comments.retry} compact />}
          {comments.status === 'success' &&
            (comments.data.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No comments yet. Start the conversation.</p>
            ) : (
              <CommentThread comments={comments.data} postId={post.id} onNeedLogin={() => setNeedLogin(true)} />
            ))}
        </div>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this discussion?"
        description="It will be removed for everyone. This can’t be undone."
        confirmLabel="Delete discussion"
        tone="danger"
        pending={del.pending}
        onConfirm={() => void del.run(post.id)}
      />
      <ReportDialog open={reporting} onClose={() => setReporting(false)} targetType="post" targetId={post.id} targetLabel="discussion" />
      <IdentityPrompt open={needLogin} onClose={() => setNeedLogin(false)} title="Join the discussion" description="Comments, replies and upvotes need a Kesh Squad account." allowGuest={false} />
    </>
  );
}
