import { useEffect } from 'react';
import { isRouteErrorResponse, useLocation, useRouteError } from 'react-router';
import { ButtonLink, Button, Icon, LoadingRegion, Skeleton } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { paths } from '@/lib/routes';
import { Container } from './Container';

/** Shown while a lazily loaded page chunk downloads. */
export function PageLoader() {
  return (
    <Container className="py-12">
      <LoadingRegion label="Loading page" className="space-y-4">
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="hidden h-48 lg:block" />
        </div>
      </LoadingRegion>
    </Container>
  );
}

export function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <Container className="py-20 text-center sm:py-28">
      <p className="font-display text-display-lg text-gold">404</p>
      <h1 className="mt-4 font-display text-3xl text-white">This page doesn’t exist</h1>
      <p className="mx-auto mt-3 max-w-md text-mist">The link may be broken, or the listing or post may have been removed.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to={paths.home}>Go to home</ButtonLink>
        <ButtonLink to={paths.search} variant="secondary" leadingIcon="search">
          Search Kesh Squad
        </ButtonLink>
      </div>
    </Container>
  );
}

/** Router-level error boundary. Never shows stack traces to users. */
export function RouteError() {
  const error = useRouteError();
  useDocumentTitle('Something went wrong');
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  if (import.meta.env.DEV) console.error(error);
  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-danger/10 text-danger">
          <Icon name="error" size="lg" />
        </span>
        <h1 className="mt-5 font-display text-3xl text-white">Something went wrong</h1>
        <p className="mt-3 text-mist">This page hit an unexpected problem. Reloading usually fixes it.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button leadingIcon="retry" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <ButtonLink to={paths.home} variant="secondary" reloadDocument>
            Go to home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}
