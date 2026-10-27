import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';
import { ToastContext, type ToastApi, type ToastOptions, type ToastTone } from './toast-context';

interface ToastItem extends Required<Pick<ToastOptions, 'title' | 'tone' | 'duration'>> {
  id: string;
  description?: string;
}

const toneIcon: Record<ToastTone, IconName> = { success: 'success', error: 'error', info: 'info' };
const toneColor: Record<ToastTone, string> = { success: 'text-success', error: 'text-danger', info: 'text-champagne' };

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback((options: ToastOptions) => {
    const id = `toast-${++counter}`;
    const tone = options.tone ?? 'info';
    const duration = options.duration ?? (tone === 'error' ? 8000 : 4500);
    // Keep at most four on screen; oldest leaves first.
    setToasts((list) => [...list.slice(-3), { id, tone, duration, title: options.title, description: options.description }]);
    return id;
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      dismiss,
      success: (title, description) => show({ title, description, tone: 'success' }),
      error: (title, description) => show({ title, description, tone: 'error' }),
      info: (title, description) => show({ title, description, tone: 'info' }),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 md:right-6 md:bottom-6 md:left-auto md:items-end"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);
  const startedAt = useRef(0);

  useEffect(() => {
    if (paused) return;
    startedAt.current = Date.now();
    const timer = window.setTimeout(onDismiss, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      role={toast.tone === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-surface)] border border-line-strong bg-charcoal-high py-3.5 pr-2 pl-4"
    >
      <Icon name={toneIcon[toast.tone]} className={cn('mt-0.5', toneColor[toast.tone])} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-sm text-mist">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-white"
      >
        <Icon name="close" size="sm" />
      </button>
    </motion.div>
  );
}
