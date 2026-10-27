import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { toUserMessage } from '@/types/service';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

interface StateProps {
  title: string;
  description?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

function StateFrame({ title, description, icon, action, compact, className, tone }: StateProps & { tone: 'empty' | 'error' }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-[var(--radius-surface)] border border-dashed text-center',
        tone === 'error' ? 'border-danger/35' : 'border-line-strong',
        compact ? 'gap-2 px-5 py-8' : 'gap-3 px-6 py-14',
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            'grid size-11 place-items-center rounded-full',
            tone === 'error' ? 'bg-danger/10 text-danger' : 'bg-gold/10 text-gold',
          )}
        >
          <Icon name={icon} />
        </span>
      )}
      <p className={cn('font-medium text-white', compact ? 'text-base' : 'text-lg')}>{title}</p>
      {description && <div className="max-w-md text-sm text-mist">{description}</div>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

/** Nothing to show yet — always point to the next useful action. */
export function EmptyState({ icon = 'sparkle', ...props }: StateProps) {
  return <StateFrame tone="empty" icon={icon} {...props} />;
}

export interface ErrorStateProps extends Omit<StateProps, 'title' | 'description'> {
  title?: string;
  error?: unknown;
  description?: ReactNode;
  onRetry?: () => void;
}

/** Plain-language failure with a way forward. Never shows raw error codes. */
export function ErrorState({ title = 'This didn’t load', error, description, onRetry, action, ...rest }: ErrorStateProps) {
  return (
    <StateFrame
      tone="error"
      icon="error"
      title={title}
      description={description ?? toUserMessage(error)}
      action={
        action ??
        (onRetry && (
          <Button variant="secondary" size="sm" leadingIcon="retry" onClick={onRetry}>
            Try again
          </Button>
        ))
      }
      {...rest}
    />
  );
}
