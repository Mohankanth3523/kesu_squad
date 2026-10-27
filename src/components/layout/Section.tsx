import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';

export interface SectionProps {
  title: string;
  description?: string;
  link?: { to: string; label: string };
  children: ReactNode;
  className?: string;
  id?: string;
}

/** Home and listing-page section with a heading and an optional "see all" link. */
export function Section({ title, description, link, children, className, id }: SectionProps) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section aria-labelledby={headingId} id={id} className={cn('py-10 sm:py-14', className)}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 id={headingId} className="font-display text-[1.75rem] leading-tight text-white sm:text-[2rem]">
            {title}
          </h2>
          {description && <p className="mt-1.5 text-mist">{description}</p>}
        </div>
        {link && (
          <Link
            to={link.to}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-gold underline-offset-4 hover:text-champagne hover:underline"
          >
            {link.label}
            <Icon name="next" size="sm" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
