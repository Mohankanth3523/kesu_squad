import {
  Activity,
  ArrowBigUp,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  CircleUser,
  Clapperboard,
  Crown,
  Ellipsis,
  ExternalLink,
  Eye,
  EyeOff,
  Flag,
  Gift,
  HeartHandshake,
  House,
  ImagePlus,
  IndianRupee,
  Info,
  Inbox,
  LayoutDashboard,
  ListFilter,
  LoaderCircle,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Medal,
  Menu,
  MessageCircle,
  MessagesSquare,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  Smartphone,
  Sparkles,
  Trash2,
  TriangleAlert,
  Trophy,
  Truck,
  Users,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Kesh Squad icon system.
 * All icons are referenced by a semantic name so the same idea always uses the
 * same glyph (e.g. "donate" is HeartHandshake everywhere). Lucide only.
 */
const REGISTRY = {
  // Navigation
  home: House,
  videos: Clapperboard,
  community: MessagesSquare,
  books: BookOpen,
  donate: HeartHandshake,
  honour: Trophy,
  inbox: Inbox,
  search: Search,
  dashboard: LayoutDashboard,
  user: CircleUser,
  users: Users,
  settings: Settings,
  activity: Activity,
  ama: CircleHelp,
  menu: Menu,
  close: X,
  back: ArrowLeft,
  next: ChevronRight,
  expand: ChevronDown,
  more: Ellipsis,
  external: ExternalLink,
  login: LogIn,
  logout: LogOut,
  // Actions
  add: Plus,
  edit: Pencil,
  delete: Trash2,
  send: Send,
  upvote: ArrowBigUp,
  comment: MessageCircle,
  flag: Flag,
  filter: ListFilter,
  upload: ImagePlus,
  retry: RefreshCw,
  play: Play,
  show: Eye,
  hide: EyeOff,
  check: Check,
  // Status & meaning
  success: CircleCheck,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
  loading: LoaderCircle,
  offline: WifiOff,
  lock: Lock,
  shield: Shield,
  verified: BadgeCheck,
  // Domain
  rupee: IndianRupee,
  courier: Truck,
  free: Gift,
  location: MapPin,
  mail: Mail,
  short: Smartphone,
  crown: Crown,
  medal: Medal,
  sparkle: Sparkles,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof REGISTRY;

const SIZE = { xs: 14, sm: 16, md: 20, lg: 24, xl: 32 } as const;
export type IconSize = keyof typeof SIZE;

export interface IconProps extends Omit<ComponentProps<'svg'>, 'ref'> {
  name: IconName;
  size?: IconSize;
  /** Accessible label. Omit for decorative icons (then hidden from screen readers). */
  label?: string;
}

export function Icon({ name, size = 'md', label, className, ...rest }: IconProps) {
  const Glyph = REGISTRY[name];
  return (
    <Glyph
      width={SIZE[size]}
      height={SIZE[size]}
      strokeWidth={1.75}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
      className={cn('shrink-0', name === 'loading' && 'animate-spin', className)}
      {...rest}
    />
  );
}
