import { cn } from '@/lib/cn';
import { Icon } from './Icon';

export function Spinner({ label = 'Loading', className }: { label?: string; className?: string }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-mist', className)}>
      <Icon name="loading" className="text-gold" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
