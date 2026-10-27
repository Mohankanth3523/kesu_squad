import type { FieldErrors } from '@/domain/validation';
import type {
  AmaQuestion,
  BookCondition,
  Comment,
  CommentNode,
  ConversationSummary,
  Course,
  DonationListing,
  DonationRequest,
  DonorStanding,
  ListingPhoto,
  ListingStatus,
  MemberProfile,
  Message,
  Post,
  PostCategory,
  PostSort,
  PostSummary,
  ReportReason,
  ReportTarget,
  SaleListing,
  SessionUser,
  UserRole,
  Video,
  VideoPlatform,
} from '@/types/domain';

/**
 * Service contracts — the only data API the UI is allowed to use.
 * Milestone A: implemented in services/mock (browser-only sample data).
 * Milestone B: implemented with Supabase (Auth, Postgres + RLS, Storage, Realtime).
 *
 * Every method rejects with a ServiceError (types/service.ts) so UI error
 * handling is identical for both implementations.
 */

// Auth -------------------------------------------------------------------
export interface AuthService {
  /** Current identity, or null for visitors. Synchronous so the UI can render immediately. */
  getCurrentUser(): SessionUser | null;
  /** Called whenever the identity changes (sign-in, sign-out, profile update). */
  onChange(listener: (user: SessionUser | null) => void): () => void;
  /** PROTOTYPE ONLY: sign in as a built-in demo account. Removed in Milestone B. */
  signInAsDemo(role: Extract<UserRole, 'member' | 'admin'>): Promise<SessionUser>;
  /** PROTOTYPE ONLY: create a local demo profile. No email or password is stored. */
  createDemoProfile(input: { displayName: string; course?: Course }): Promise<SessionUser>;
  continueAsGuest(): Promise<SessionUser>;
  signOut(): Promise<void>;
  updateProfile(input: { displayName?: string; course?: Course | null; showOnHonourBoard?: boolean }): Promise<SessionUser>;
}

// Content ----------------------------------------------------------------
export interface ContentService {
  listVideos(options?: { platform?: VideoPlatform | 'vertical'; limit?: number }): Promise<Video[]>;
  getVideo(id: string): Promise<Video>;
}

// Community --------------------------------------------------------------
export interface PostQuery {
  sort?: PostSort;
  category?: PostCategory;
  q?: string;
  authorId?: string;
  limit?: number;
  offset?: number;
}

export interface CommunityService {
  listPosts(query?: PostQuery): Promise<{ items: PostSummary[]; total: number }>;
  getPost(id: string): Promise<Post>;
  createPost(input: { title: string; body: string; category: PostCategory; videoId?: string }): Promise<Post>;
  updatePost(id: string, input: { title: string; body: string; category: PostCategory }): Promise<Post>;
  deletePost(id: string): Promise<void>;
  listComments(postId: string): Promise<CommentNode[]>;
  addComment(input: { postId: string; parentId: string | null; body: string }): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
  /** Toggles the viewer's upvote. Returns the new score and state. */
  toggleUpvote(target: 'post' | 'comment', id: string): Promise<{ score: number; viewerHasUpvoted: boolean }>;
}

// Ask Me Anything --------------------------------------------------------
export interface AmaService {
  listAnswered(): Promise<AmaQuestion[]>;
  listMine(): Promise<AmaQuestion[]>;
  submit(body: string): Promise<AmaQuestion>;
}

// Books (sale listings) --------------------------------------------------
export type EditionFilter = 'any' | 'current' | 'older';
export type BookSort = 'newest' | 'price_asc' | 'price_desc';

export interface BookQuery {
  q?: string;
  course?: Course;
  subject?: string;
  conditions?: BookCondition[];
  edition?: EditionFilter;
  minPrice?: number;
  maxPrice?: number;
  sort?: BookSort;
}

export interface BookInput {
  title: string;
  author: string;
  editionLabel: string;
  isCurrentEdition: boolean;
  publicationYear: number;
  subject: string;
  course: Course[];
  condition: BookCondition;
  description?: string;
  city?: string;
  photos: ListingPhoto[];
}

export interface SaleInput extends BookInput {
  originalPrice: number;
  askingPrice: number;
}

export interface DonationInput extends BookInput {
  quantity: number;
  donorCoversShipping: boolean;
}

