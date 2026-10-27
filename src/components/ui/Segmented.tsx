import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
  count?: number;
}

/** Single-choice pill group (sort orders, tabs that filter a list). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border whitespace-nowrap transition-colors',
              size === 'sm' ? 'h-8 px-3 text-[0.8125rem]' : 'h-10 px-4 text-sm',
              active ? 'border-gold/60 bg-gold/12 text-champagne' : 'border-line text-mist hover:border-line-strong hover:text-white',
            )}
          >
            {o.icon && <Icon name={o.icon} size="sm" />}
            {o.label}
            {o.count !== undefined && <span className={cn('tabular-nums', active ? 'text-champagne/80' : 'text-muted')}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
