import type { ReactNode } from 'react';
import { Outlet } from 'react-router';
import type { UserRole } from '@/types/domain';
import { useSession } from '../providers/session-context';
import { Gate } from './Gate';

/**
 * Route guards are user-experience only. Real enforcement lives in the database
 * (Row Level Security) from Milestone B onward.
 */

/** Members only (guests are not enough): selling, donating, dashboard, posting. */
export function RequireMember({ children }: { children?: ReactNode }) {
  const { user } = useSession();
  if (!user || user.isGuest) {
    return (
      <Gate
        icon="lock"
        title="Log in to continue"
        description="You need a Kesh Squad account to list books, donate, post in the community or use your dashboard."
      />
    );
  }
  return children ?? <Outlet />;
}

/** Guests or members: the inbox and buyer conversations (C1 §6). */
export function RequireIdentity({ children }: { children?: ReactNode }) {
  const { user } = useSession();
  if (!user) {
    return (
      <Gate
        icon="inbox"
        title="Your conversations live here"
        description="Log in, or continue as a guest, to message sellers and donors privately. No phone numbers are shared."
        allowGuest
      />
    );
  }
  return children ?? <Outlet />;
}

export function RequireRole({ role, children }: { role: Exclude<UserRole, 'member'>; children?: ReactNode }) {
  const { user } = useSession();
  const allowed = user && !user.isGuest && (user.role === 'admin' || user.role === role);
  if (!allowed) {
    return (
      <Gate icon="shield" title="Admins only" description="This area is for the Kesh Squad team. Log in with an admin account to continue." />
    );
  }
  return children ?? <Outlet />;
}
