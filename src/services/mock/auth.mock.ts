import { validateDisplayName } from '@/domain/validation';
import { DEMO_ADMIN_ID, DEMO_MEMBER_ID } from '@/data/users';
import type { SessionUser } from '@/types/domain';
import type { AuthService } from '../interfaces';
import { mockDb, newId, nowIso } from './mockDb';
import { command, invalid } from './mockUtils';
import { currentUser, requireIdentity, setCurrentUserId, toSessionUser } from './session';

type Listener = (user: SessionUser | null) => void;
const listeners = new Set<Listener>();
const emit = () => {
  const u = currentUser();
  listeners.forEach((l) => l(u ? toSessionUser(u) : null));
};
mockDb.subscribe(emit);

function nameTaken(name: string, exceptId?: string) {
  return mockDb.read().users.some((u) => u.id !== exceptId && u.displayName.toLowerCase() === name.trim().toLowerCase());
}

export const mockAuth: AuthService = {
  getCurrentUser() {
    const u = currentUser();
    return u ? toSessionUser(u) : null;
  },
  onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  signInAsDemo: (role) =>
    command('auth.signIn', () => {
      setCurrentUserId(role === 'admin' ? DEMO_ADMIN_ID : DEMO_MEMBER_ID);
      emit();
      return toSessionUser(currentUser()!);
    }),
  createDemoProfile: ({ displayName, course }) =>
    command('auth.register', () => {
      const error = validateDisplayName(displayName);
      if (error) invalid(error, { displayName: error });
      if (nameTaken(displayName)) invalid('That display name is taken.', { displayName: 'That display name is taken. Try another.' });
      const user = mockDb.write((db) => {
        const u = { id: newId('u'), displayName: displayName.trim(), course, role: 'member' as const, isGuest: false, joinedAt: nowIso(), showOnHonourBoard: true };
        db.users.push(u);
        return u;
      });
      setCurrentUserId(user.id);
      emit();
      return toSessionUser(user);
    }),
  continueAsGuest: () =>
    command('auth.guest', () => {
      const user = mockDb.write((db) => {
        const u = {
          id: newId('guest'),
          displayName: `Amigo-${Math.floor(1000 + Math.random() * 9000)}`,
          role: 'member' as const,
          isGuest: true,
          joinedAt: nowIso(),
          showOnHonourBoard: false,
        };
        db.users.push(u);
        return u;
      });
      setCurrentUserId(user.id);
      emit();
      return toSessionUser(user);
    }),
  signOut: () =>
    command('auth.signOut', () => {
      setCurrentUserId(null);
      emit();
    }),
  updateProfile: (input) =>
    command('auth.updateProfile', () => {
      const me = requireIdentity();
      if (input.displayName !== undefined) {
        const error = validateDisplayName(input.displayName);
        if (error) invalid(error, { displayName: error });
        if (nameTaken(input.displayName, me.id)) invalid('That display name is taken.', { displayName: 'That display name is taken. Try another.' });
      }
      return toSessionUser(
        mockDb.write((db) => {
          const u = db.users.find((x) => x.id === me.id)!;
          if (input.displayName !== undefined) u.displayName = input.displayName.trim();
          if (input.course !== undefined) u.course = input.course ?? undefined;
          if (input.showOnHonourBoard !== undefined) u.showOnHonourBoard = input.showOnHonourBoard;
          return u;
        }),
      );
    }),
};
