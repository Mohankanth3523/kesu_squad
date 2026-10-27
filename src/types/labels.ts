import type {
  AmaAnswerType,
  AmaStatus,
  BookCondition,
  DonationRequestStatus,
  ListingStatus,
  PostSort,
  ReportReason,
  VideoPlatform,
} from './domain';

export const CONDITION_LABEL: Record<BookCondition, string> = {
  like_new: 'Like new',
  good: 'Good',
  fair: 'Fair',
  heavily_used: 'Heavily used',
};

export const CONDITION_HINT: Record<BookCondition, string> = {
  like_new: 'No marks, tight spine',
  good: 'Light wear, few or no notes',
  fair: 'Visible wear, some highlighting',
  heavily_used: 'Lots of notes or loose pages',
};

export const PLATFORM_LABEL: Record<VideoPlatform, string> = {
  youtube_video: 'YouTube',
  youtube_short: 'Short',
  instagram_reel: 'Reel',
};

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  donated: 'Donated',
  withdrawn: 'Withdrawn',
};

export const REQUEST_STATUS_LABEL: Record<DonationRequestStatus, string> = {
  pending: 'Waiting for donor',
  accepted: 'Accepted',
  completed: 'Completed',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
  cancelled: 'Cancelled',
};

export const SORT_LABEL: Record<PostSort, string> = {
  popular: 'Popular',
  recent: 'Recent',
  trending: 'Trending',
};

export const AMA_STATUS_LABEL: Record<AmaStatus, string> = {
  submitted: 'Submitted',
  selected: 'Selected for an answer',
  answered: 'Answered',
  not_selected: 'Not selected',
};

export const AMA_ANSWER_LABEL: Record<AmaAnswerType, string> = {
  video: 'Answered in a video',
  short: 'Answered in a Short',
  reel: 'Answered in a Reel',
  post: 'Answered in a post',
  text: 'Answered here',
};

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  spam: 'Spam or advertising',
  scam_or_fraud: 'Scam or suspected fraud',
  harassment: 'Harassment or hate',
  inappropriate: 'Inappropriate content',
  price_rule_violation: 'Price above the allowed maximum',
  charging_for_donation: 'Charging for a donated book',
  other: 'Something else',
};
