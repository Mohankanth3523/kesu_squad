import type { ReportsService, SearchService } from '../interfaces';
import { matchesQuery, toDonationListing, toPostSummary, toSaleListing } from './mappers';
import { mockDb, newId, nowIso } from './mockDb';
import { command, invalid, query } from './mockUtils';
import { currentUserId, requireIdentity } from './session';

export const mockSearch: SearchService = {
  searchAll: (q) =>
    query(
      'search.searchAll',
      () => {
        const db = mockDb.read();
        const viewer = currentUserId();
        if (!q.trim()) return { books: [], donations: [], posts: [], videos: [] };
        const listings = db.listings.filter((l) => l.status === 'available' || l.status === 'reserved');
        return {
          books: listings.flatMap((l) => (l.type === 'sale' && matchesQuery(q, l.title, l.author, l.subject, l.course.join(' ')) ? [toSaleListing(db, l)] : [])),
          donations: listings.flatMap((l) => (l.type === 'donation' && matchesQuery(q, l.title, l.author, l.subject, l.course.join(' ')) ? [toDonationListing(db, l)] : [])),
          posts: db.posts.filter((p) => p.status === 'published' && matchesQuery(q, p.title, p.body, p.category)).map((p) => toPostSummary(db, p, viewer)),
          videos: db.videos.filter((v) => matchesQuery(q, v.title, v.description)),
        };
      },
      { books: [], donations: [], posts: [], videos: [] },
    ),
};

export const mockReports: ReportsService = {
  submit: (input) =>
    command('reports.submit', () => {
      const me = requireIdentity();
      if (input.details && input.details.length > 1000) invalid('Keep the details under 1,000 characters.', { details: 'Keep the details under 1,000 characters.' });
      mockDb.write((d) => {
        // One report per person per item (duplicate reports are ignored).
        if (d.reports.some((r) => r.reporterId === me.id && r.targetType === input.targetType && r.targetId === input.targetId)) return;
        d.reports.push({ id: newId('rep'), reporterId: me.id, ...input, details: input.details?.trim() || undefined, createdAt: nowIso() });
      });
    }),
};
