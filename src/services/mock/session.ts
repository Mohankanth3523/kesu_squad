import type { DbUser } from '@/data/schema';
import { safeStorage, STORAGE_KEYS } from '@/lib/storage';
import type { SessionUser } from '@/types/domain';
import { mockDb } from './mockDb';
import { unauthorized } from './mockUtils';

/**
 * PROTOTYPE identity. The browser remembers which sample account is "signed in".
 * This is not authentication: anyone can switch accounts. Supabase Auth replaces it in Milestone B.
 */
export function currentUserId(): string | null {
  const id = safeStorage.get(STORAGE_KEYS.mockSession);
  if (!id) return null;
  return mockDb.read().users.some((u) => u.id === id) ? id : null;
}

export function setCurrentUserId(id: string | null) {
  if (id) safeStorage.set(STORAGE_KEYS.mockSession, id);
  else safeStorage.remove(STORAGE_KEYS.mockSession);
}

export function toSessionUser(u: DbUser): SessionUser {
  return {
    id: u.id,
    displayName: u.displayName,
    course: u.course,
    role: u.role,
    isGuest: u.isGuest,
    showOnHonourBoard: u.showOnHonourBoard,
    joinedAt: u.joinedAt,
  };
}

export function currentUser(): DbUser | null {
  const id = currentUserId();
  return id ? (mockDb.read().users.find((u) => u.id === id) ?? null) : null;
}

/** Any identity (guest or member). */
export function requireIdentity(): DbUser {
  return currentUser() ?? unauthorized('Log in or continue as a guest to do this.');
}

/** Registered member (not a guest). */
export function requireMember(): DbUser {
  const user = currentUser();
  if (!user || user.isGuest) unauthorized('Log in with a Kesh Squad account to do this.');
  return user;
}
