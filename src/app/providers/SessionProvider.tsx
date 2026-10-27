import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { services } from '@/services';
import type { SessionUser } from '@/types/domain';
import { SessionContext, type SessionApi } from './session-context';

/**
 * Exposes the current identity from the auth service.
 * Milestone A: prototype demo accounts (services/mock/auth.mock.ts) — not real authentication.
 * Milestone B: Supabase Auth behind the same AuthService contract.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => services.auth.getCurrentUser());

  useEffect(() => services.auth.onChange(setUser), []);

  const api = useMemo<SessionApi>(
    () => ({
      user,
      signInAsDemo: (role = 'member') => services.auth.signInAsDemo(role),
      createDemoProfile: (input) => services.auth.createDemoProfile(input),
      continueAsGuest: () => services.auth.continueAsGuest(),
      signOut: () => services.auth.signOut(),
    }),
    [user],
  );

  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>;
}
