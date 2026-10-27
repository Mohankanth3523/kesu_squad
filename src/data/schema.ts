import type {
  AmaAnswerType,
  AmaStatus,
  BookCondition,
  ContentStatus,
  ConversationKind,
  Course,
  DonationRequestStatus,
  ListingPhoto,
  ListingStatus,
  PostCategory,
  ReportReason,
  ReportTarget,
  UserRole,
  Video,
} from '@/types/domain';

/**
 * Normalised mock records, shaped like the Postgres tables in docs/DATABASE_SCHEMA.md.
 * The mock services join these into domain types, as Supabase queries will.
 */
export interface DbUser {
  id: string;
  displayName: string;
  course?: Course;
  role: UserRole;
  isGuest: boolean;
  joinedAt: string;
  showOnHonourBoard: boolean;
}

export type DbVideo = Video;

export interface DbPost {
  id: string;
  authorId: string;
  title: string;
  body: string;
  category: PostCategory;
  createdAt: string;
  editedAt?: string;
  videoId?: string;
  status: ContentStatus;
  /** Upvotes from fictional members before the prototype started. */
  baseScore: number;
}

export interface DbComment {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  body: string;
  createdAt: string;
  editedAt?: string;
  status: ContentStatus;
  baseScore: number;
}

export interface DbVote {
  userId: string;
  targetType: 'post' | 'comment';
  targetId: string;
}

export interface DbAma {
  id: string;
  askerId: string;
  body: string;
  status: AmaStatus;
  createdAt: string;
  answeredAt?: string;
  answerType?: AmaAnswerType;
  answerText?: string;
  answerVideoId?: string;
  answerPostId?: string;
}

interface DbBookBase {
  id: string;
  ownerId: string;
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
  city?: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DbSaleListing extends DbBookBase {
  type: 'sale';
  originalPrice: number;
  askingPrice: number;
  maxAllowedPrice: number;
  pricingRuleLabel: string;
}

export interface DbDonationListing extends DbBookBase {
  type: 'donation';
  quantity: number;
  donorCoversShipping: boolean;
}

export type DbListing = DbSaleListing | DbDonationListing;

export interface DbConversation {
  id: string;
  kind: ConversationKind;
  listingId: string;
  initiatorId: string;
  ownerId: string;
  createdAt: string;
}

export interface DbParticipantState {
  conversationId: string;
  userId: string;
  lastReadAt: string;
  blocked: boolean;
}

export interface DbMessage {
  id: string;
  conversationId: string;
  senderId: string | null;
  body: string;
  kind: 'user' | 'system';
  createdAt: string;
  localOnly?: boolean;
}

export interface DbDonationRequest {
  id: string;
  listingId: string;
  requesterId: string;
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

/** Ledger behind the Honour Board: one row per completed donation. */
export interface DbCompletion {
  id: string;
  requestId: string | null;
  donorId: string;
  booksCount: number;
  completedAt: string;
}

export interface DbReport {
  id: string;
  reporterId: string;
  targetType: ReportTarget;
  targetId: string;
  reason: ReportReason;
  details?: string;
  createdAt: string;
}

export interface MockDatabase {
  version: number;
  users: DbUser[];
  videos: DbVideo[];
  posts: DbPost[];
  comments: DbComment[];
  votes: DbVote[];
  ama: DbAma[];
  listings: DbListing[];
  conversations: DbConversation[];
  participants: DbParticipantState[];
  messages: DbMessage[];
  donationRequests: DbDonationRequest[];
  completions: DbCompletion[];
  reports: DbReport[];
}
