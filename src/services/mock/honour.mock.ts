import { badgesFor } from '@/domain/constants';
import type { MockDatabase } from '@/data/schema';
import type { DonorStanding } from '@/types/domain';
import type { HonourService } from '../interfaces';
import { profileOf, toDonationListing, toSaleListing } from './mappers';
import { mockDb } from './mockDb';
import { notFound, query } from './mockUtils';

/**
 * Ranking (C1 §5): one point per completed book; only completed donations count.
 * Ties: whoever reached the total first ranks higher (OQ-34 default).
 */
function standings(db: MockDatabase): DonorStanding[] {
  const totals = new Map<string, { books: number; last: string }>();
  for (const c of db.completions) {
    const t = totals.get(c.donorId) ?? { books: 0, last: '' };
    t.books += c.booksCount;
    if (c.completedAt > t.last) t.last = c.completedAt;
    totals.set(c.donorId, t);
  }
  return [...totals.entries()]
    .filter(([id]) => db.users.find((u) => u.id === id)?.showOnHonourBoard)
    .sort(([, a], [, b]) => b.books - a.books || a.last.localeCompare(b.last))
    .map(([id, t], i) => ({ rank: i + 1, donor: profileOf(db, id), booksDonated: t.books, badges: badgesFor(t.books), lastDonationAt: t.last }));
}

export const mockHonour: HonourService = {
  listStandings: ({ limit } = {}) => query('honour.listStandings', () => standings(mockDb.read()).slice(0, limit), []),
  getMemberProfile: (displayName) =>
    query('honour.getMemberProfile', () => {
      const db = mockDb.read();
      const user = db.users.find((u) => u.displayName.toLowerCase() === displayName.toLowerCase() && !u.isGuest);
      if (!user) notFound('This member');
      const books = db.completions.filter((c) => c.donorId === user.id).reduce((n, c) => n + c.booksCount, 0);
      const rank = standings(db).find((s) => s.donor.id === user.id)?.rank ?? null;
      const activeListings = db.listings
        .filter((l) => l.ownerId === user.id && (l.status === 'available' || l.status === 'reserved'))
        .map((l) => (l.type === 'sale' ? toSaleListing(db, l) : toDonationListing(db, l)));
      return {
        profile: profileOf(db, user.id),
        joinedAt: user.joinedAt,
        booksDonated: books,
        rank: user.showOnHonourBoard ? rank : null,
        badges: badgesFor(books),
        showOnHonourBoard: user.showOnHonourBoard,
        activeListings,
      };
    }),
};
