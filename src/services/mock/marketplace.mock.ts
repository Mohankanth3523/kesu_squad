import { LIMITS } from '@/domain/constants';
import { validateCourierCharge, validateDonation, validateSale } from '@/domain/validation';
import { findPricingRule, maxAllowedPrice } from '@/lib/pricing';
import { formatINR } from '@/lib/format';
import type { DbDonationListing, DbDonationRequest, DbSaleListing, MockDatabase } from '@/data/schema';
import { ServiceError } from '@/types/service';
import type { BookInput, BooksService, DonationInput, DonationsService, SaleInput } from '../interfaces';
import { matchesQuery, profileOf, toDonationListing, toDonationRequest, toSaleListing } from './mappers';
import { mockDb, newId, nowIso } from './mockDb';
import { command, forbidden, invalid, notFound, query } from './mockUtils';
import { currentUserId, requireIdentity, requireMember } from './session';

const isSale = (l: MockDatabase['listings'][number]): l is DbSaleListing => l.type === 'sale';
const isDonation = (l: MockDatabase['listings'][number]): l is DbDonationListing => l.type === 'donation';
const PUBLIC_STATUSES = ['available', 'reserved'];

function bookFieldStrings(input: BookInput) {
  return {
    title: input.title,
    author: input.author,
    editionLabel: input.editionLabel,
    isCurrentEdition: input.isCurrentEdition,
    publicationYear: String(input.publicationYear),
    subject: input.subject,
    course: input.course,
    condition: input.condition,
    description: input.description ?? '',
    city: input.city ?? '',
  };
}

function checkPhotos(input: BookInput) {
  if (input.photos.length > LIMITS.photos.max) invalid(`Add up to ${LIMITS.photos.max} photos.`, { photos: `Add up to ${LIMITS.photos.max} photos.` });
}

/** Adds a system line to every conversation about a listing (e.g. "marked as sold"). */
function announce(d: MockDatabase, listingId: string, body: string, onlyConversationId?: string) {
  for (const c of d.conversations.filter((x) => x.listingId === listingId && (!onlyConversationId || x.id === onlyConversationId))) {
    d.messages.push({ id: newId('m'), conversationId: c.id, senderId: null, body, kind: 'system', createdAt: nowIso() });
  }
}

function ownedSale(id: string, ownerId: string): DbSaleListing {
  const l = mockDb.read().listings.find((x) => x.id === id);
  if (!l || !isSale(l)) notFound('This listing');
  if (l.ownerId !== ownerId) forbidden('Only the seller can change this listing.');
  return l;
}

// --------------------------------------------------------------------------
// Second-hand books
// --------------------------------------------------------------------------
function saleRecord(input: SaleInput, base: { id: string; ownerId: string; createdAt: string; status: DbSaleListing['status'] }): DbSaleListing {
  const rule = findPricingRule(input.isCurrentEdition, input.publicationYear);
  return {
    type: 'sale',
    ...base,
    title: input.title.trim(),
    author: input.author.trim(),
    editionLabel: input.editionLabel.trim(),
    isCurrentEdition: input.isCurrentEdition,
    publicationYear: input.publicationYear,
    subject: input.subject,
    course: input.course,
    condition: input.condition,
    description: input.description?.trim() || undefined,
    city: input.city?.trim() || undefined,
    photos: input.photos,
    updatedAt: nowIso(),
    originalPrice: input.originalPrice,
    askingPrice: input.askingPrice,
    maxAllowedPrice: maxAllowedPrice(input.originalPrice, rule),
    pricingRuleLabel: rule.label,
  };
}

function validateSaleInput(input: SaleInput) {
  // Server-side re-check: the client calculation is never trusted (MKT-10).
  const errors = validateSale({ ...bookFieldStrings(input), originalPrice: String(input.originalPrice), askingPrice: String(input.askingPrice) });
  if (Object.values(errors).some(Boolean)) invalid('Check the highlighted fields.', errors);
  checkPhotos(input);
}

