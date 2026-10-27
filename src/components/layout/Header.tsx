import { motion } from 'framer-motion';
import { useState } from 'react';
import { NavLink } from 'react-router';
import { useSession } from '@/app/providers/session-context';
import { ButtonLink, IconButton } from '@/components/ui';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { cn } from '@/lib/cn';
import { MAIN_NAV } from '@/lib/nav';
import { paths } from '@/lib/routes';
import { AccountMenu } from './AccountMenu';
import { Container } from './Container';
import { IconLink } from './IconLink';
import { MobileMenu } from './MobileMenu';
import { Wordmark } from './Wordmark';

export function Header() {
  const { user } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = useUnreadCount();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/85 backdrop-blur-md supports-[backdrop-filter]:bg-ink/70">
      <Container size="wide" className="flex h-16 items-center gap-4">
        <Wordmark className="text-[1.0625rem] sm:text-lg" />

        <nav aria-label="Main" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'relative block px-3.5 py-2 text-[0.9375rem] transition-colors duration-200',
                      isActive ? 'text-white' : 'text-mist hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute inset-x-3.5 -bottom-3 h-px bg-gold"
                          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <IconLink to={paths.search} icon="search" label="Search" />
          {user && <IconLink to={paths.inbox} icon="inbox" label="Inbox" badge={unread} />}
          <div className="hidden lg:block">
            {user ? (
              <AccountMenu />
            ) : (
              <ButtonLink to={paths.login} variant="secondary" size="sm" className="ml-2">
                Log in
              </ButtonLink>
            )}
          </div>
          <IconButton icon="menu" label="Open menu" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} />
        </div>
      </Container>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
