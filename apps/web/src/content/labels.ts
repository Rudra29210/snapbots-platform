import type { EnquiryStatus } from '@/schemas/forms';

/** Customer- and staff-facing labels for record statuses (enquiries, partnerships, tickets). */
export const RECORD_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'Received',
  in_review: 'In review',
  responded: 'Responded',
  closed: 'Closed',
};

export const recordStatusLabel = (s: EnquiryStatus): string => RECORD_STATUS_LABELS[s];
