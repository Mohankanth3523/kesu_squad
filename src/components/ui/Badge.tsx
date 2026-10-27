import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';

export type BadgeTone = 'neutral' | 'gold' | 'success' | 'danger' | 'info' | 'outline';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-white/8 text-mist',
  gold: 'bg-gold/15 text-champagne',
  success: 'bg-success/12 text-success',
  danger: 'bg-danger/12 text-danger',
  info: 'bg-info/12 text-info',
  outline: 'border border-line-strong text-mist',
};

export interface BadgeProps extends ComponentProps<'span'> {
  tone?: BadgeTone;
  icon?: IconName;
}

export function Badge({ tone = 'neutral', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium leading-none whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size="xs" />}
      {children}
    </span>
  );
}
