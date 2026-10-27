import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Placeholder block shaped like the content that is loading. */
export function Skeleton({ className, ...rest }: ComponentProps<'div'>) {
  return <div aria-hidden="true" className={cn('skeleton rounded-md', className)} {...rest} />;
}

/** Wrap a group of skeletons so assistive tech hears a single "Loading" message. */
export function LoadingRegion({ label = 'Loading', className, children }: ComponentProps<'div'> & { label?: string }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
