import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/** Read/write URL search params as simple filters. Empty values are removed; history is replaced, not pushed. */
export function useQueryParams() {
  const [params, setParams] = useSearchParams();
  const get = useCallback((key: string) => params.get(key) ?? '', [params]);
  const getAll = useCallback((key: string) => params.get(key)?.split(',').filter(Boolean) ?? [], [params]);
  const set = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(updates)) {
            const value = Array.isArray(v) ? v.join(',') : v;
            if (value) next.set(k, value);
            else next.delete(k);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );
  return { params, get, getAll, set };
}
