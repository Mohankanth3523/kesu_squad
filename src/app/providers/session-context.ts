import { createContext, useContext } from 'react';
import type { Course, SessionUser } from '@/types/domain';

export interface SessionApi {
  user: SessionUser | null;
  /** PROTOTYPE ONLY: switch to a built-in demo account. */
  signInAsDemo: (role?: 'member' | 'admin') => Promise<SessionUser>;
  /** PROTOTYPE ONLY: create a local demo profile (no email or password stored). */
  createDemoProfile: (input: { displayName: string; course?: Course }) => Promise<SessionUser>;
  continueAsGuest: () => Promise<SessionUser>;
  signOut: () => Promise<void>;
}

export const SessionContext = createContext<SessionApi | null>(null);

export function useSession(): SessionApi {
  const api = useContext(SessionContext);
  if (!api) throw new Error('useSession must be used inside <SessionProvider>.');
  return api;
}
