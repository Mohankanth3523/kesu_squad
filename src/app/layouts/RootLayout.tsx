import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { OfflineBanner, PrototypeBanner } from '@/components/layout/Banners';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { PageLoader, ScrollToTop } from '@/components/layout/RouteFeedback';

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-[70] rounded-full bg-gold px-4 py-2 font-medium text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <PrototypeBanner />
      <OfflineBanner />
      <Header />
      <main id="main" className="flex-1 pb-20 lg:pb-0" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
