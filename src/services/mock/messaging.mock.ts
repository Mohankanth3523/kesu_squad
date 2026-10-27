import { validateMessage } from '@/domain/validation';
import type { DbConversation, MockDatabase } from '@/data/schema';
import type { ConversationSummary } from '@/types/domain';
import { ServiceError } from '@/types/service';
import type { MessagingService } from '../interfaces';
import { excerptOf, profileOf } from './mappers';
import { mockDb, newId, nowIso } from './mockDb';
import { command, invalid, notFound, query } from './mockUtils';
import { currentUserId, requireIdentity } from './session';

/**
 * PROTOTYPE messaging. Conversations and sample replies are seeded; messages you write are
 * saved in this browser only and are never delivered to anyone (no simulated replies).
 * Supabase Realtime with participant-only RLS replaces this in Milestone B.
 */
function summarize(db: MockDatabase, c: DbConversation, viewerId: string): ConversationSummary {
  const listing = db.listings.find((l) => l.id === c.listingId);
  const messages = db.messages.filter((m) => m.conversationId === c.id);
  const last = messages.at(-1);
  const mine = db.participants.find((p) => p.conversationId === c.id && p.userId === viewerId);
  const counterpartId = c.initiatorId === viewerId ? c.ownerId : c.initiatorId;
  return {
    id: c.id,
    kind: c.kind,
    listing: {
      id: c.listingId,
      type: listing?.type ?? c.kind,
      title: listing?.title ?? 'Removed listing',
      status: listing?.status ?? 'withdrawn',
      askingPrice: listing?.type === 'sale' ? listing.askingPrice : undefined,
    },
    counterpart: profileOf(db, counterpartId),
    viewerRole: c.ownerId === viewerId ? 'owner' : 'initiator',
    lastMessagePreview: last ? excerptOf(last.body, 90) : '',
    lastMessageAt: last?.createdAt ?? c.createdAt,
    unreadCount: messages.filter((m) => m.senderId !== viewerId && m.kind === 'user' && (!mine || m.createdAt > mine.lastReadAt)).length,
    blockedByViewer: mine?.blocked ?? false,
  };
}

/** Participant check: non-participants get "not found", never "forbidden", so private chats can't be discovered. */
function participantConversation(id: string, viewerId: string): DbConversation {
  const c = mockDb.read().conversations.find((x) => x.id === id);
  if (!c || (c.initiatorId !== viewerId && c.ownerId !== viewerId)) notFound('This conversation');
  return c;
}

export const mockMessaging: MessagingService = {
  listConversations: () =>
    query(
      'messaging.listConversations',
      () => {
        const me = requireIdentity();
        const db = mockDb.read();
        return db.conversations
          .filter((c) => c.initiatorId === me.id || c.ownerId === me.id)
          .map((c) => summarize(db, c, me.id))
          .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
      },
      [],
    ),

  getConversation: (id) =>
    query('messaging.getConversation', () => {
      const me = requireIdentity();
      return summarize(mockDb.read(), participantConversation(id, me.id), me.id);
    }),

  listMessages: (conversationId) =>
    query(
      'messaging.listMessages',
      () => {
        const me = requireIdentity();
        participantConversation(conversationId, me.id);
        return mockDb
          .read()
          .messages.filter((m) => m.conversationId === conversationId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      },
      [],
    ),

  sendMessage: (conversationId, body) =>
    command('messaging.sendMessage', () => {
      const me = requireIdentity();
      const c = participantConversation(conversationId, me.id);
      const error = validateMessage(body);
      if (error) invalid(error, { body: error });
      const db = mockDb.read();
      if (db.participants.some((p) => p.conversationId === c.id && p.blocked)) {
        throw new ServiceError('forbidden', 'Messaging is turned off in this conversation because one of you blocked the other.');
      }
      const recent = db.messages.filter((m) => m.senderId === me.id && Date.now() - new Date(m.createdAt).getTime() < 60_000).length;
      if (recent >= 30) throw new ServiceError('rate_limited', 'You’re sending messages too quickly. Wait a minute and try again.');
      return mockDb.write((d) => {
        const now = nowIso();
        const m = { id: newId('m'), conversationId, senderId: me.id, body: body.trim(), kind: 'user' as const, createdAt: now, localOnly: true };
        d.messages.push(m);
        const p = d.participants.find((x) => x.conversationId === conversationId && x.userId === me.id);
        if (p) p.lastReadAt = now;
        return m;
      });
    }),

  startSaleConversation: (listingId, firstMessage) =>
    command('messaging.startSaleConversation', () => {
      const me = requireIdentity();
      const db = mockDb.read();
      const listing = db.listings.find((l) => l.id === listingId);
      if (!listing || listing.type !== 'sale') notFound('This listing');
      if (listing.ownerId === me.id) invalid('This is your own listing.');
      if (!['available', 'reserved'].includes(listing.status)) invalid('This book is no longer available.');
      const existing = db.conversations.find((c) => c.listingId === listingId && c.initiatorId === me.id);
      if (existing) return summarize(db, existing, me.id); // One private conversation per buyer per listing.
      const error = validateMessage(firstMessage);
      if (error) invalid(error, { body: error });
      const conv = mockDb.write((d) => {
        const now = nowIso();
        const c: DbConversation = { id: newId('k'), kind: 'sale', listingId, initiatorId: me.id, ownerId: listing.ownerId, createdAt: now };
        d.conversations.push(c);
        d.participants.push({ conversationId: c.id, userId: me.id, lastReadAt: now, blocked: false }, { conversationId: c.id, userId: listing.ownerId, lastReadAt: '1970-01-01T00:00:00.000Z', blocked: false });
        d.messages.push({ id: newId('m'), conversationId: c.id, senderId: me.id, body: firstMessage.trim(), kind: 'user', createdAt: now, localOnly: true });
        return c;
      });
      return summarize(mockDb.read(), conv, me.id);
    }),

  findConversationForListing: (listingId) =>
    query('messaging.findConversationForListing', () => {
      const me = currentUserId();
      if (!me) return null;
      const db = mockDb.read();
      const c = db.conversations.find((x) => x.listingId === listingId && x.initiatorId === me);
      return c ? summarize(db, c, me) : null;
    }),

  markRead: (conversationId) =>
    command('messaging.markRead', () => {
      const me = requireIdentity();
      participantConversation(conversationId, me.id);
      mockDb.write((d) => {
        const p = d.participants.find((x) => x.conversationId === conversationId && x.userId === me.id);
        if (p) p.lastReadAt = nowIso();
      });
    }),

  setBlocked: (conversationId, blocked) =>
    command('messaging.setBlocked', () => {
      const me = requireIdentity();
      participantConversation(conversationId, me.id);
      mockDb.write((d) => {
        const p = d.participants.find((x) => x.conversationId === conversationId && x.userId === me.id);
        if (p) p.blocked = blocked;
      });
    }),

  unreadCount: () =>
    query('messaging.unreadCount', () => {
      const me = currentUserId();
      if (!me) return 0;
      const db = mockDb.read();
      return db.conversations
        .filter((c) => c.initiatorId === me || c.ownerId === me)
        .reduce((n, c) => n + summarize(db, c, me).unreadCount, 0);
    }),
};
