import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { Avatar, Badge, Button, ButtonLink, Icon, IconButton, useToast } from '@/components/ui';
import { cn } from '@/lib/cn';
import { MAIN_NAV } from '@/lib/nav';
import { paths } from '@/lib/routes';
import { Wordmark } from './Wordmark';

const SECONDARY = [
  { to: paths.ama, label: 'Ask Me Anything' },
  { to: paths.rules, label: 'Marketplace rules' },
  { to: paths.guidelines, label: 'Community guidelines' },
  { to: paths.about, label: 'About Kesh Squad' },
];

/** Full-height navigation sheet for phones and tablets. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut } = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Close when the route changes.
  useEffect(() => {
    onCloseRef.current();
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('a,button')?.focus());
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col border-l border-line bg-ink"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <Wordmark className="text-base" />
              <IconButton icon="close" label="Close menu" onClick={onClose} className="-mr-2" />
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              {user && (
                <div className="mb-4 flex items-center gap-3 rounded-[var(--radius-surface)] bg-charcoal px-3 py-3">
                  <Avatar name={user.displayName} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{user.displayName}</p>
                    {user.isGuest ? <Badge className="mt-1">Guest</Badge> : <Badge tone="gold" className="mt-1">Member</Badge>}
                  </div>
                </div>
              )}

              <nav aria-label="Main">
                <ul className="flex flex-col">
                  {MAIN_NAV.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-lg px-3 py-3 text-base',
                            isActive ? 'bg-gold/10 text-champagne' : 'text-white hover:bg-white/5',
                          )
                        }
                      >
                        <Icon name={item.icon} className="text-gold" />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              {user && !user.isGuest && (
                <div className="mt-4 border-t border-line pt-4">
                  <NavLink to={paths.dashboard} className="flex items-center gap-3 rounded-lg px-3 py-3 text-white hover:bg-white/5">
                    <Icon name="dashboard" className="text-gold" />
                    Dashboard
                  </NavLink>
                  {user.role === 'admin' && (
                    <NavLink to={paths.adminReports} className="flex items-center gap-3 rounded-lg px-3 py-3 text-white hover:bg-white/5">
                      <Icon name="shield" className="text-gold" />
                      Admin
                    </NavLink>
                  )}
                </div>
              )}

              <ul className="mt-4 border-t border-line pt-4">
                {SECONDARY.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} className="block rounded-lg px-3 py-2.5 text-sm text-mist hover:bg-white/5 hover:text-white">
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {user ? (
                <Button
                  variant="ghost"
                  leadingIcon="logout"
                  className="w-full"
                  onClick={() => {
                    void signOut().then(() => toast.info('Logged out'));
                    navigate(paths.home);
                  }}
                >
                  Log out
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <ButtonLink to={paths.login} variant="secondary">
                    Log in
                  </ButtonLink>
                  <ButtonLink to={paths.signup}>Join the squad</ButtonLink>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
