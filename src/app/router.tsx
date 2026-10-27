import { lazy, type ComponentType } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { NotFound, RouteError } from '@/components/layout/RouteFeedback';
import { ADMIN_NAV, DASHBOARD_NAV } from '@/lib/nav';
import { paths } from '@/lib/routes';
import IntroPage, { IntroGate } from '@/pages/IntroPage';
import { RequireIdentity, RequireMember, RequireRole } from './guards';
import { RootLayout } from './layouts/RootLayout';
import { SideNavLayout } from './layouts/SideNavLayout';

/** Code-split each page; RootLayout's <Suspense> shows a skeleton while it loads. */
function page(load: () => Promise<{ default: ComponentType }>) {
  const Page = lazy(load);
  return <Page />;
}

/**
 * Every approved page from docs/PRODUCT_REQUIREMENTS.md §3.2.
 * Ask Me Anything sits under Community (OQ-07 default) and keeps its own URL.
 */
const routes: RouteObject[] = [
  // Intro has no site chrome.
  { path: paths.intro, element: <IntroGate />, errorElement: <RouteError /> },
  { path: paths.welcome, element: <IntroPage />, errorElement: <RouteError /> },

  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { path: paths.home, element: page(() => import('@/pages/HomePage')) },

      // Content
      { path: paths.videos, element: page(() => import('@/pages/content/VideosPage')) },
      { path: '/videos/:videoId', element: page(() => import('@/pages/content/VideoDetailPage')) },
      { path: paths.ama, element: page(() => import('@/pages/content/AmaPage')) },

      // Community
      { path: paths.community, element: page(() => import('@/pages/community/CommunityPage')) },
      { path: '/community/posts/:postId', element: page(() => import('@/pages/community/PostDetailPage')) },
      {
        element: <RequireMember />,
        children: [
          { path: paths.newPost, element: page(() => import('@/pages/community/PostEditorPage')) },
          { path: '/community/posts/:postId/edit', element: page(() => import('@/pages/community/PostEditorPage')) },
        ],
      },

      // Marketplace
      { path: paths.books, element: page(() => import('@/pages/books/BooksPage')) },
      { path: '/books/:listingId', element: page(() => import('@/pages/books/BookDetailPage')) },
      { path: paths.sell, element: <RequireMember>{page(() => import('@/pages/books/SellPage'))}</RequireMember> },

      // Donations & Honour Board
      { path: paths.donate, element: page(() => import('@/pages/donations/DonatePage')) },
      { path: paths.newDonation, element: <RequireMember>{page(() => import('@/pages/donations/DonationEditorPage'))}</RequireMember> },
      { path: '/donate/:listingId', element: page(() => import('@/pages/donations/DonationDetailPage')) },
      { path: paths.honourBoard, element: page(() => import('@/pages/donations/HonourBoardPage')) },

      // Inbox (guests or members)
      {
        element: <RequireIdentity />,
        children: [
          { path: paths.inbox, element: page(() => import('@/pages/inbox/InboxPage')) },
          { path: '/inbox/:conversationId', element: page(() => import('@/pages/inbox/ConversationPage')) },
        ],
      },

      // Search & profiles
      { path: paths.search, element: page(() => import('@/pages/info/SearchPage')) },
      { path: '/u/:displayName', element: page(() => import('@/pages/info/ProfilePage')) },

      // Auth
      { path: paths.login, element: page(() => import('@/pages/auth/LoginPage')) },
      { path: paths.signup, element: page(() => import('@/pages/auth/SignupPage')) },
      { path: paths.forgotPassword, element: page(() => import('@/pages/auth/ForgotPasswordPage')) },
      { path: paths.authCallback, element: page(() => import('@/pages/auth/AuthCallbackPage')) },
      { path: paths.guestResume, element: page(() => import('@/pages/auth/GuestResumePage')) },

      // Dashboard (members)
      {
        path: paths.dashboard,
        element: (
          <RequireMember>
            <SideNavLayout label="Dashboard" items={DASHBOARD_NAV} endExact={paths.dashboard} />
          </RequireMember>
        ),
        children: [
          { index: true, element: page(() => import('@/pages/dashboard/DashboardOverviewPage')) },
          { path: 'listings', element: page(() => import('@/pages/dashboard/MyListingsPage')) },
          { path: 'listings/:listingId/edit', element: page(() => import('@/pages/dashboard/EditListingPage')) },
          { path: 'donations', element: page(() => import('@/pages/dashboard/MyDonationsPage')) },
          { path: 'donations/:listingId/edit', element: page(() => import('@/pages/dashboard/EditDonationPage')) },
          { path: 'activity', element: page(() => import('@/pages/dashboard/ActivityPage')) },
          { path: 'settings', element: page(() => import('@/pages/dashboard/SettingsPage')) },
        ],
      },

      // Admin
      {
        path: paths.admin,
        element: (
          <RequireRole role="moderator">
            <SideNavLayout label="Admin" items={ADMIN_NAV} />
          </RequireRole>
        ),
        children: [
          { index: true, element: <Navigate to={paths.adminReports} replace /> },
          { path: 'reports', element: page(() => import('@/pages/admin/AdminReportsPage')) },
          { path: 'videos', element: <RequireRole role="admin">{page(() => import('@/pages/admin/AdminVideosPage'))}</RequireRole> },
          { path: 'ama', element: <RequireRole role="admin">{page(() => import('@/pages/admin/AdminAmaPage'))}</RequireRole> },
          { path: 'users', element: <RequireRole role="admin">{page(() => import('@/pages/admin/AdminUsersPage'))}</RequireRole> },
          { path: 'pricing', element: <RequireRole role="admin">{page(() => import('@/pages/admin/AdminPricingPage'))}</RequireRole> },
        ],
      },

      // Information
      { path: paths.rules, element: page(() => import('@/pages/info/RulesPage')) },
      { path: paths.guidelines, element: page(() => import('@/pages/info/GuidelinesPage')) },
      { path: paths.terms, element: page(() => import('@/pages/info/TermsPage')) },
      { path: paths.privacy, element: page(() => import('@/pages/info/PrivacyPage')) },
      { path: paths.about, element: page(() => import('@/pages/info/AboutPage')) },

      // Design system (Milestone A review aid; removed for production in Milestone C)
      { path: paths.designSystem, element: page(() => import('@/pages/dev/DesignSystemPage')) },

      { path: '*', element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
