import type { EnquiryCategory, EnquiryStatus } from '@/schemas/forms';

export type Timestamp = { toDate: () => Date };

/** Documents as stored in Firestore. Server-authoritative fields are typed as Timestamp. */
export interface EnquiryDoc {
  id: string;
  schemaVersion: 1;
  name: string;
  email: string;
  phone: string;
  company: string;
  category: EnquiryCategory;
  subject: string;
  message: string;
  status: EnquiryStatus;
  userId: string | null;
  source: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  internalNote?: string;
}

export interface PartnershipDoc {
  id: string;
  schemaVersion: 1;
  organisation: string;
  contactName: string;
  email: string;
  partnershipType: string;
  website: string;
  proposal: string;
  status: EnquiryStatus;
  userId: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  internalNote?: string;
}

export interface SupportTicketDoc {
  id: string;
  schemaVersion: 1;
  name: string;
  email: string;
  topic: string;
  orderReference: string;
  subject: string;
  description: string;
  status: EnquiryStatus;
  userId: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  internalNote?: string;
}

export interface UserProfileDoc {
  displayName: string;
  company: string;
  email: string;
  createdAt: Timestamp | null;
}

/** Content entries are static, typed, and clearly labelled by status. */
export type ContentStatus = 'live' | 'demonstration' | 'in_development' | 'planned';
