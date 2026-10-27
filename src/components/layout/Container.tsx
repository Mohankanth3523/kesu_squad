import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Page-width wrapper with responsive gutters. */
export function Container({ className, size = 'default', ...rest }: ComponentProps<'div'> & { size?: 'default' | 'narrow' | 'wide' }) {
  const max = { narrow: 'max-w-3xl', default: 'max-w-6xl', wide: 'max-w-7xl' }[size];
  return <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', max, className)} {...rest} />;
}
