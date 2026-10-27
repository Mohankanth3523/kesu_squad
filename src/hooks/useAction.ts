import { useCallback, useRef, useState } from 'react';
import { useToast } from '@/components/ui';
import { ServiceError, toUserMessage } from '@/types/service';

/**
 * Runs a service mutation with a pending flag and consistent error toasts.
 * Validation errors with field details are returned to the caller instead of toasted.
 */
export function useAction<A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
  options: { errorTitle?: string; onSuccess?: (result: R) => void } = {},
) {
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const ref = useRef({ action, options });
  ref.current = { action, options };

  const run = useCallback(
    async (...args: A): Promise<R | undefined> => {
      setPending(true);
      setFieldErrors({});
      try {
        const result = await ref.current.action(...args);
        ref.current.options.onSuccess?.(result);
        return result;
      } catch (error) {
        if (error instanceof ServiceError && error.code === 'validation' && error.fieldErrors && Object.keys(error.fieldErrors).length) {
          setFieldErrors(error.fieldErrors);
        } else {
          toast.error(ref.current.options.errorTitle ?? 'That didn’t work', toUserMessage(error));
        }
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [toast],
  );

  return { run, pending, fieldErrors, setFieldErrors };
}
