import type { ReactNode } from 'react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Card, Icon } from '@/components/ui';
import { useInShell } from '@/app/layouts/shell-context';
import { cn } from '@/lib/cn';

export type Wireframe = 'grid' | 'list' | 'form' | 'thread' | 'table' | 'chat' | 'detail' | 'prose';

export interface PlannedPageProps {
  title: string;
  description: string;
  /** What this page will do, in user terms. */
  planned: string[];
  /** PRD requirement IDs this page covers (docs/PRODUCT_REQUIREMENTS.md). */
  requirements?: string;
  /** Which Milestone A step builds it out. */
  step: string;
  wireframe?: Wireframe;
  actions?: ReactNode;
  above?: ReactNode;
  children?: ReactNode;
  narrow?: boolean;
}

/**
 * Structured placeholder for routes that are wired up but not built yet.
 * Shows the planned layout and scope so the page can be reviewed early.
 */
export function PlannedPage({ title, description, planned, requirements, step, wireframe = 'grid', actions, above, children, narrow }: PlannedPageProps) {
  const inShell = useInShell();
  const body = (
    <>
      <PageHeader title={title} description={description} actions={actions} above={above} compact={inShell} />
      {children}
      <div className={cn('grid gap-6 pb-8', !narrow && (inShell ? 'xl:grid-cols-[1fr_18rem]' : 'lg:grid-cols-[1fr_20rem]'))}>
        <WireframePreview kind={wireframe} />
        <Card tone="gold" className="h-fit">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-medium text-white">Planned for this page</h2>
            <Badge tone="gold">{step}</Badge>
          </div>
          <ul className="mt-4 space-y-2.5">
            {planned.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-mist">
                <Icon name="check" size="sm" className="mt-0.5 text-gold" />
                {item}
              </li>
            ))}
          </ul>
          {requirements && <p className="mt-5 border-t border-line pt-4 text-xs text-muted">Requirements: {requirements}</p>}
        </Card>
      </div>
    </>
  );
  return inShell ? body : <Container size={narrow ? 'narrow' : 'default'}>{body}</Container>;
}

const block = 'rounded-[var(--radius-field)] border border-dashed border-line-strong bg-charcoal/50';

/** Static (non-animated) layout sketch — not a loading state. */
function WireframePreview({ kind }: { kind: Wireframe }) {
  const content = {
    grid: (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className={cn(block, 'aspect-[3/4]')} />
            <div className={cn(block, 'h-3 w-4/5')} />
            <div className={cn(block, 'h-3 w-1/2')} />
          </div>
        ))}
      </div>
    ),
    list: (
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex gap-4">
            <div className={cn(block, 'h-14 w-10 shrink-0')} />
            <div className="flex-1 space-y-2">
              <div className={cn(block, 'h-4 w-3/4')} />
              <div className={cn(block, 'h-3 w-1/2')} />
            </div>
          </div>
        ))}
      </div>
    ),
    form: (
      <div className="space-y-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className={cn(block, 'h-3 w-28')} />
            <div className={cn(block, i === 3 ? 'h-24' : 'h-11')} />
          </div>
        ))}
        <div className={cn(block, 'h-11 w-40 rounded-full')} />
      </div>
    ),
    thread: (
      <div className="space-y-4">
        <div className={cn(block, 'h-28')} />
        {[0, 1, 2, 1, 0].map((depth, i) => (
          <div key={i} style={{ marginLeft: `${depth * 1.5}rem` }} className={cn(block, 'h-16')} />
        ))}
      </div>
    ),
    table: (
      <div className="space-y-2">
        <div className={cn(block, 'h-10')} />
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={cn(block, 'h-12 opacity-80')} />
        ))}
      </div>
    ),
    chat: (
      <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
        <div className="hidden space-y-2 sm:block">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={cn(block, 'h-14')} />
          ))}
        </div>
        <div className="flex min-h-72 flex-col gap-3">
          <div className={cn(block, 'h-14')} />
          <div className={cn(block, 'h-10 w-2/3')} />
          <div className={cn(block, 'ml-auto h-10 w-1/2')} />
          <div className={cn(block, 'h-10 w-3/5')} />
          <div className={cn(block, 'mt-auto h-12 rounded-full')} />
        </div>
      </div>
    ),
    detail: (
      <div className="grid gap-6 sm:grid-cols-[minmax(0,14rem)_1fr]">
        <div className={cn(block, 'aspect-[3/4]')} />
        <div className="space-y-3">
          <div className={cn(block, 'h-7 w-4/5')} />
          <div className={cn(block, 'h-4 w-1/2')} />
          <div className={cn(block, 'h-20')} />
          <div className={cn(block, 'h-11 w-44 rounded-full')} />
        </div>
      </div>
    ),
    prose: (
      <div className="space-y-3">
        {[90, 100, 85, 95, 60, 100, 80].map((w, i) => (
          <div key={i} className={cn(block, 'h-3.5')} style={{ width: `${w}%` }} />
        ))}
      </div>
    ),
  }[kind];

  return (
    <div className="rounded-[var(--radius-surface)] border border-line bg-ink-raised p-5 sm:p-6" aria-hidden="true">
      {content}
    </div>
  );
}
