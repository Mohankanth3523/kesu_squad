import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'default' | 'raised' | 'gold';

const tones: Record<Tone, string> = {
  default: 'bg-charcoal border border-line',
  raised: 'bg-charcoal-high border border-line-strong',
  gold: 'bg-charcoal border hairline-gold',
};

export interface CardProps extends ComponentProps<'div'> {
  tone?: Tone;
  /** Adds hover affordance when the whole card is a link target. */
  interactive?: boolean;
  padded?: boolean;
}

export function Card({ tone = 'default', interactive, padded = true, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-surface)]',
        tones[tone],
        padded && 'p-5 sm:p-6',
        interactive && 'transition-colors duration-200 hover:border-gold/40 focus-within:border-gold/50',
        className,
      )}
      {...rest}
    />
  );
}
