import { Link } from 'react-router';
import { Badge, Icon } from '@/components/ui';
import { relativeTime } from '@/lib/format';
import { paths } from '@/lib/routes';
import type { PostSummary } from '@/types/domain';
import { UpvoteButton } from './UpvoteButton';

/** Discussion row: vote column + title, Reddit-style but quieter. */
export function PostRow({ post, interactive = true }: { post: PostSummary; interactive?: boolean }) {
  return (
    <li className="group relative flex gap-3 border-b border-line py-5 last:border-b-0 sm:gap-4">
      {interactive ? (
        <UpvoteButton target="post" id={post.id} score={post.score} voted={post.viewerHasUpvoted} authorId={post.author.id} />
      ) : (
        <div className="flex w-12 shrink-0 flex-col items-center pt-1.5 text-gold" aria-label={`${post.score} upvotes`}>
          <Icon name="upvote" />
          <span className="text-sm font-semibold tabular-nums text-white">{post.score}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <Badge tone="outline">{post.category}</Badge>
          <span>{post.author.displayName}</span>
          <span>{relativeTime(post.createdAt)}</span>
        </div>
        <h3 className="text-[1.0625rem] leading-snug font-medium text-white group-hover:text-champagne">
          <Link to={paths.post(post.id)} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-mist">{post.excerpt}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
          <Icon name="comment" size="sm" />
          {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
        </p>
      </div>
    </li>
  );
}
