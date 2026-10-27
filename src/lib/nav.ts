import type { IconName } from '@/components/ui/Icon';
import { paths } from './routes';

export interface NavItem {
  label: string;
  to: string;
  icon: IconName;
}

/** Main navigation, in the order set by C1 §8. */
export const MAIN_NAV: NavItem[] = [
  { label: 'Home', to: paths.home, icon: 'home' },
  { label: 'Videos', to: paths.videos, icon: 'videos' },
  { label: 'Community', to: paths.community, icon: 'community' },
  { label: 'Books', to: paths.books, icon: 'books' },
  { label: 'Donate', to: paths.donate, icon: 'donate' },
  { label: 'Honour Board', to: paths.honourBoard, icon: 'honour' },
];

/** Bottom tab bar on phones (five slots; the rest live in the menu). */
export const MOBILE_TABS: NavItem[] = [
  { label: 'Home', to: paths.home, icon: 'home' },
  { label: 'Videos', to: paths.videos, icon: 'videos' },
  { label: 'Community', to: paths.community, icon: 'community' },
  { label: 'Books', to: paths.books, icon: 'books' },
  { label: 'Donate', to: paths.donate, icon: 'donate' },
];

export const DASHBOARD_NAV: NavItem[] = [
  { label: 'Overview', to: paths.dashboard, icon: 'dashboard' },
  { label: 'My listings', to: paths.dashboardListings, icon: 'books' },
  { label: 'My donations', to: paths.dashboardDonations, icon: 'donate' },
  { label: 'My requests', to: paths.dashboardActivity, icon: 'activity' },
  { label: 'Settings', to: paths.dashboardSettings, icon: 'settings' },
];

export const ADMIN_NAV: NavItem[] = [
  { label: 'Reports', to: paths.adminReports, icon: 'flag' },
  { label: 'Videos', to: paths.adminVideos, icon: 'videos' },
  { label: 'Ask Me Anything', to: paths.adminAma, icon: 'ama' },
  { label: 'Users', to: paths.adminUsers, icon: 'users' },
  { label: 'Pricing rules', to: paths.adminPricing, icon: 'rupee' },
];
