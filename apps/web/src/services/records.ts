import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebase } from '@/lib/firebase';
import { AppError } from '@/lib/errors';
import { company } from '@/content/site';
import { enquirySchema, partnershipSchema, supportSchema, type EnquiryInput } from '@/schemas/forms';
import { z } from 'zod';

/**
 * Public and customer submissions. Each record:
 *  - gets a client-generated UUID document id (create-only rules prevent overwrite,
 *    so a retried submission cannot duplicate or replace an existing record);
 *  - never supplies its own timestamps (serverTimestamp is enforced by rules);
 *  - never supplies status (rules require the initial status to be "new");
 *  - strips the honeypot field before it reaches Firestore.
 */

export type RecordCollection = 'enquiries' | 'partnerships' | 'supportTickets';

const newId = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export const UNAVAILABLE_MESSAGE = `Online submissions are not connected in this environment. Please email ${company.email} directly.`;

async function persist(
  col: RecordCollection,
  payload: Record<string, unknown>,
  userId: string | null,
): Promise<string> {
  const fb = getFirebase();
  if (!fb) throw new AppError('unavailable', UNAVAILABLE_MESSAGE);

  const id = newId();
  await setDoc(doc(collection(fb.db, col), id), {
    ...payload,
    schemaVersion: 1,
    status: 'new',
    userId,
    source: 'website',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

function zodMessage(err: z.ZodError): AppError {
  return new AppError('validation', err.issues[0]?.message ?? 'Please check the form and try again.');
}

export async function submitEnquiry(input: EnquiryInput, userId: string | null): Promise<string> {
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) throw zodMessage(parsed.error);
  const { website: _hp, ...data } = parsed.data;
  void _hp;
  if (parsed.data.website) throw new AppError('validation', 'Submission rejected.');
  return persist('enquiries', { ...data, phone: data.phone ?? '', company: data.company ?? '' }, userId);
}

export async function submitPartnership(input: unknown, userId: string | null): Promise<string> {
  const parsed = partnershipSchema.safeParse(input);
  if (!parsed.success) throw zodMessage(parsed.error);
  if (parsed.data.hp_field) throw new AppError('validation', 'Submission rejected.');
  const { hp_field: _hp, consent: _c, ...data } = parsed.data;
  void _hp; void _c;
  return persist('partnerships', { ...data, website: data.website ?? '' }, userId);
}

export async function submitSupportTicket(input: unknown, userId: string | null): Promise<string> {
  const parsed = supportSchema.safeParse(input);
  if (!parsed.success) throw zodMessage(parsed.error);
  if (parsed.data.website) throw new AppError('validation', 'Submission rejected.');
  const { website: _hp, ...data } = parsed.data;
  void _hp;
  return persist('supportTickets', { ...data, orderReference: data.orderReference ?? '' }, userId);
}

/** Customer's own records only. Rules and the `where userId ==` filter both enforce this. */
export async function listOwnRecords<T extends { id: string }>(col: RecordCollection, uid: string): Promise<T[]> {
  const fb = getFirebase();
  if (!fb) throw new AppError('unavailable', UNAVAILABLE_MESSAGE);
  const { getDocs, query, where, orderBy, limit } = await import('firebase/firestore');
  const snap = await getDocs(
    query(collection(fb.db, col), where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(25)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as unknown as T);
}
