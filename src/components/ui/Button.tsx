import type { ComponentProps, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-medium whitespace-nowrap select-none ' +
  'transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-cinematic)] ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gold text-ink hover:bg-champagne',
  secondary: 'border border-gold/45 text-champagne hover:border-champagne hover:bg-gold/10',
  ghost: 'text-mist hover:text-white hover:bg-white/5',
  danger: 'border border-danger/50 text-danger hover:bg-danger/10',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-13 px-7 text-base',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  children: ReactNode;
}

export interface ButtonProps extends Omit<ComponentProps<'button'>, 'children'>, CommonProps {
  loading?: boolean;
}

export function Button({
  variant,
  size,
  leadingIcon,
  trailingIcon,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const iconSize = size === 'sm' ? 'sm' : 'md';
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Icon name="loading" size={iconSize} /> : leadingIcon && <Icon name={leadingIcon} size={iconSize} />}
      <span>{children}</span>
      {trailingIcon && !loading && <Icon name={trailingIcon} size={iconSize} />}
    </button>
  );
}

export interface ButtonLinkProps extends Omit<LinkProps, 'children'>, CommonProps {}

/** A link styled as a button — use for navigation, never for actions. */
export function ButtonLink({ variant, size, leadingIcon, trailingIcon, className, children, ...rest }: ButtonLinkProps) {
  const iconSize = size === 'sm' ? 'sm' : 'md';
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      {leadingIcon && <Icon name={leadingIcon} size={iconSize} />}
      <span>{children}</span>
      {trailingIcon && <Icon name={trailingIcon} size={iconSize} />}
    </Link>
  );
}

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon: IconName;
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  size?: 'sm' | 'md';
  badge?: number;
}

export function IconButton({ icon, label, size = 'md', badge, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={badge ? `${label} (${badge} new)` : label}
      title={label}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full text-mist transition-colors duration-200 hover:bg-white/6 hover:text-white disabled:opacity-45',
        size === 'sm' ? 'size-9' : 'size-11',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' ? 'sm' : 'md'} />
      {badge ? (
        <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-2xs font-semibold text-ink">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  );
}
