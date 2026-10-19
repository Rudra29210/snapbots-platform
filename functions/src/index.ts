import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall, HttpsError, onRequest } from 'firebase-functions/v2/https';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';
import { buildStatusAudit, type AuditedCollection } from './audit';
import { mergeAdminClaims, parseSetAdminInput } from './roles';

initializeApp();
const db = getFirestore();

/**
 * When true, callable functions reject requests without a valid App Check token.
 * Enable only after App Check is configured in the Firebase console, otherwise
 * legitimate traffic will be blocked.
 */
const APP_CHECK_ENFORCED = process.env['APP_CHECK_ENFORCED'] === 'true';

/**
 * Grants admin custom claim. Only an existing admin can call it. The browser cannot
 * set claims: this is the single path that writes them, and it records an audit event.
 */
export const setAdminRole = onCall({ enforceAppCheck: APP_CHECK_ENFORCED, maxInstances: 5 }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in to continue.');
  }
  if (request.auth.token['admin'] !== true) {
    logger.warn('admin_grant_denied', { actorUid: request.auth.uid });
    throw new HttpsError('permission-denied', 'Administrator access is required.');
  }

  const parsed = parseSetAdminInput(request.data);
  if (!parsed.ok) throw new HttpsError('invalid-argument', parsed.message);

  let target;
  try {
    target = await getAuth().getUser(parsed.uid);
  } catch {
    throw new HttpsError('not-found', 'No account matches that identifier.');
  }

  await getAuth().setCustomUserClaims(target.uid, mergeAdminClaims(target.customClaims, true));
  await db.collection('auditEvents').add({
    type: 'role.admin_granted',
    actorUid: request.auth.uid,
    targetUid: target.uid,
    at: FieldValue.serverTimestamp(),
  });
  logger.info('admin_granted', { actorUid: request.auth.uid, targetUid: target.uid });
  return { ok: true as const };
});

/** Writes a metadata-only audit event whenever a record's status or note changes. */
function auditOn(collection: AuditedCollection) {
  return onDocumentUpdated(`${collection}/{recordId}`, async (event) => {
    const auditEvent = buildStatusAudit(
      collection,
      event.params['recordId'] ?? '',
      event.data?.before.data(),
      event.data?.after.data(),
    );
    if (!auditEvent) return;
    await db.collection('auditEvents').add({ ...auditEvent, at: FieldValue.serverTimestamp() });
  });
}

export const auditEnquiryUpdates = auditOn('enquiries');
export const auditPartnershipUpdates = auditOn('partnerships');
export const auditSupportUpdates = auditOn('supportTickets');


/** Operational health probe. Returns no configuration or secret values. */
export const health = onRequest({ maxInstances: 2 }, (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, service: 'snapbots-functions', time: new Date().toISOString() });
});
