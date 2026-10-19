import { z } from 'zod';

/**
 * Shared validation rules. The same schemas are mirrored in Firestore rules
 * (field shape, lengths) and re-checked by the backend, so client validation is
 * a UX convenience, never the only control.
 */
const text = (min: number, max: number, label: string) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

const email = z.string().trim().toLowerCase().email('Please enter a valid email address').max(254);
const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === '' || /^https?:\/\/[^\s]+$/i.test(v), 'Enter a full URL starting with http:// or https://');

/** Honeypot: real users never fill this field. Bots often do. */
const honeypot = z.string().max(0, 'Submission rejected.').optional().default('');

export const ENQUIRY_CATEGORIES = [
  { value: 'general', label: 'General enquiry' },
  { value: 'robotics_project', label: 'Custom robotics or engineering project' },
  { value: 'product', label: 'Product enquiry' },
  { value: 'service', label: 'Service enquiry' },
  { value: 'learning', label: 'Learning & community' },
] as const;
export type EnquiryCategory = (typeof ENQUIRY_CATEGORIES)[number]['value'];

export const enquirySchema = z.object({
  name: text(2, 80, 'Name'),
  email,
  phone: z.string().trim().max(30).regex(/^[+0-9 ()-]*$/, 'Phone may contain digits, spaces, + ( ) and -').optional().default(''),
  company: z.string().trim().max(120).optional().default(''),
  category: z.enum(ENQUIRY_CATEGORIES.map((c) => c.value) as [EnquiryCategory, ...EnquiryCategory[]]),
  subject: text(3, 120, 'Subject'),
  message: text(10, 3000, 'Message'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm you agree to be contacted about this enquiry' }) }),
  website: honeypot,
});
export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryValues = z.output<typeof enquirySchema>;

export const PARTNERSHIP_TYPES = [
  { value: 'sponsor', label: 'Sponsorship' },
  { value: 'institution', label: 'Educational institution' },
  { value: 'collaboration', label: 'Research or product collaboration' },
  { value: 'reseller', label: 'Distribution or reseller' },
] as const;

export const partnershipSchema = z.object({
  organisation: text(2, 120, 'Organisation name'),
  contactName: text(2, 80, 'Contact name'),
  email,
  partnershipType: z.enum(PARTNERSHIP_TYPES.map((p) => p.value) as [string, ...string[]]),
  website: optionalUrl.optional().default(''),
  proposal: text(20, 2000, 'Proposal'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm consent to be contacted' }) }),
  hp_field: honeypot,
});

export const SUPPORT_TOPICS = [
  { value: 'order', label: 'Order or delivery' },
  { value: 'technical', label: 'Technical issue with a product' },
  { value: 'account', label: 'Account or login' },
  { value: 'warranty', label: 'Warranty or return' },
  { value: 'other', label: 'Something else' },
] as const;

export const supportSchema = z.object({
  name: text(2, 80, 'Name'),
  email,
  topic: z.enum(SUPPORT_TOPICS.map((t) => t.value) as [string, ...string[]]),
  orderReference: z.string().trim().max(60).optional().default(''),
  subject: text(3, 120, 'Subject'),
  description: text(20, 3000, 'Description'),
  website: honeypot,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(128),
});

export const registerSchema = z
  .object({
    displayName: text(2, 60, 'Name'),
    email,
    password: z.string().min(8, 'Use at least 8 characters').max(128, 'Use at most 128 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resetSchema = z.object({ email });

export const profileSchema = z.object({
  displayName: text(2, 60, 'Name'),
  company: z.string().trim().max(120).optional().default(''),
});

export const ENQUIRY_STATUSES = ['new', 'in_review', 'responded', 'closed'] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export const adminEnquiryUpdateSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES),
  internalNote: z.string().trim().max(2000).optional().default(''),
});
