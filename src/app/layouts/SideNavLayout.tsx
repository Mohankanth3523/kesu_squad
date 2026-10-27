import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router';
import { Container } from '@/components/layout/Container';
import { PageLoader } from '@/components/layout/RouteFeedback';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { NavItem } from '@/lib/nav';
import { InShellContext } from './shell-context';

/**
 * Shared shell for the dashboard and admin areas: a side menu on desktop,
 * a horizontally scrolling tab row on phones.
 */
export function SideNavLayout({ label, items, endExact }: { label: string; items: NavItem[]; endExact?: string }) {
  return (
    <Container size="wide" className="grid gap-6 py-6 lg:grid-cols-[14rem_1fr] lg:gap-10 lg:py-10">
      <nav aria-label={label} className="-mx-4 lg:mx-0">
        <ul className="scrollbar-none flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-24 lg:flex-col lg:px-0">
          {items.map((item) => (
            <li key={item.to} className="shrink-0">
              <NavLink
                to={item.to}
                end={item.to === endExact}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors lg:rounded-lg lg:py-2.5',
                    isActive ? 'bg-gold/12 text-champagne' : 'text-mist hover:bg-white/5 hover:text-white',
                  )
                }
              >
                <Icon name={item.icon} size="sm" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">
        <InShellContext.Provider value>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </InShellContext.Provider>
      </div>
    </Container>
  );
}
