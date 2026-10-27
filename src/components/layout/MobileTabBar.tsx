import { NavLink } from 'react-router';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { MOBILE_TABS } from '@/lib/nav';

/** Thumb-reach navigation on phones. Hidden from lg upward, where the header nav takes over. */
export function MobileTabBar() {
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-xl grid-cols-5">
        {MOBILE_TABS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-[0.6875rem] transition-colors',
                  isActive ? 'text-gold' : 'text-muted hover:text-white',
                )
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