export interface BooksService {
  search(query?: BookQuery): Promise<SaleListing[]>;
  listRecent(options?: { limit?: number }): Promise<SaleListing[]>;
  get(id: string): Promise<SaleListing>;
  listMine(): Promise<SaleListing[]>;
  create(input: SaleInput): Promise<SaleListing>;
  update(id: string, input: SaleInput): Promise<SaleListing>;
  setStatus(id: string, status: Extract<ListingStatus, 'available' | 'reserved' | 'sold' | 'withdrawn'>): Promise<SaleListing>;
}

// Donations ----------------------------------------------------------------
export interface DonationQuery {
  q?: string;
  course?: Course;
  subject?: string;
  conditions?: BookCondition[];
  donorCoversShipping?: boolean;
  sort?: 'newest' | 'oldest';
}

export interface DonationsService {
  search(query?: DonationQuery): Promise<DonationListing[]>;
  listAvailable(options?: { limit?: number }): Promise<DonationListing[]>;
  get(id: string): Promise<DonationListing>;
  listMine(): Promise<DonationListing[]>;
  create(input: DonationInput): Promise<DonationListing>;
  update(id: string, input: DonationInput): Promise<DonationListing>;
  withdraw(id: string): Promise<DonationListing>;
  /** Requests on the viewer's own donation listings. */
  listIncomingRequests(): Promise<DonationRequest[]>;
  /** Requests the viewer has made. */
  listMyRequests(): Promise<DonationRequest[]>;
  /** The viewer's request for a listing, if any. */
  getMyRequestFor(listingId: string): Promise<DonationRequest | null>;
  request(input: { listingId: string; message: string; booksRequested: number }): Promise<DonationRequest>;
  accept(requestId: string, terms: { courierCharge?: number; donorCoversShipping: boolean }): Promise<DonationRequest>;
  decline(requestId: string): Promise<DonationRequest>;
  withdrawRequest(requestId: string): Promise<DonationRequest>;
  cancel(requestId: string, reason?: string): Promise<DonationRequest>;
  /** Donor confirms the book was sent. */
  markSent(requestId: string): Promise<DonationRequest>;
  /** Recipient confirms the book arrived. Completion needs both confirmations (OQ-29 default). */
  confirmReceived(requestId: string): Promise<DonationRequest>;
  /** PROTOTYPE ONLY: stands in for the recipient's confirmation so the Honour Board flow can be tried end to end. */
  simulateRecipientConfirmation(requestId: string): Promise<DonationRequest>;
}

// Messaging ------------------------------------------------------------------
export interface MessagingService {
  listConversations(): Promise<ConversationSummary[]>;
  /** Rejects with not_found for conversations the viewer isn't part of. */
  getConversation(id: string): Promise<ConversationSummary>;
  listMessages(conversationId: string): Promise<Message[]>;
  sendMessage(conversationId: string, body: string): Promise<Message>;
  /** Express interest in a sale listing: opens (or reuses) the viewer's private conversation with the seller. */
  startSaleConversation(listingId: string, firstMessage: string): Promise<ConversationSummary>;
  findConversationForListing(listingId: string): Promise<ConversationSummary | null>;
  markRead(conversationId: string): Promise<void>;
  setBlocked(conversationId: string, blocked: boolean): Promise<void>;
  unreadCount(): Promise<number>;
}

// Honour Board & profiles ------------------------------------------------------
export interface HonourService {
  listStandings(options?: { limit?: number }): Promise<DonorStanding[]>;
  getMemberProfile(displayName: string): Promise<MemberProfile>;
}

// Search -----------------------------------------------------------------------
export interface SearchResults {
  books: SaleListing[];
  donations: DonationListing[];
  posts: PostSummary[];
  videos: Video[];
}

export interface SearchService {
  searchAll(q: string): Promise<SearchResults>;
}

// Reports ----------------------------------------------------------------------
export interface ReportsService {
  submit(input: { targetType: ReportTarget; targetId: string; reason: ReportReason; details?: string }): Promise<void>;
}

// Prototype tools --------------------------------------------------------------
export interface PrototypeService {
  /** Restore all sample data to its original state. */
  reset(): void;
}

export interface Services {
  auth: AuthService;
  content: ContentService;
  community: CommunityService;
  ama: AmaService;
  books: BooksService;
  donations: DonationsService;
  messaging: MessagingService;
  honour: HonourService;
  search: SearchService;
  reports: ReportsService;
  prototype: PrototypeService;
  /** Notifies when any data the UI shows may have changed (mock: local writes; Supabase: realtime). */
  onDataChange(listener: () => void): () => void;
}

export type { FieldErrors };
