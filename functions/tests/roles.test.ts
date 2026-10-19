import { describe, expect, it } from 'vitest';
import { parseSetAdminInput, mergeAdminClaims } from '../src/roles';
import { buildStatusAudit } from '../src/audit';

describe('parseSetAdminInput', () => {
  it('accepts a plausible Firebase UID', () => {
    expect(parseSetAdminInput({ uid: 'abcdefghijklmnopqrst12' })).toEqual({ ok: true, uid: 'abcdefghijklmnopqrst12' });
  });

  it('rejects missing, short or malicious identifiers', () => {
    expect(parseSetAdminInput({}).ok).toBe(false);
    expect(parseSetAdminInput({ uid: 'short' }).ok).toBe(false);
    expect(parseSetAdminInput({ uid: 'abc/../../etc/passwd-xxxxxxxx' }).ok).toBe(false);
    expect(parseSetAdminInput({ uid: 42 }).ok).toBe(false);
  });
});

describe('mergeAdminClaims', () => {
  it('adds admin without dropping unrelated claims', () => {
    expect(mergeAdminClaims({ beta: true }, true)).toEqual({ beta: true, admin: true });
  });

  it('handles users with no existing claims', () => {
    expect(mergeAdminClaims(undefined, true)).toEqual({ admin: true });
  });
});

describe('buildStatusAudit', () => {
  it('records a status change with the actor', () => {
    const e = buildStatusAudit('enquiries', 'r1', { status: 'new' }, { status: 'in_review', updatedBy: 'admin-uid' });
    expect(e).toMatchObject({ fromStatus: 'new', toStatus: 'in_review', actorUid: 'admin-uid', noteChanged: false });
  });

  it('never copies note text into the audit event', () => {
    const e = buildStatusAudit('supportTickets', 'r2', { status: 'new', internalNote: '' }, { status: 'new', internalNote: 'Customer phone 555-0100', updatedBy: 'a' });
    expect(e).toMatchObject({ noteChanged: true, fromStatus: 'new', toStatus: 'new' });
    expect(JSON.stringify(e)).not.toContain('555-0100');
  });

  it('returns null when nothing audit-relevant changed', () => {
    expect(buildStatusAudit('enquiries', 'r3', { status: 'new' }, { status: 'new' })).toBeNull();
  });

  it('returns null when a document is created or deleted', () => {
    expect(buildStatusAudit('enquiries', 'r4', undefined, { status: 'new' })).toBeNull();
  });
});
