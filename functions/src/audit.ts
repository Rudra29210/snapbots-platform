/**
 * Builds an audit event for a record update. Only metadata is recorded:
 * internal note text is deliberately excluded so audit history does not copy personal data.
 */
export const AUDITED_COLLECTIONS = ['enquiries', 'partnerships', 'supportTickets'] as const;
export type AuditedCollection = (typeof AUDITED_COLLECTIONS)[number];

export interface AuditEvent {
  type: 'record.status_changed';
  collection: AuditedCollection;
  recordId: string;
  fromStatus: string | null;
  toStatus: string | null;
  actorUid: string | null;
  noteChanged: boolean;
}

interface RecordSnapshot {
  status?: unknown;
  internalNote?: unknown;
  updatedBy?: unknown;
}

export function buildStatusAudit(
  collection: AuditedCollection,
  recordId: string,
  before: RecordSnapshot | undefined,
  after: RecordSnapshot | undefined,
): AuditEvent | null {
  if (!before || !after) return null;
  const fromStatus = typeof before.status === 'string' ? before.status : null;
  const toStatus = typeof after.status === 'string' ? after.status : null;
  const noteChanged = (before.internalNote ?? '') !== (after.internalNote ?? '');
  if (fromStatus === toStatus && !noteChanged) return null;
  return {
    type: 'record.status_changed',
    collection,
    recordId,
    fromStatus,
    toStatus,
    actorUid: typeof after.updatedBy === 'string' ? after.updatedBy : null,
    noteChanged,
  };
}
