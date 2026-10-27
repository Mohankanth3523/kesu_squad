import { useCallback, useEffect, useRef, useState } from 'react';
import { services } from '@/services';

export type AsyncState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'success'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: unknown };

export type QueryResult<T> = AsyncState<T> & { retry: () => void; refresh: () => void };

/**
 * Loads data through a service and gives every view the same loading / error / success shape.
 * When `live` is on (default), it quietly refetches whenever service data changes
 * (mock: local writes in any tab; Supabase: realtime events), without flashing a loading state.
 * (A caching library such as TanStack Query is pending approval — OQ-45.)
 */
export function useAsync<T>(load: () => Promise<T>, deps: readonly unknown[] = [], options: { live?: boolean; enabled?: boolean } = {}): QueryResult<T> {
  const { live = true, enabled = true } = options;
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;
  const generation = useRef(0);

  const run = useCallback((quiet: boolean) => {
    const gen = ++generation.current;
    if (!quiet) setState({ status: 'loading' });
    loadRef.current().then(
      (data) => {
        if (gen === generation.current) setState({ status: 'success', data });
      },
      (error: unknown) => {
        // A failed background refresh keeps showing the data we already have.
        if (gen === generation.current) setState((prev) => (quiet && prev.status === 'success' ? prev : { status: 'error', error }));
      },
    );
  }, []);

  useEffect(() => {
    if (!enabled) return;
    run(false);
    return () => {
      generation.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, enabled, ...deps]);

  useEffect(() => {
    if (!live || !enabled) return;
    let timer: number | undefined;
    const unsubscribe = services.onDataChange(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => run(true), 30);
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [live, enabled, run]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const refresh = useCallback(() => run(true), [run]);
  return { ...state, retry, refresh };
}
