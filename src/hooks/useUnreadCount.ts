import { useSession } from '@/app/providers/session-context';
import { services } from '@/services';
import { useAsync } from './useAsync';

export function useUnreadCount(): number {
  const { user } = useSession();
  const result = useAsync(() => services.messaging.unreadCount(), [user?.id], { enabled: Boolean(user) });
  return user && result.status === 'success' ? result.data : 0;
}
