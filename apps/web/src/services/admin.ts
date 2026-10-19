import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getFirebase } from '@/lib/firebase';
import { AppError } from '@/lib/errors';
import { UNAVAILABLE_MESSAGE, type RecordCollection } from './records';
import { adminEnquiryUpdateSchema, type EnquiryStatus } from '@/schemas/forms';

const PAGE_SIZE = 25;

function requireFirebase() {
  const fb = getFirebase();
  if (!fb) throw new AppError('unavailable', UNAVAILABLE_MESSAGE);
  return fb;
}

/** Bounded, paginated read. Admin-only per rules; the query itself is always limited. */
export async function listRecords<T extends { id: string }>(
  col: RecordCollection,
  opts: { status?: EnquiryStatus | 'all'; cursorAfter?: unknown } = {},
): Promise<T[]> {
  const { db } = requireFirebase();
  const constraints = [
    ...(opts.status && opts.status !== 'all' ? [where('status', '==', opts.status)] : []),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE),
  ];
  const snap = await getDocs(query(collection(db, col), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as unknown as T);
}

/** Counts for the overview. Derived from real documents only. */
export async function countByStatus(col: RecordCollection): Promise<Record<EnquiryStatus, number>> {
  const { db } = requireFirebase();
  const statuses: EnquiryStatus[] = ['new', 'in_review', 'responded', 'closed'];
  const counts = await Promise.all(
    statuses.map((s) => getCountFromServer(query(collection(db, col), where('status', '==', s)))),
  );
  return Object.fromEntries(statuses.map((s, i) => [s, counts[i]?.data().count ?? 0])) as Record<EnquiryStatus, number>;
}

export async function updateRecordStatus(
  col: RecordCollection,
  id: string,
  input: { status: EnquiryStatus; internalNote?: string },
): Promise<void> {
  const parsed = adminEnquiryUpdateSchema.safeParse(input);
  if (!parsed.success) throw new AppError('validation', parsed.error.issues[0]?.message ?? 'Invalid update.');
  const { db, auth } = requireFirebase();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new AppError('unauthenticated', 'Please sign in again.');
  // Rules restrict admins to changing only status, internalNote, updatedAt and updatedBy.
  // updatedBy must equal the caller's uid, which lets the audit trigger record the actor.
  await updateDoc(doc(db, col, id), {
    status: parsed.data.status,
    internalNote: parsed.data.internalNote,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  });
}

/** Privileged role changes happen only in the Cloud Function, which re-checks the caller. */
export async function grantAdminRole(targetUid: string): Promise<void> {
  const fb = requireFirebase();
  const fn = httpsCallable<{ uid: string }, { ok: true }>(fb.functions, 'setAdminRole');
  await fn({ uid: targetUid });
}