export const mockBooks: BooksService = {
  search: (q = {}) =>
    query(
      'books.search',
      () => {
        const db = mockDb.read();
        const list = db.listings
          .filter(isSale)
          .filter((l) => PUBLIC_STATUSES.includes(l.status))
          .filter((l) => matchesQuery(q.q, l.title, l.author, l.subject, l.editionLabel, l.course.join(' '), String(l.publicationYear)))
          .filter((l) => !q.course || l.course.includes(q.course))
          .filter((l) => !q.subject || l.subject === q.subject)
          .filter((l) => !q.conditions?.length || q.conditions.includes(l.condition))
          .filter((l) => !q.edition || q.edition === 'any' || (q.edition === 'current') === l.isCurrentEdition)
          .filter((l) => q.minPrice === undefined || l.askingPrice >= q.minPrice)
          .filter((l) => q.maxPrice === undefined || l.askingPrice <= q.maxPrice)
          .map((l) => toSaleListing(db, l));
        const sort = q.sort ?? 'newest';
        return list.sort((a, b) =>
          sort === 'price_asc' ? a.askingPrice - b.askingPrice : sort === 'price_desc' ? b.askingPrice - a.askingPrice : b.createdAt.localeCompare(a.createdAt),
        );
      },
      [],
    ),

  listRecent: ({ limit } = {}) =>
    query(
      'books.listRecent',
      () => {
        const db = mockDb.read();
        return db.listings
          .filter(isSale)
          .filter((l) => l.status === 'available')
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, limit)
          .map((l) => toSaleListing(db, l));
      },
      [],
    ),

  get: (id) =>
    query('books.get', () => {
      const db = mockDb.read();
      const l = db.listings.find((x) => x.id === id);
      if (!l || !isSale(l)) notFound('This listing');
      const viewer = currentUserId();
      const visible =
        PUBLIC_STATUSES.includes(l.status) ||
        l.ownerId === viewer ||
        db.conversations.some((c) => c.listingId === l.id && c.initiatorId === viewer);
      if (!visible) notFound('This listing');
      return toSaleListing(db, l);
    }),

  listMine: () =>
    query(
      'books.listMine',
      () => {
        const me = currentUserId();
        const db = mockDb.read();
        return db.listings
          .filter(isSale)
          .filter((l) => l.ownerId === me)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
          .map((l) => toSaleListing(db, l));
      },
      [],
    ),

  create: (input) =>
    command('books.create', () => {
      const me = requireMember();
      validateSaleInput(input);
      const now = nowIso();
      const record = mockDb.write((d) => {
        const r = saleRecord(input, { id: newId('b'), ownerId: me.id, createdAt: now, status: 'available' });
        d.listings.push(r);
        return r;
      });
      return toSaleListing(mockDb.read(), record);
    }),

  update: (id, input) =>
    command('books.update', () => {
      const me = requireMember();
      const existing = ownedSale(id, me.id);
      if (existing.status === 'sold') invalid('Sold listings can’t be edited.');
      validateSaleInput(input);
      const record = mockDb.write((d) => {
        const r = saleRecord(input, { id, ownerId: me.id, createdAt: existing.createdAt, status: existing.status });
        d.listings[d.listings.findIndex((x) => x.id === id)] = r;
        return r;
      });
      return toSaleListing(mockDb.read(), record);
    }),

  setStatus: (id, status) =>
    command('books.setStatus', () => {
      const me = requireMember();
      const existing = ownedSale(id, me.id);
      const allowed: Record<string, string[]> = {
        available: ['reserved', 'sold', 'withdrawn'],
        reserved: ['available', 'sold', 'withdrawn'],
        withdrawn: ['available'],
        sold: [],
      };
      if (!allowed[existing.status]?.includes(status)) invalid(`A ${existing.status} listing can’t be marked ${status}.`);
      const record = mockDb.write((d) => {
        const r = d.listings.find((x) => x.id === id) as DbSaleListing;
        r.status = status;
        r.updatedAt = nowIso();
        const seller = profileOf(d, me.id).displayName;
        const line = {
          sold: `${seller} marked this book as sold.`,
          reserved: `${seller} marked this book as reserved.`,
          withdrawn: `${seller} withdrew this listing.`,
          available: `${seller} marked this book as available again.`,
        }[status];
        announce(d, id, line);
        return r;
      });
      return toSaleListing(mockDb.read(), record);
    }),
};

