import { Link } from 'react-router';
import { Icon } from '@/components/ui';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { paths } from '@/lib/routes';

/** Always visible in Milestone A so mock behaviour is never mistaken for the real thing. */
export function PrototypeBanner() {
  return (
    <div className="border-b border-gold/20 bg-gold/8 text-xs text-champagne">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center">
        <Icon name="info" size="xs" />
        <p>
          Prototype preview — accounts, messages and listings are sample data and aren’t saved.{' '}
          <Link to={paths.designSystem} className="underline underline-offset-2 hover:text-white">
            Design system
          </Link>
        </p>
      </div>
    </div>
  );
}

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div role="status" className="bg-danger/15 text-sm text-danger">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2">
        <Icon name="offline" size="sm" />
        You’re offline. Changes won’t be sent until your connection returns.
      </div>
    </div>
  );
}
