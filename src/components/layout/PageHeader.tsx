import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Buttons on the right (stack under the title on phones). */
  actions?: ReactNode;
  /** Small context row above the title, e.g. breadcrumbs or a back link. */
  above?: ReactNode;
  /** Less top spacing, for pages inside the dashboard/admin shell. */
  compact?: boolean;
  className?: string;
}

export function PageHeader({ title, description, actions, above, compact, className }: PageHeaderProps) {
  useDocumentTitle(title);
  return (
    <header className={cn('flex flex-col gap-5 pb-8 md:flex-row md:items-end md:justify-between', compact ? 'pt-0' : 'pt-8 sm:pt-12', className)}>
      <div className="max-w-2xl">
        {above && <div className="mb-3">{above}</div>}
        <h1 className="font-display text-display-sm text-white sm:text-display">{title}</h1>
        {description && <p className="mt-3 text-lg leading-relaxed text-mist">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