// --------------------------------------------------------------------------
// Donations
// --------------------------------------------------------------------------
function donationRecord(input: DonationInput, base: { id: string; ownerId: string; createdAt: string; status: DbDonationListing['status'] }): DbDonationListing {
  return {
    type: 'donation',
    ...base,
    title: input.title.trim(),
    author: input.author.trim(),
    editionLabel: input.editionLabel.trim(),
    isCurrentEdition: input.isCurrentEdition,
    publicationYear: input.publicationYear,
    subject: input.subject,
    course: input.course,
    condition: input.condition,
    description: input.description?.trim() || undefined,
    city: input.city?.trim() || undefined,
    photos: input.photos,
    updatedAt: nowIso(),
    quantity: input.quantity,
    donorCoversShipping: input.donorCoversShipping,
  };
}

function validateDonationInput(input: DonationInput) {
  // There is deliberately no price field: donors can’t charge for donated books (DON-06).
  const errors = validateDonation({ ...bookFieldStrings(input), quantity: String(input.quantity), donorCoversShipping: input.donorCoversShipping });
  if (Object.values(errors).some(Boolean)) invalid('Check the highlighted fields.', errors);
  checkPhotos(input);
}

function requestById(id: string) {
  const db = mockDb.read();
  const r = db.donationRequests.find((x) => x.id === id) ?? notFound('This request');
  const listing = db.listings.find((l) => l.id === r.listingId);
  if (!listing || !isDonation(listing)) notFound('This donation');
  return { r, listing };
}

/** Books still free to promise on a listing (quantity minus accepted/completed requests). */
function remaining(d: MockDatabase, listing: DbDonationListing) {
  const promised = d.donationRequests
    .filter((x) => x.listingId === listing.id && (x.status === 'accepted' || x.status === 'completed'))
    .reduce((n, x) => n + x.booksRequested, 0);
  return listing.quantity - promised;
}

function completeIfConfirmed(d: MockDatabase, r: DbDonationRequest, listing: DbDonationListing) {
  if (!r.donorConfirmedAt || !r.recipientConfirmedAt || r.status !== 'accepted') return;
  r.status = 'completed';
  r.completedAt = nowIso();
  d.completions.push({ id: newId('x'), requestId: r.id, donorId: listing.ownerId, booksCount: r.booksRequested, completedAt: r.completedAt });
  const done = d.donationRequests.filter((x) => x.listingId === listing.id && x.status === 'completed').reduce((n, x) => n + x.booksRequested, 0);
  const l = d.listings.find((x) => x.id === listing.id) as DbDonationListing;
  if (done >= l.quantity) l.status = 'donated';
  l.updatedAt = nowIso();
  const donor = profileOf(d, listing.ownerId).displayName;
  announce(d, listing.id, `Donation completed — ${r.booksRequested} book${r.booksRequested > 1 ? 's' : ''} added to ${donor}’s Honour Board count.`, r.conversationId);
}

function transition(id: string, key: string, mutate: (d: MockDatabase, r: DbDonationRequest, listing: DbDonationListing, meId: string) => void) {
  return command(key, () => {
    const me = requireIdentity();
    const { r } = requestById(id);
    mockDb.write((d) => {
      const row = d.donationRequests.find((x) => x.id === r.id)!;
      const listing = d.listings.find((l) => l.id === row.listingId) as DbDonationListing;
      mutate(d, row, listing, me.id);
    });
    return toDonationRequest(mockDb.read(), mockDb.read().donationRequests.find((x) => x.id === id)!);
  });
}

const mustBeDonor = (listing: DbDonationListing, meId: string) => {
  if (listing.ownerId !== meId) forbidden('Only the donor can do this.');
};
const mustBeRecipient = (r: DbDonationRequest, meId: string) => {
  if (r.requesterId !== meId) forbidden('Only the person who requested the book can do this.');
};
const mustBe = (r: DbDonationRequest, ...statuses: DbDonationRequest['status'][]) => {
  if (!statuses.includes(r.status)) invalid(`This request is ${r.status}, so that isn’t possible.`);
};

