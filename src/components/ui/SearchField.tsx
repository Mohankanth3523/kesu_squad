import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

export interface SearchFieldProps extends Omit<ComponentProps<'input'>, 'type' | 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
}

/** Search input with a clear button. The label is for screen readers; the placeholder shows the hint. */
export function SearchField({ value, onValueChange, label, className, ...rest }: SearchFieldProps) {
  return (
    <div className={cn('relative', className)}>
      <Icon name="search" size="sm" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mist" />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="h-12 w-full rounded-full border border-line bg-ink-raised pr-11 pl-11 text-white placeholder:text-muted transition-colors hover:border-line-strong focus:border-gold focus:ring-2 focus:ring-gold/25 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        {...rest}
      />
      {value && (
        <button
          type="button"
          onClick={() => onValueChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-white/6 hover:text-white"
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  );
}
