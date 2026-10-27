import type { ReactNode } from 'react';
import { ButtonLink, ErrorState } from '@/components/ui';
import type { QueryResult } from '@/hooks/useAsync';
import { ServiceError } from '@/types/service';

/** Renders the right state for a query: loading skeleton, not-found, error with retry, empty, or content. */
export function Loadable<T>({
  query,
  skeleton,
  empty,
  isEmpty,
  notFound,
  compactError,
  children,
}: {
  query: QueryResult<T>;
  skeleton: ReactNode;
  empty?: ReactNode;
  isEmpty?: (data: T) => boolean;
  notFound?: { title: string; description: string; backTo: string; backLabel: string };
  compactError?: boolean;
  children: (data: T) => ReactNode;
}) {
  if (query.status === 'loading') return <>{skeleton}</>;
  if (query.status === 'error') {
    if (notFound && query.error instanceof ServiceError && query.error.code === 'not_found') {
      return (
        <ErrorState
          title={notFound.title}
          description={notFound.description}
          action={<ButtonLink to={notFound.backTo} variant="secondary" size="sm" leadingIcon="back">{notFound.backLabel}</ButtonLink>}
          className="my-10"
        />
      );
    }
    return <ErrorState error={query.error} onRetry={query.retry} compact={compactError} />;
  }
  if (empty && isEmpty?.(query.data)) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
