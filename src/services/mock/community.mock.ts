import { validateComment, validatePost } from '@/domain/validation';
import type { DbComment } from '@/data/schema';
import type { CommentNode } from '@/types/domain';
import { ServiceError } from '@/types/service';
import type { CommunityService } from '../interfaces';
import { toComment, toPost, toPostSummary, matchesQuery } from './mappers';
import { mockDb, newId, nowIso } from './mockDb';
import { command, forbidden, invalid, notFound, query } from './mockUtils';
import { currentUserId, requireMember } from './session';

const HOUR = 3_600_000;

/** Trending: score decayed by age (OQ-14 default). */
function trendingRank(score: number, createdAt: string) {
  const hours = (Date.now() - new Date(createdAt).getTime()) / HOUR;
  return score / Math.pow(hours + 2, 1.5);
}

function rateLimit(count: number, max: number, what: string) {
  if (count >= max) throw new ServiceError('rate_limited', `You’ve reached the limit for ${what}. Try again later.`);
}

export const mockCommunity: CommunityService = {
  listPosts: ({ sort = 'popular', category, q, authorId, limit = 20, offset = 0 } = {}) =>
    query(
      'community.listPosts',
      () => {
        const db = mockDb.read();
        const viewer = currentUserId();
        const all = db.posts
          .filter((p) => p.status === 'published')
          .filter((p) => !category || p.category === category)
          .filter((p) => !authorId || p.authorId === authorId)
          .filter((p) => matchesQuery(q, p.title, p.body, p.category))
          .map((p) => toPostSummary(db, p, viewer));
        const sorted =
          sort === 'recent'
            ? all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            : sort === 'trending'
              ? all.sort((a, b) => trendingRank(b.score, b.createdAt) - trendingRank(a.score, a.createdAt))
              : all.sort((a, b) => b.score - a.score);
        return { items: sorted.slice(offset, offset + limit), total: sorted.length };
      },
      { items: [], total: 0 },
    ),

  getPost: (id) =>
    query('community.getPost', () => {
      const db = mockDb.read();
      const p = db.posts.find((x) => x.id === id);
      if (!p || p.status === 'removed_by_moderator') notFound('This discussion');
      return toPost(db, p, currentUserId());
    }),

  createPost: (input) =>
    command('community.createPost', () => {
      const me = requireMember();
      const errors = validatePost(input);
      if (Object.values(errors).some(Boolean)) invalid('Check the highlighted fields.', errors);
      const db = mockDb.read();
      rateLimit(db.posts.filter((p) => p.authorId === me.id && Date.now() - new Date(p.createdAt).getTime() < HOUR).length, 10, 'new posts this hour');
      const post = mockDb.write((d) => {
        const p = { id: newId('p'), authorId: me.id, title: input.title.trim(), body: input.body.trim(), category: input.category, videoId: input.videoId, createdAt: nowIso(), status: 'published' as const, baseScore: 0 };
        d.posts.push(p);
        return p;
      });
      return toPost(mockDb.read(), post, me.id);
    }),

  updatePost: (id, input) =>
    command('community.updatePost', () => {
      const me = requireMember();
      const errors = validatePost(input);
      if (Object.values(errors).some(Boolean)) invalid('Check the highlighted fields.', errors);
      const existing = mockDb.read().posts.find((p) => p.id === id && p.status === 'published') ?? notFound('This discussion');
      if (existing.authorId !== me.id) forbidden('You can only edit your own posts.');
      const post = mockDb.write((d) => {
        const p = d.posts.find((x) => x.id === id)!;
        Object.assign(p, { title: input.title.trim(), body: input.body.trim(), category: input.category, editedAt: nowIso() });
        return p;
      });
      return toPost(mockDb.read(), post, me.id);
    }),

  deletePost: (id) =>
    command('community.deletePost', () => {
      const me = requireMember();
      const existing = mockDb.read().posts.find((p) => p.id === id) ?? notFound('This discussion');
      if (existing.authorId !== me.id) forbidden('You can only delete your own posts.');
      mockDb.write((d) => {
        d.posts.find((x) => x.id === id)!.status = 'removed_by_author';
      });
    }),

  listComments: (postId) =>
    query(
      'community.listComments',
      () => {
        const db = mockDb.read();
        const viewer = currentUserId();
        const rows = db.comments.filter((c) => c.postId === postId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        const nodes = new Map<string, CommentNode>(rows.map((c) => [c.id, { ...toComment(db, c, viewer), replies: [] }]));
        const roots: CommentNode[] = [];
        for (const c of rows) {
          const node = nodes.get(c.id)!;
          const parent = c.parentId ? nodes.get(c.parentId) : undefined;
          if (parent) parent.replies.push(node);
          else roots.push(node);
        }
        // Removed comments with no replies disappear entirely.
        const prune = (list: CommentNode[]): CommentNode[] =>
          list.map((n) => ({ ...n, replies: prune(n.replies) })).filter((n) => n.status === 'published' || n.replies.length > 0);
        return prune(roots);
      },
      [],
    ),

  addComment: ({ postId, parentId, body }) =>
    command('community.addComment', () => {
      const me = requireMember();
      const error = validateComment(body);
      if (error) invalid(error, { body: error });
      const db = mockDb.read();
      const post = db.posts.find((p) => p.id === postId && p.status === 'published') ?? notFound('This discussion');
      if (parentId && !db.comments.some((c) => c.id === parentId && c.postId === post.id)) notFound('The comment you’re replying to');
      rateLimit(db.comments.filter((c) => c.authorId === me.id && Date.now() - new Date(c.createdAt).getTime() < HOUR).length, 60, 'comments this hour');
      const created: DbComment = mockDb.write((d) => {
        const c: DbComment = { id: newId('c'), postId, parentId, authorId: me.id, body: body.trim(), createdAt: nowIso(), status: 'published', baseScore: 0 };
        d.comments.push(c);
        return c;
      });
      return toComment(mockDb.read(), created, me.id);
    }),

  deleteComment: (id) =>
    command('community.deleteComment', () => {
      const me = requireMember();
      const existing = mockDb.read().comments.find((c) => c.id === id) ?? notFound('This comment');
      if (existing.authorId !== me.id) forbidden('You can only delete your own comments.');
      mockDb.write((d) => {
        const hasReplies = d.comments.some((c) => c.parentId === id);
        if (hasReplies) d.comments.find((c) => c.id === id)!.status = 'removed_by_author';
        else d.comments = d.comments.filter((c) => c.id !== id);
      });
    }),

  toggleUpvote: (target, id) =>
    command('community.toggleUpvote', () => {
      const me = requireMember();
      const db = mockDb.read();
      const record = target === 'post' ? db.posts.find((p) => p.id === id) : db.comments.find((c) => c.id === id);
      if (!record || record.status !== 'published') notFound(target === 'post' ? 'This discussion' : 'This comment');
      if (record.authorId === me.id) invalid('You can’t upvote your own ' + target + '.'); // OQ-13 default
      const result = mockDb.write((d) => {
        const i = d.votes.findIndex((v) => v.userId === me.id && v.targetType === target && v.targetId === id);
        if (i >= 0) d.votes.splice(i, 1);
        else d.votes.push({ userId: me.id, targetType: target, targetId: id });
        return i < 0;
      });
      const fresh = mockDb.read();
      const votes = fresh.votes.filter((v) => v.targetType === target && v.targetId === id).length;
      return { score: record.baseScore + votes, viewerHasUpvoted: result };
    }),
};
