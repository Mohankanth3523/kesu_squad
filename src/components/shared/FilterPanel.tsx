import { useState, type ReactNode } from 'react';
import { Button, Icon, Modal } from '@/components/ui';

/**
 * Filters: a sidebar on desktop, a "Filters" button that opens a sheet on phones.
 * The same controls render in both places, driven by URL search params.
 */
export function FilterPanel({ children, activeCount, onClear }: { children: ReactNode; activeCount: number; onClear: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="lg:hidden">
        <Button variant="secondary" leadingIcon="filter" onClick={() => setOpen(true)}>
          Filters{activeCount ? ` (${activeCount})` : ''}
        </Button>
      </div>
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-24 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 font-medium text-white">
              <Icon name="filter" size="sm" className="text-gold" />
              Filters
            </h2>
            {activeCount > 0 && (
              <button type="button" onClick={onClear} className="text-sm text-gold hover:text-champagne hover:underline">
                Clear all
              </button>
            )}
          </div>
          {children}
        </div>
      </aside>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        footer={
          <>
            <Button variant="ghost" onClick={onClear} disabled={!activeCount}>
              Clear all
            </Button>
            <Button onClick={() => setOpen(false)}>Show results</Button>
          </>
        }
      >
        <div className="space-y-6">{children}</div>
      </Modal>
    </>
  );
}

export function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="mb-2 text-sm font-medium text-mist">{title}</legend>
      {children}
    </fieldset>
  );
}
