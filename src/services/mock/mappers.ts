import type { DbComment, DbDonationListing, DbDonationRequest, DbPost, DbSaleListing, MockDatabase } from '@/data/schema';
import type {
  Comment,
  DonationListing,
  DonationRequest,
  Post,
  PostSummary,
  PublicProfile,
  SaleListing,
} from '@/types/domain';

/** Joins normalised records into the domain shapes the UI expects (what SQL views/joins will do). */
export function profileOf(db: MockDatabase, userId: string): PublicProfile {
  const u = db.users.find((x) => x.id === userId);
  return u ? { id: u.id, displayName: u.displayName, course: u.course } : { id: userId, displayName: 'Deleted member' };
}

export function voteCount(db: MockDatabase, targetType: 'post' | 'comment', targetId: string) {
  return db.votes.filter((v) => v.targetType === targetType && v.targetId === targetId).length;
}

export function hasVoted(db: MockDatabase, viewerId: string | null, targetType: 'post' | 'comment', targetId: string) {
  return Boolean(viewerId && db.votes.some((v) => v.userId === viewerId && v.targetType === targetType && v.targetId === targetId));
}

export function excerptOf(body: string, max = 180): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

export function toPostSummary(db: MockDatabase, p: DbPost, viewerId: string | null): PostSummary {
  return {
    id: p.id,
    title: p.title,
    excerpt: excerptOf(p.body),
    category: p.category,
    author: profileOf(db, p.authorId),
    score: p.baseScore + voteCount(db, 'post', p.id),
    commentCount: db.comments.filter((c) => c.postId === p.id && c.status === 'published').length,
    createdAt: p.createdAt,
    editedAt: p.editedAt,
    videoId: p.videoId,
    viewerHasUpvoted: hasVoted(db, viewerId, 'post', p.id),
  };
}

export function toPost(db: MockDatabase, p: DbPost, viewerId: string | null): Post {
  return { ...toPostSummary(db, p, viewerId), body: p.body, status: p.status };
}

export function toComment(db: MockDatabase, c: DbComment, viewerId: string | null): Comment {
  const removed = c.status !== 'published';
  return {
    id: c.id,
    postId: c.postId,
    parentId: c.parentId,
    author: removed ? { id: '', displayName: '[deleted]' } : profileOf(db, c.authorId),
    body: removed ? '' : c.body,
    score: c.baseScore + voteCount(db, 'comment', c.id),
    createdAt: c.createdAt,
    editedAt: c.editedAt,
    status: c.status,
    viewerHasUpvoted: hasVoted(db, viewerId, 'comment', c.id),
  };
}

export function toSaleListing(db: MockDatabase, l: DbSaleListing): SaleListing {
  return {
    ...l,
    photos: l.photos,
    owner: profileOf(db, l.ownerId),
    interestCount: db.conversations.filter((c) => c.listingId === l.id).length,
  };
}

export function toDonationListing(db: MockDatabase, l: DbDonationListing): DonationListing {
  return {
    ...l,
    owner: profileOf(db, l.ownerId),
    requestCount: db.donationRequests.filter((r) => r.listingId === l.id && (r.status === 'pending' || r.status === 'accepted')).length,
  };
}

export function toDonationRequest(db: MockDatabase, r: DbDonationRequest): DonationRequest {
  const listing = db.listings.find((l) => l.id === r.listingId);
  return {
    id: r.id,
    listingId: r.listingId,
    listingTitle: listing?.title ?? 'Removed listing',
    donor: profileOf(db, listing?.ownerId ?? ''),
    requester: profileOf(db, r.requesterId),
    conversationId: r.conversationId,
    message: r.message,
    booksRequested: r.booksRequested,
    status: r.status,
    agreedCourierCharge: r.agreedCourierCharge,
    donorCoversShipping: r.donorCoversShipping,
    createdAt: r.createdAt,
    acceptedAt: r.acceptedAt,
    donorConfirmedAt: r.donorConfirmedAt,
    recipientConfirmedAt: r.recipientConfirmedAt,
    completedAt: r.completedAt,
    cancelledAt: r.cancelledAt,
  };
}

/** Case-insensitive match of every word in `q` against the given fields. */
export function matchesQuery(q: string | undefined, ...fields: Array<string | undefined>): boolean {
  if (!q?.trim()) return true;
  const hay = fields.filter(Boolean).join(' ').toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
}
