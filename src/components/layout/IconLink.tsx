import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/ui';

export function IconLink({ icon, label, badge, className, ...rest }: Omit<LinkProps, 'children'> & { icon: IconName; label: string; badge?: number }) {
  return (
    <Link
      aria-label={badge ? `${label} (${badge} unread)` : label}
      title={label}
      className={cn(
        'relative inline-flex size-11 items-center justify-center rounded-full text-mist transition-colors duration-200 hover:bg-white/6 hover:text-white',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} />
      {badge ? (
        <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-2xs font-semibold text-ink">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </Link>
  );
}
