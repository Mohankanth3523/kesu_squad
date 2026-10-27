import { Badge, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Badge as BadgeT } from '@/types/domain';

export function BadgeIcon({ id }: { id: BadgeT['id'] }) {
  const icon = id === 'legend' ? 'crown' : id === 'first_contribution' ? 'sparkle' : 'medal';
  return (
    <span className="grid size-7 place-items-center rounded-full bg-gold/12 text-gold">
      <Icon name={icon} size="sm" />
    </span>
  );
}

export function BadgeRow({ badges, compact, className }: { badges: BadgeT[]; compact?: boolean; className?: string }) {
  if (!badges.length) return null;
  const shown = compact ? badges.slice(-2) : badges;
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {shown.map((b) => (
        <Badge key={b.id} tone={b.id === 'legend' ? 'gold' : 'outline'} icon={b.id === 'legend' ? 'crown' : 'medal'}>
          {b.name}
        </Badge>
      ))}
      {compact && badges.length > shown.length && <span className="sr-only">and {badges.length - shown.length} more badges</span>}
    </div>
  );
}
