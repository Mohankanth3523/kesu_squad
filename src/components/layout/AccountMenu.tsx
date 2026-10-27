import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { Avatar, Badge, Icon, useToast, type IconName } from '@/components/ui';
import { paths } from '@/lib/routes';

export function AccountMenu() {
  const { user, signOut } = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const items: Array<{ to: string; label: string; icon: IconName }> = user.isGuest
    ? [{ to: paths.inbox, label: 'Inbox', icon: 'inbox' }]
    : [
        { to: paths.dashboard, label: 'Dashboard', icon: 'dashboard' },
        { to: paths.inbox, label: 'Inbox', icon: 'inbox' },
        { to: paths.dashboardSettings, label: 'Settings', icon: 'settings' },
        ...(user.role === 'admin' ? [{ to: paths.adminReports, label: 'Admin', icon: 'shield' as const }] : []),
      ];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 text-sm text-mist transition-colors hover:bg-white/6 hover:text-white"
      >
        <Avatar name={user.displayName} size="sm" />
        <span className="hidden max-w-32 truncate xl:inline">{user.displayName}</span>
        <Icon name="expand" size="sm" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-60 overflow-hidden rounded-[var(--radius-surface)] border border-line-strong bg-charcoal-high py-2"
          >
            <div className="border-b border-line px-4 pb-3">
              <p className="truncate text-sm font-medium text-white">{user.displayName}</p>
              <div className="mt-1.5">
                {user.isGuest ? <Badge>Guest</Badge> : <Badge tone="gold">{user.role === 'admin' ? 'Admin' : 'Member'}</Badge>}
              </div>
            </div>
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-mist hover:bg-white/5 hover:text-white"
              >
                <Icon name={item.icon} size="sm" />
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut().then(() => toast.info('Logged out'));
                navigate(paths.home);
              }}
              className="flex w-full items-center gap-3 border-t border-line px-4 pt-3 pb-2.5 text-left text-sm text-mist hover:bg-white/5 hover:text-white"
            >
              <Icon name="logout" size="sm" />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
