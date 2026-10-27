/**
 * Domain types shared by UI and services. Field names mirror
 * docs/DATABASE_SCHEMA.md (camelCase here, snake_case in Postgres).
 */

export type Course = 'MBBS' | 'BDS';
export type UserRole = 'member' | 'moderator' | 'admin';

export interface PublicProfile {
  id: string;
  displayName: string;
  course?: Course;
}

export interface SessionUser extends PublicProfile {
  role: UserRole;
  isGuest: boolean;
  showOnHonourBoard: boolean;
  joinedAt: string;
}

// Content -------------------------------------------------------------
export type VideoPlatform = 'youtube_video' | 'youtube_short' | 'instagram_reel';

export interface Video {
  id: string;
  platform: VideoPlatform;
  title: string;
  description?: string;
  durationSeconds: number;
  publishedAt: string;
  /** Real URL arrives with OQ-11 (how videos are added). Mock data has none. */
  url?: string;
  /** Deterministic artwork seed for placeholder thumbnails. */
  hue: number;
  /** Community discussion linked to this video, if any (OQ-12). */
  discussionPostId?: string;
}

// Community -----------------------------------------------------------
export const POST_CATEGORIES = ['Videos', 'College life', 'Experiences', 'Random', 'Books'] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];
export type PostSort = 'popular' | 'recent' | 'trending';
export type ContentStatus = 'published' | 'removed_by_author' | 'removed_by_moderator';

export interface PostSummary {
  id: string;
  title: string;
  excerpt: string;
  category: PostCategory;
  author: PublicProfile;
  score: number;
  commentCount: number;
  createdAt: string;
  editedAt?: string;
  videoId?: string;
  /** Whether the current viewer has upvoted (false for visitors). */
  viewerHasUpvoted: boolean;
}

export interface Post extends PostSummary {
  body: string;
  status: ContentStatus;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  author: PublicProfile;
  body: string;
  score: number;
  createdAt: string;
  editedAt?: string;
  status: ContentStatus;
  viewerHasUpvoted: boolean;
}

/** Comment with its replies, for rendering threads. */
export interface CommentNode extends Comment {
  replies: CommentNode[];
}

// Ask Me Anything -----------------------------------------------------
export type AmaStatus = 'submitted' | 'selected' | 'answered' | 'not_selected';
export type AmaAnswerType = 'video' | 'short' | 'reel' | 'post' | 'text';

export interface AmaQuestion {
  id: string;
  body: string;
  asker: PublicProfile;
  status: AmaStatus;
  createdAt: string;
  answeredAt?: string;
  answerType?: AmaAnswerType;
  answerText?: string;
  answerVideoId?: string;
  answerPostId?: string;
}

// Marketplace & donations ---------------------------------------------
export type BookCondition = 'like_new' | 'good' | 'fair' | 'heavily_used';
export type ListingStatus = 'available' | 'reserved' | 'sold' | 'donated' | 'withdrawn';

/** Data URL or remote URL of a listing photo. */
export interface ListingPhoto {
  id: string;
  src: string;
  alt: string;
}

interface BookBase {
  id: string;
  title: string;
  author: string;
  editionLabel: string;
  isCurrentEdition: boolean;
  publicationYear: number;
  subject: string;
  course: Course[];
  condition: BookCondition;
  description?: string;
  photos: ListingPhoto[];
  owner: PublicProfile;
  city?: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SaleListing extends BookBase {
  type: 'sale';
  originalPrice: number;
  askingPrice: number;
  /** Snapshot of the cap when listed (PRC-03). */
  maxAllowedPrice: number;
  pricingRuleLabel: string;
  interestCount: number;
}

export interface DonationListing extends BookBase {
  type: 'donation';
  quantity: number;
  donorCoversShipping: boolean;
  requestCount: number;
}

export type Listing = SaleListing | DonationListing;

export type DonationRequestStatus =
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'declined'
  | 'withdrawn'
  | 'cancelled';

export interface DonationRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  donor: PublicProfile;
  requester: PublicProfile;
  conversationId: string;
  message: string;
  booksRequested: number;
  status: DonationRequestStatus;
  agreedCourierCharge?: number;
  donorCoversShipping?: boolean;
  createdAt: string;
  acceptedAt?: string;
  donorConfirmedAt?: string;
  recipientConfirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

// Messaging -----------------------------------------------------------
export type ConversationKind = 'sale' | 'donation';

export interface ConversationListingContext {
  id: string;
  type: 'sale' | 'donation';
  title: string;
  status: ListingStatus;
  askingPrice?: number;
}

export interface ConversationSummary {
  id: string;
  kind: ConversationKind;
  listing: ConversationListingContext;
  /** The other participant, from the viewer's point of view. */
  counterpart: PublicProfile;
  /** Whether the viewer owns the listing (seller/donor) or started the chat. */
  viewerRole: 'owner' | 'initiator';
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  blockedByViewer: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  body: string;
  kind: 'user' | 'system';
  createdAt: string;
  /** Prototype only: true for messages written in this browser. They are never delivered. */
  localOnly?: boolean;
}

// Honour Board --------------------------------------------------------
export type BadgeId = 'first_contribution' | 'five_books' | 'ten_books' | 'twenty_five_books' | 'legend';

export interface Badge {
  id: BadgeId;
  name: string;
  threshold: number;
}

export interface DonorStanding {
  rank: number;
  donor: PublicProfile;
  booksDonated: number;
  badges: Badge[];
  lastDonationAt: string;
}

export interface MemberProfile {
  profile: PublicProfile;
  joinedAt: string;
  booksDonated: number;
  rank: number | null;
  badges: Badge[];
  showOnHonourBoard: boolean;
  activeListings: Listing[];
}

// Reports -------------------------------------------------------------
export type ReportTarget = 'post' | 'comment' | 'listing' | 'user' | 'conversation';
export type ReportReason =
  | 'spam'
  | 'scam_or_fraud'
  | 'harassment'
  | 'inappropriate'
  | 'price_rule_violation'
  | 'charging_for_donation'
  | 'other';
