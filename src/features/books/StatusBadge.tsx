import { Badge, type BadgeTone } from '@/components/ui';
import type { DonationRequestStatus, ListingStatus } from '@/types/domain';
import { LISTING_STATUS_LABEL, REQUEST_STATUS_LABEL } from '@/types/labels';

const LISTING_TONE: Record<ListingStatus, BadgeTone> = {
  available: 'success',
  reserved: 'gold',
  sold: 'neutral',
  donated: 'neutral',
  withdrawn: 'outline',
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return <Badge tone={LISTING_TONE[status]}>{LISTING_STATUS_LABEL[status]}</Badge>;
}

const REQUEST_TONE: Record<DonationRequestStatus, BadgeTone> = {
  pending: 'info',
  accepted: 'gold',
  completed: 'success',
  declined: 'outline',
  withdrawn: 'outline',
  cancelled: 'danger',
};

export function RequestStatusBadge({ status }: { status: DonationRequestStatus }) {
  return <Badge tone={REQUEST_TONE[status]}>{REQUEST_STATUS_LABEL[status]}</Badge>;
}