export const mockDonations: DonationsService = {
  search: (q = {}) =>
    query(
      'donations.search',
      () => {
        const db = mockDb.read();
        const list = db.listings
          .filter(isDonation)
          .filter((l) => PUBLIC_STATUSES.includes(l.status))
          .filter((l) => matchesQuery(q.q, l.title, l.author, l.subject, l.course.join(' ')))
          .filter((l) => !q.course || l.course.includes(q.course))
          .filter((l) => !q.subject || l.subject === q.subject)
          .filter((l) => !q.conditions?.length || q.conditions.includes(l.condition))
          .filter((l) => !q.donorCoversShipping || l.donorCoversShipping)
          .map((l) => toDonationListing(db, l));
        return list.sort((a, b) => (q.sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));
      },
      [],
    ),

  listAvailable: ({ limit } = {}) =>
    query(
      'donations.listAvailable',
      () => {
        const db = mockDb.read();
        return db.listings
          .filter(isDonation)
          .filter((l) => l.status === 'available')
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, limit)
          .map((l) => toDonationListing(db, l));
      },
      [],
    ),

  get: (id) =>
    query('donations.get', () => {
      const db = mockDb.read();
      const l = db.listings.find((x) => x.id === id);
      if (!l || !isDonation(l)) notFound('This donation');
      const viewer = currentUserId();
      const visible = PUBLIC_STATUSES.includes(l.status) || l.ownerId === viewer || db.donationRequests.some((r) => r.listingId === id && r.requesterId === viewer);
      if (!visible) notFound('This donation');
      return toDonationListing(db, l);
    }),

  listMine: () =>
    query(
      'donations.listMine',
      () => {
        const me = currentUserId();
        const db = mockDb.read();
        return db.listings
          .filter(isDonation)
          .filter((l) => l.ownerId === me)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
          .map((l) => toDonationListing(db, l));
      },
      [],
    ),

  create: (input) =>
    command('donations.create', () => {
      const me = requireMember();
      validateDonationInput(input);
      const record = mockDb.write((d) => {
        const r = donationRecord(input, { id: newId('d'), ownerId: me.id, createdAt: nowIso(), status: 'available' });
        d.listings.push(r);
        return r;
      });
      return toDonationListing(mockDb.read(), record);
    }),

  update: (id, input) =>
    command('donations.update', () => {
      const me = requireMember();
      const existing = mockDb.read().listings.find((l) => l.id === id);
      if (!existing || !isDonation(existing)) notFound('This donation');
      if (existing.ownerId !== me.id) forbidden('Only the donor can edit this listing.');
      if (existing.status === 'donated') invalid('Completed donations can’t be edited.');
      validateDonationInput(input);
      const record = mockDb.write((d) => {
        const r = donationRecord(input, { id, ownerId: me.id, createdAt: existing.createdAt, status: existing.status });
        d.listings[d.listings.findIndex((x) => x.id === id)] = r;
        return r;
      });
      return toDonationListing(mockDb.read(), record);
    }),

  withdraw: (id) =>
    command('donations.withdraw', () => {
      const me = requireMember();
      const existing = mockDb.read().listings.find((l) => l.id === id);
      if (!existing || !isDonation(existing)) notFound('This donation');
      if (existing.ownerId !== me.id) forbidden('Only the donor can withdraw this listing.');
      if (existing.status === 'donated') invalid('Completed donations can’t be withdrawn.');
      const record = mockDb.write((d) => {
        const l = d.listings.find((x) => x.id === id) as DbDonationListing;
        l.status = 'withdrawn';
        l.updatedAt = nowIso();
        for (const r of d.donationRequests.filter((x) => x.listingId === id && (x.status === 'pending' || x.status === 'accepted'))) {
          r.status = r.status === 'pending' ? 'declined' : 'cancelled';
          r.cancelledAt = nowIso();
        }
        announce(d, id, `${profileOf(d, me.id).displayName} withdrew this donation. Open requests were closed.`);
        return l;
      });
      return toDonationListing(mockDb.read(), record);
    }),

  listIncomingRequests: () =>
    query(
      'donations.listIncomingRequests',
      () => {
        const me = currentUserId();
        const db = mockDb.read();
        const mine = new Set(db.listings.filter((l) => isDonation(l) && l.ownerId === me).map((l) => l.id));
        return db.donationRequests
          .filter((r) => mine.has(r.listingId))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((r) => toDonationRequest(db, r));
      },
      [],
    ),

  listMyRequests: () =>
    query(
      'donations.listMyRequests',
      () => {
        const me = currentUserId();
        const db = mockDb.read();
        return db.donationRequests
          .filter((r) => r.requesterId === me)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((r) => toDonationRequest(db, r));
      },
      [],
    ),

  getMyRequestFor: (listingId) =>
    query('donations.getMyRequestFor', () => {
      const me = currentUserId();
      if (!me) return null;
      const db = mockDb.read();
      const r = db.donationRequests
        .filter((x) => x.listingId === listingId && x.requesterId === me)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      return r ? toDonationRequest(db, r) : null;
    }),

  request: ({ listingId, message, booksRequested }) =>
    command('donations.request', () => {
      const me = requireIdentity(); // Guests may request (OQ-02 default: same as buyers).
      const db = mockDb.read();
      const listing = db.listings.find((l) => l.id === listingId);
      if (!listing || !isDonation(listing)) notFound('This donation');
      if (listing.ownerId === me.id) invalid('You can’t request your own donation.');
      if (listing.status !== 'available') invalid('This book has already been promised to someone else.');
      const trimmed = message.trim();
      if (trimmed.length < LIMITS.donationRequestMessage.min || trimmed.length > LIMITS.donationRequestMessage.max) {
        const msg = `Write a short note to the donor (${LIMITS.donationRequestMessage.min}–${LIMITS.donationRequestMessage.max} characters).`;
        invalid(msg, { message: msg });
      }
      const left = remaining(db, listing);
      if (booksRequested < 1 || booksRequested > left) invalid(`Request between 1 and ${left} book${left > 1 ? 's' : ''}.`, { booksRequested: `Choose between 1 and ${left}.` });
      const open = db.donationRequests.filter((r) => r.listingId === listingId && r.requesterId === me.id && (r.status === 'pending' || r.status === 'accepted'));
      if (open.length) throw new ServiceError('conflict', 'You’ve already requested this book.');
      const pending = db.donationRequests.filter((r) => r.requesterId === me.id && r.status === 'pending').length;
      if (pending >= LIMITS.pendingDonationRequests) {
        throw new ServiceError('rate_limited', `You can have up to ${LIMITS.pendingDonationRequests} requests waiting at once. Withdraw one or wait for a reply.`);
      }
      const created = mockDb.write((d) => {
        const now = nowIso();
        const conversationId = newId('k');
        d.conversations.push({ id: conversationId, kind: 'donation', listingId, initiatorId: me.id, ownerId: listing.ownerId, createdAt: now });
        d.participants.push({ conversationId, userId: me.id, lastReadAt: now, blocked: false }, { conversationId, userId: listing.ownerId, lastReadAt: '1970-01-01T00:00:00.000Z', blocked: false });
        d.messages.push(
          { id: newId('m'), conversationId, senderId: null, body: `${profileOf(d, me.id).displayName} requested ${booksRequested} book${booksRequested > 1 ? 's' : ''}. The book is free; the recipient pays only the agreed courier charge.`, kind: 'system', createdAt: now },
          { id: newId('m'), conversationId, senderId: me.id, body: trimmed, kind: 'user', createdAt: now, localOnly: true },
        );
        const r: DbDonationRequest = { id: newId('q'), listingId, requesterId: me.id, conversationId, message: trimmed, booksRequested, status: 'pending', createdAt: now };
        d.donationRequests.push(r);
        return r;
      });
      return toDonationRequest(mockDb.read(), created);
    }),

  accept: (id, terms) =>
    transition(id, 'donations.accept', (d, r, listing, meId) => {
      mustBeDonor(listing, meId);
      mustBe(r, 'pending');
      const courierError = validateCourierCharge(String(terms.courierCharge ?? ''), terms.donorCoversShipping);
      if (courierError) invalid(courierError, { courierCharge: courierError });
      if (r.booksRequested > remaining(d, listing)) invalid('There aren’t enough books left for this request.');
      r.status = 'accepted';
      r.acceptedAt = nowIso();
      r.donorCoversShipping = terms.donorCoversShipping;
      r.agreedCourierCharge = terms.donorCoversShipping ? 0 : terms.courierCharge;
      const donor = profileOf(d, meId).displayName;
      const terms_ = terms.donorCoversShipping
        ? `${donor} will cover the courier.`
        : `Agreed courier charge: ${formatINR(terms.courierCharge ?? 0)}, paid by the recipient directly to the courier or donor.`;
      announce(d, listing.id, `${donor} accepted this request. ${terms_}`, r.conversationId);
      const l = d.listings.find((x) => x.id === listing.id) as DbDonationListing;
      if (remaining(d, l) <= 0) {
        l.status = 'reserved';
        for (const other of d.donationRequests.filter((x) => x.listingId === l.id && x.status === 'pending')) {
          other.status = 'declined';
          announce(d, l.id, 'This book has been promised to another student, so this request was closed.', other.conversationId);
        }
      }
      l.updatedAt = nowIso();
    }),

  decline: (id) =>
    transition(id, 'donations.decline', (d, r, listing, meId) => {
      mustBeDonor(listing, meId);
      mustBe(r, 'pending');
      r.status = 'declined';
      announce(d, listing.id, `${profileOf(d, meId).displayName} declined this request.`, r.conversationId);
    }),

  withdrawRequest: (id) =>
    transition(id, 'donations.withdrawRequest', (d, r, listing, meId) => {
      mustBeRecipient(r, meId);
      mustBe(r, 'pending');
      r.status = 'withdrawn';
      announce(d, listing.id, `${profileOf(d, meId).displayName} withdrew this request.`, r.conversationId);
    }),

  cancel: (id, reason) =>
    transition(id, 'donations.cancel', (d, r, listing, meId) => {
      if (listing.ownerId !== meId && r.requesterId !== meId) forbidden();
      mustBe(r, 'accepted');
      r.status = 'cancelled';
      r.cancelledAt = nowIso();
      const l = d.listings.find((x) => x.id === listing.id) as DbDonationListing;
      if (l.status === 'reserved') l.status = 'available';
      announce(d, l.id, `${profileOf(d, meId).displayName} cancelled this donation${reason ? `: “${reason}”` : '.'} Cancelled donations don’t count on the Honour Board.`, r.conversationId);
    }),

  markSent: (id) =>
    transition(id, 'donations.markSent', (d, r, listing, meId) => {
      mustBeDonor(listing, meId);
      mustBe(r, 'accepted');
      if (r.donorConfirmedAt) invalid('You’ve already marked this as sent.');
      r.donorConfirmedAt = nowIso();
      announce(d, listing.id, `${profileOf(d, meId).displayName} marked the book as sent.`, r.conversationId);
      completeIfConfirmed(d, r, listing);
    }),

  confirmReceived: (id) =>
    transition(id, 'donations.confirmReceived', (d, r, listing, meId) => {
      mustBeRecipient(r, meId);
      mustBe(r, 'accepted');
      if (r.recipientConfirmedAt) invalid('You’ve already confirmed this.');
      r.recipientConfirmedAt = nowIso();
      announce(d, listing.id, `${profileOf(d, meId).displayName} confirmed the book arrived.`, r.conversationId);
      completeIfConfirmed(d, r, listing);
    }),

  simulateRecipientConfirmation: (id) =>
    transition(id, 'donations.simulate', (d, r, listing, meId) => {
      mustBeDonor(listing, meId);
      mustBe(r, 'accepted');
      if (!r.donorConfirmedAt) invalid('Mark the book as sent first.');
      r.recipientConfirmedAt = nowIso();
      announce(d, listing.id, 'Prototype: the recipient’s confirmation was simulated.', r.conversationId);
      completeIfConfirmed(d, r, listing);
    }),
};
